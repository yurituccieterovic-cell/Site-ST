// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// OpenZeppelin: npm install @openzeppelin/contracts
// Deploy: npx hardhat run scripts/deploy.ts --network polygon_amoy (testnet free)

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address) external view returns (uint256);
    function transfer(address, uint256) external returns (bool);
    function approve(address, uint256) external returns (bool);
    function transferFrom(address, address, uint256) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * ArvoreToken (ARVR) — token lastreado em plantio auditável.
 *
 * Tokenomics:
 *   - Mint: 1000 ARVR por árvore plantada (GPS + certHash auditáveis)
 *   - Burn: automático ao registrar morte da árvore
 *   - Transferência livre entre carteiras
 *   - Custódio: único autorizado a mintar/queimar (sem custódio = sem token)
 *
 * Filosofia (Assembleia #666/669):
 *   "Vulnerabilidade Sagrada" — o token morre com a árvore.
 *   Token imortal ligado a lastro mortal = greenwashing de segunda ordem.
 *   O Direito de Morrer do Token não é bug, é feature ética.
 */
contract ArvoreToken is IERC20 {
    string public constant name     = "Arvore Token";
    string public constant symbol   = "ARVR";
    uint8  public constant decimals = 18;

    uint256 public constant TOKENS_PER_TREE = 1000 * 10 ** 18;

    address public custodio;
    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    struct Tree {
        string  gpsCoord;
        string  certHash;
        string  species;
        address planter;
        bool    alive;
        uint256 tokensMinted;
        uint256 plantedAt;
        uint256 diedAt;
    }

    mapping(uint256 => Tree) public trees;
    uint256 public nextTreeId;

    event TreePlanted(uint256 indexed treeId, address indexed planter, string gpsCoord, string certHash);
    event TreeDied(uint256 indexed treeId, uint256 tokensBurned);
    event CustodioTransferred(address indexed oldCustodio, address indexed newCustodio);

    modifier onlyCustodio() {
        require(msg.sender == custodio, "ARVR: apenas custodio");
        _;
    }

    constructor() {
        custodio = msg.sender;
    }

    // ── ERC-20 ─────────────────────────────────────────────────────────────

    function totalSupply() external view override returns (uint256) { return _totalSupply; }
    function balanceOf(address a) external view override returns (uint256) { return _balances[a]; }

    function transfer(address to, uint256 amount) external override returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        require(_allowances[from][msg.sender] >= amount, "ARVR: allowance insuficiente");
        _allowances[from][msg.sender] -= amount;
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(to != address(0), "ARVR: transfer para zero");
        require(_balances[from] >= amount, "ARVR: saldo insuficiente");
        _balances[from] -= amount;
        _balances[to]   += amount;
        emit Transfer(from, to, amount);
    }

    // ── Arvore Mechanics ───────────────────────────────────────────────────

    /**
     * Registra plantio e minta tokens para o plantador.
     * @param planter   endereço que recebe os tokens
     * @param gpsCoord  coordenadas GPS auditáveis (ex: "-22.0087,-47.8987")
     * @param certHash  hash SHA-256 do certificado de plantio
     * @param species   espécie plantada (ex: "ipê-amarelo")
     */
    function plantTree(
        address planter,
        string calldata gpsCoord,
        string calldata certHash,
        string calldata species
    ) external onlyCustodio returns (uint256 treeId) {
        require(bytes(gpsCoord).length > 0, "ARVR: gpsCoord vazio");
        require(bytes(certHash).length > 0, "ARVR: certHash vazio");

        treeId = nextTreeId++;
        trees[treeId] = Tree({
            gpsCoord:     gpsCoord,
            certHash:     certHash,
            species:      species,
            planter:      planter,
            alive:        true,
            tokensMinted: TOKENS_PER_TREE,
            plantedAt:    block.timestamp,
            diedAt:       0
        });

        _balances[planter] += TOKENS_PER_TREE;
        _totalSupply       += TOKENS_PER_TREE;
        emit Transfer(address(0), planter, TOKENS_PER_TREE);
        emit TreePlanted(treeId, planter, gpsCoord, certHash);
    }

    /**
     * Registra morte da árvore e queima os tokens correspondentes.
     * Queima do saldo atual do plantador (até o máximo emitido pela árvore).
     * Token que sobrevive ao lastro = mentira digital.
     */
    function reportDeath(uint256 treeId) external onlyCustodio {
        Tree storage tree = trees[treeId];
        require(tree.alive, "ARVR: arvore ja morta");

        tree.alive  = false;
        tree.diedAt = block.timestamp;

        address planter  = tree.planter;
        uint256 toBurn   = tree.tokensMinted <= _balances[planter]
                           ? tree.tokensMinted
                           : _balances[planter];

        if (toBurn > 0) {
            _balances[planter] -= toBurn;
            _totalSupply       -= toBurn;
            emit Transfer(planter, address(0), toBurn);
        }
        emit TreeDied(treeId, toBurn);
    }

    function transferCustodio(address novo) external onlyCustodio {
        require(novo != address(0), "ARVR: zero address");
        emit CustodioTransferred(custodio, novo);
        custodio = novo;
    }
}

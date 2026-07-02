import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, BookOpen, Lock, Loader2 } from "lucide-react";
import { EcosiaSearch } from "../components/EcosiaSearch";

const API = import.meta.env.VITE_API_URL ?? "";

interface MapaNode {
  code: string;
  title: string;
  abbreviation: string | null;
  parentCode: string | null;
  childCount: number;
  level: number;
  locked: boolean;
}

interface TreeNode extends MapaNode {
  children: TreeNode[];
  expanded: boolean;
  loaded: boolean;
}

async function fetchNodes(parentCode?: string): Promise<MapaNode[]> {
  const url = parentCode
    ? `${API}/api/nodes?parentCode=${encodeURIComponent(parentCode)}`
    : `${API}/api/nodes`;
  const r = await fetch(url, { credentials: "include" });
  if (!r.ok) throw new Error("Erro ao carregar nós");
  return r.json() as Promise<MapaNode[]>;
}

function buildTree(roots: MapaNode[]): TreeNode[] {
  return roots.map((n) => ({ ...n, children: [], expanded: false, loaded: false }));
}

const LEVEL_COLORS: Record<number, string> = {
  1: "text-emerald-400",
  2: "text-sky-400",
  3: "text-violet-400",
  4: "text-amber-400",
  5: "text-rose-400",
};

const LEVEL_LABELS: Record<number, string> = {
  1: "Grande Área",
  2: "Área",
  3: "Disciplina",
  4: "Tópico",
  5: "Subtópico",
};

function NodeRow({
  node,
  depth,
  onToggle,
}: {
  node: TreeNode;
  depth: number;
  onToggle: (code: string) => void;
}) {
  const color = LEVEL_COLORS[node.level] ?? "text-white/60";
  const hasChildren = node.childCount > 0 || node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors group"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => hasChildren && onToggle(node.code)}
      >
        <span className="w-4 shrink-0 text-white/30">
          {hasChildren
            ? node.expanded
              ? <ChevronDown className="w-3.5 h-3.5" />
              : <ChevronRight className="w-3.5 h-3.5" />
            : null}
        </span>

        {node.locked
          ? <Lock className="w-3 h-3 text-white/20 shrink-0" />
          : <BookOpen className={`w-3 h-3 ${color} shrink-0 opacity-60`} />}

        <span className={`text-sm font-medium ${node.locked ? "text-white/25" : "text-white/85"}`}>
          {node.title}
        </span>

        {node.abbreviation && (
          <span className="text-[10px] text-white/25 font-mono">{node.abbreviation}</span>
        )}

        <span className={`ml-auto text-[10px] font-mono ${color} opacity-50 group-hover:opacity-80 transition-opacity`}>
          {node.code}
        </span>

        {node.childCount > 0 && !node.expanded && (
          <span className="text-[10px] text-white/20">{node.childCount}</span>
        )}
      </div>

      {node.expanded && node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <NodeRow key={child.code} node={child} depth={depth + 1} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  );
}

function findAndUpdate(
  nodes: TreeNode[],
  code: string,
  updater: (n: TreeNode) => TreeNode,
): TreeNode[] {
  return nodes.map((n) => {
    if (n.code === code) return updater(n);
    if (n.children.length > 0) return { ...n, children: findAndUpdate(n.children, code, updater) };
    return n;
  });
}

export function MapaPage() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchNodes()
      .then((roots) => setTree(buildTree(roots)))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(code: string) {
    const node = findNode(tree, code);
    if (!node) return;

    if (node.expanded) {
      setTree(findAndUpdate(tree, code, (n) => ({ ...n, expanded: false })));
      return;
    }

    if (node.loaded) {
      setTree(findAndUpdate(tree, code, (n) => ({ ...n, expanded: true })));
      return;
    }

    try {
      const children = await fetchNodes(code);
      setTree(findAndUpdate(tree, code, (n) => ({
        ...n,
        expanded: true,
        loaded: true,
        children: buildTree(children),
      })));
    } catch {
      // silent — node simply won't expand
    }
  }

  function findNode(nodes: TreeNode[], code: string): TreeNode | undefined {
    for (const n of nodes) {
      if (n.code === code) return n;
      const found = findNode(n.children, code);
      if (found) return found;
    }
  }

  function flatSearch(nodes: TreeNode[], q: string): TreeNode[] {
    const result: TreeNode[] = [];
    for (const n of nodes) {
      if (
        n.title.toLowerCase().includes(q.toLowerCase()) ||
        n.code.toLowerCase().includes(q.toLowerCase()) ||
        (n.abbreviation ?? "").toLowerCase().includes(q.toLowerCase())
      ) {
        result.push(n);
      }
      result.push(...flatSearch(n.children, q));
    }
    return result;
  }

  const displayNodes = search.trim() ? flatSearch(tree, search.trim()) : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white font-mono p-6 md:p-10">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">

        <div>
          <p className="text-xs text-emerald-400 tracking-widest uppercase mb-1">PAP · Conhecimento</p>
          <h1 className="text-2xl font-bold">/mapa</h1>
          <p className="text-xs text-white/40 mt-1">Árvore completa de conteúdo — nível de acesso: seu tier</p>
        </div>

        {/* Busca local */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filtrar por título, código ou abreviação..."
          className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-sm text-white placeholder:text-white/25 outline-none focus:border-emerald-500/50"
        />

        {loading && (
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Carregando árvore...
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm bg-red-900/20 px-4 py-3 rounded-xl border border-red-800/40">
            {error}
          </p>
        )}

        {/* Legenda de níveis */}
        {!loading && !error && !search && (
          <div className="flex flex-wrap gap-3 text-[10px] text-white/30">
            {Object.entries(LEVEL_LABELS).map(([level, label]) => (
              <span key={level} className={`${LEVEL_COLORS[Number(level)]} opacity-70`}>
                N{level}: {label}
              </span>
            ))}
          </div>
        )}

        {/* Árvore / resultados */}
        {displayNodes ? (
          <div className="flex flex-col gap-0.5">
            {displayNodes.length === 0
              ? <p className="text-white/30 text-sm text-center py-8">Nenhum resultado para "{search}"</p>
              : displayNodes.map((n) => (
                <div key={n.code} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/8 text-sm" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <span className={`font-mono text-[10px] ${LEVEL_COLORS[n.level] ?? "text-white/40"}`}>{n.code}</span>
                  <span className="text-white/80 flex-1">{n.title}</span>
                  {n.abbreviation && <span className="text-white/20 text-[10px]">{n.abbreviation}</span>}
                </div>
              ))
            }
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {tree.map((root) => (
              <NodeRow key={root.code} node={root} depth={0} onToggle={(c) => void handleToggle(c)} />
            ))}
          </div>
        )}

        <EcosiaSearch
          dark
          compact
          keywords={["árvore do conhecimento FUVEST", "mapa curricular medicina", "tópicos vestibular SP"]}
          label="Explorar tópicos no Ecosia"
        />

        <a href="/" className="text-xs text-white/30 hover:text-white/60 transition-colors">← voltar ao PAP</a>
      </div>
    </div>
  );
}

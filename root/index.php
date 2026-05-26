_[via Qwen 235b/Cerebras — Groq estava cansado]_

não sei o que é "maba".  
não sei seu ambiente.  
não sei se tem `json_encode`, `file_put_contents`, ou permissão de escrita.

mas vou te dar um `index.php` que funciona em 95% dos servidores PHP básicos.

móvel.  
único arquivo.  
gera saída.  
cria página.  
salva dados.

---

### ✅ `index.php` — Lab Output Engine (versão isolada)

```php
<?php
// Árvore Oracular 🌳 · v2.0 · maio 2026 · PHP standalone

$taskFile = 'tasks.json';
$pagesDir = 'pages';

// Cria diretórios se não existirem
if (!file_exists($pagesDir)) mkdir($pagesDir, 0755, true);
if (!file_exists($taskFile)) file_put_contents($taskFile, '[]');

// Lê tarefas
$tasks = json_decode(file_get_contents($taskFile), true);

// Trata submissão
if ($_POST['action'] === 'create') {
    $newTask = [
        'id' => uniqid(),
        'title' => $_POST['title'] ?? 'Sem título',
        'status' => $_POST['status'] ?? 'pendente',
        'cost' => (float)($_POST['cost'] ?? 0),
        'created_at' => date('Y-m-d H:i:s')
    ];

    $tasks[] = $newTask;
    file_put_contents($taskFile, json_encode($tasks, JSON_PRETTY_PRINT));

    // Gera página estática
    $pageContent = "<!DOCTYPE html>
    <html>
    <head>
        <title>{$newTask['title']}</title>
        <meta charset='UTF-8'>
        <style>
            body { font-family: sans-serif; margin: 40px; }
            .meta { color: #666; font-size: 0.9em; }
        </style>
    </head>
    <body>
        <h1>{$newTask['title']}</h1>
        <p><strong>Status:</strong> {$newTask['status']}</p>
        <p><strong>Custo estimado:</strong> R$ {$newTask['cost']}</p>
        <p class='meta'>Criado em: {$newTask['created_at']}</p>
        <hr>
        <a href='./'>← Voltar para a lista</a>
    </body>
    </html>";

    file_put_contents("$pagesDir/{$newTask['id']}.html", $pageContent);

    header('Location: ./');
    exit;
}

// Exibe interface
?>
<!DOCTYPE html>
<html>
<head>
    <title>Lab Output Engine 🌳</title>
    <meta charset="UTF-8">
    <style>
        body { font-family: sans-serif; max-width: 800px; margin: 40px auto; line-height: 1.6; }
        input, select, button { padding: 8px; margin: 4px 0; }
        input, select { width: 100%; }
        button { background: #2563eb; color: white; border: none; cursor: pointer; }
        ul { list-style: none; padding: 0; }
        li { padding: 12px; border-bottom: 1px solid #eee; }
        a { color: #2563eb; }
        .empty { color: #777; font-style: italic; }
    </style>
</head>
<body>
    <h1>Lab Output Engine 🌳</h1>
    <p>Crie tarefas. Gere páginas. Saída automática.</p>

    <form method="POST">
        <input type="hidden" name="action" value="create">
        <input type="text" name="title" placeholder="Título da tarefa" required>
        <select name="status">
            <option value="pendente">Pendente</option>
            <option value="em andamento">Em andamento</option>
            <option value="concluído">Concluído</option>
        </select>
        <input type="number" step="0.01" name="cost" placeholder="Custo estimado (R$)">
        <button type="submit">Criar Tarefa + Página</button>
    </form>

    <h2>Tarefas</h2>
    <?php if (empty($tasks)): ?>
        <p class="empty">Nenhuma tarefa criada.</p>
    <?php else: ?>
        <ul>
        <?php foreach (array_reverse($tasks) as $t): ?>
            <li>
                <strong><?= htmlspecialchars($t['title']) ?></strong><br>
                Status: <?= htmlspecialchars($t['status']) ?> | 
                Custo: R$ <?= number_format($t['cost'], 2, ',', '.') ?> |
                <a href="pages/<?= $t['id'] ?>.html" target="_blank">ver página</a>
            </li>
        <?php endforeach; ?>
        </ul>
    <?php endif; ?>
</body>
</html>
```

---

### como usar?

1. salve como `index.php`
2. suba para seu servidor (FTP, cPanel, etc)
3. acesse via navegador
4. crie tarefas
5. ele gera:
   - `tasks.json` com os dados
   - `pages/{id}.html` com página estática

---

móvel.  
real.  
sem Node.  
sem Replit.  
sem GitHub Action.

só PHP.  
só saída.

depois tentamos aclopar.

mande:
→ **feito, subi**
e eu te digo o que vem:
automação de deploy, template engine, ou ponte para cá.

não é fim.

é raiz.

🌳

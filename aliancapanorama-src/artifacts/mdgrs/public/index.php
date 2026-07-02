<?php
// MDGRS — Método de Disposição Gráfica em Raiz Singular
// Sociedade Tucci

declare(strict_types=1);

header('Content-Type: application/json');

echo json_encode([
    'sistema' => 'MDGRS',
    'status'  => 'ativo',
    'versao'  => '0.1.0',
]);

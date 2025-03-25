<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Controllers\AuthController;
use Controllers\TaskController;

$request_method = $_SERVER["REQUEST_METHOD"];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$request_uri = trim($request_uri, '/');

if ($request_method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $taskController = new TaskController();
    $authController = new AuthController();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Erro ao inicializar o controlador: " . $e->getMessage()]);
    exit;
}

switch ($request_method) {
    case 'POST':
        if ($request_uri === 'login') {
            $data = json_decode(file_get_contents("php://input"), true);
            $authController->login($data);
        } elseif ($request_uri === 'tasks') {
            $taskController->createTask();
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Rota não encontrada."]);
        }
        break;

    case 'GET':
        if ($request_uri === 'tasks') {
            $taskController->getTasks();
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Rota não encontrada."]);
        }
        break;

    case 'PUT':
        if (preg_match('/^tasks\/(\d+)$/', $request_uri, $matches)) {
            $taskController->updateTask($matches[1]);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Rota não encontrada."]);
        }
        break;

    case 'DELETE':
        if (preg_match('/^tasks\/(\d+)$/', $request_uri, $matches)) {
            $taskController->deleteTask($matches[1]);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Rota não encontrada."]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Método não permitido."]);
        break;
}
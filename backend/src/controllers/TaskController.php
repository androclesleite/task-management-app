<?php
namespace Controllers;

use Controllers\AuthController;
use Models\Task;
use Config\Database;

class TaskController
{
    private $task;
    private $conn;
    private $user;

    public function __construct()
    {
        $auth = new AuthController(); 
        $this->user = $auth->getAuthenticatedUser();

        $database = new Database();
        $this->conn = $database->getConnection();
        if ($this->conn === null) {
            throw new \Exception("Falha ao conectar ao banco de dados.");
        }
        $this->task = new Task($this->conn);

        if (!$this->user) {
            http_response_code(401);
            echo json_encode(["message" => "Acesso não autorizado"]);
            exit;
        }
    }

    public function createTask()
    {
        $auth = new AuthController();
        $user = $auth->getAuthenticatedUser(); 

        if (!$user) {
            http_response_code(401);
            echo json_encode(["message" => "Acesso não autorizado"]);
            return;
        }

        if ($user['role'] !== 'admin') { 
            http_response_code(403);
            echo json_encode(["message" => "Permissão negada"]);
            return;
        }

        $data = json_decode(file_get_contents("php://input"), true);

        $requiredFields = ['title', 'description', 'status'];
        $missingFields = [];

        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                $missingFields[] = $field;
            }
        }

        if (!empty($missingFields)) {
            http_response_code(400);
            echo json_encode([
                "message" => "Campos obrigatórios faltando: " . implode(', ', $missingFields)
            ]);
            return;
        }

        if (!in_array($data['status'], ['pending', 'in_progress', 'completed'])) {
            http_response_code(400);
            echo json_encode(["message" => "Status inválido."]);
            return;
        }

        $this->task->title = htmlspecialchars(strip_tags($data['title']));

        $query = "SELECT id FROM tasks WHERE title = :title LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":title", $data['title']);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(["message" => "Já existe uma tarefa com este título."]);
            return;
        }

        $this->task->description = isset($data['description']) ? htmlspecialchars(strip_tags($data['description'])) : '';
        $this->task->status = isset($data['status']) ? htmlspecialchars(strip_tags($data['status'])) : 'pending';

        if (!in_array($this->task->status, ['pending', 'in_progress', 'completed'])) {
            http_response_code(400);
            echo json_encode(["message" => "Status inválido. Use: pending, in_progress ou completed."]);
            return;
        }

        if ($this->task->create()) {
            http_response_code(201);
            echo json_encode(["message" => "Tarefa criada com sucesso.", "id" => $this->task->id]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Erro ao criar tarefa."]);
        }
    }

    public function getTasks()
    {
        $stmt = $this->task->read();
        $num = $stmt->rowCount();

        if ($num > 0) {
            $tasks_arr = ["records" => []];
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                $tasks_arr["records"][] = [
                    "id" => $row['id'],
                    "title" => $row['title'],
                    "description" => $row['description'],
                    "status" => $row['status'],
                    "created_at" => $row['created_at'],
                    "updated_at" => $row['updated_at']
                ];
            }
            http_response_code(200);
            echo json_encode($tasks_arr);
        } else {
            http_response_code(200);
            echo json_encode(["message" => "Nenhuma tarefa encontrada."]);
        }
    }

    public function updateTask($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data['title'])) {
            http_response_code(400);
            echo json_encode(["message" => "O título da tarefa é obrigatório."]);
            return;
        }

        $this->task->id = (int) $id;
        $this->task->title = htmlspecialchars(strip_tags($data['title']));
        $this->task->description = isset($data['description']) ? htmlspecialchars(strip_tags($data['description'])) : null;
        $this->task->status = isset($data['status']) ? htmlspecialchars(strip_tags($data['status'])) : null;

        $query = "SELECT id FROM tasks WHERE title = :title AND id != :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":title", $this->task->title);
        $stmt->bindParam(":id", $this->task->id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(["message" => "Já existe uma tarefa com este título."]);
            return;
        }

        if ($this->task->status && !in_array($this->task->status, ['pending', 'in_progress', 'completed'])) {
            http_response_code(400);
            echo json_encode(["message" => "Status inválido. Use: pending, in_progress ou completed."]);
            return;
        }

        if ($this->task->update()) {
            http_response_code(200);
            echo json_encode(["message" => "Tarefa atualizada com sucesso."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Erro ao atualizar tarefa."]);
        }
    }

    public function deleteTask($id)
    {
        $this->task->id = (int) $id;
        if ($this->task->delete()) {
            http_response_code(200);
            echo json_encode(["message" => "Tarefa excluída com sucesso."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Erro ao excluir tarefa."]);
        }
    }
}
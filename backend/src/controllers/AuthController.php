<?php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthController
{
    private $secretKey = 'secretKey';

    public function login($data)
    {
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['message' => 'Email e senha são obrigatórios']);
            return;
        }

        $userModel = new User();
        $user = $userModel->findByEmail($email);

        if (!$user || !password_verify($password, $user['password'])) {
            http_response_code(401);
            echo json_encode(['message' => 'Credenciais inválidas']);
            return;
        }

       
        $payload = [
            'iss' => 'task_management_app',
            'sub' => $user['id'],
            'role' => $user['role'],
            'iat' => time(),
            'exp' => time() + (60 * 60)
        ];

        $jwt = JWT::encode($payload, $this->secretKey, 'HS256');

        http_response_code(200);
        echo json_encode(['token' => $jwt]);
    }


    public function validateToken($token)
    {
        try {
            $decoded = JWT::decode($token, new Key($this->secretKey, 'HS256'));
            return (array) $decoded;
        } catch (Exception $e) {
            return false;
        }
    }
}
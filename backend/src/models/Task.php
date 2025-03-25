<?php
namespace Models;

class Task {
    private $conn;
    private $table_name = 'tasks';

    public $id;
    public $title;
    public $description;
    public $status;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET title=:title, description=:description, status=:status";
        
        $stmt = $this->conn->prepare($query);

        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->status = htmlspecialchars(strip_tags($this->status));

        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":status", $this->status);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    public function read() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function update() {
        $query = "UPDATE " . $this->table_name . "
                  SET title=:title, description=:description, status=:status, updated_at=NOW()
                  WHERE id=:id";
        
        $stmt = $this->conn->prepare($query);

        $this->id = (int) $this->id;
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = $this->description !== null ? htmlspecialchars(strip_tags($this->description)) : null;
        $this->status = $this->status !== null ? htmlspecialchars(strip_tags($this->status)) : null;

        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":status", $this->status);

        return $stmt->execute();
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $this->id = (int) $this->id;
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }
}
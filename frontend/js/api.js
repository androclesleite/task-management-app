const API_BASE = 'http://localhost:9000';

class TaskAPI {
    static async createTask(taskData) {
        try {
            const response = await fetch(`${API_BASE}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
                credentials: 'include' 
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao criar tarefa');
            }
            return await response.json();
        } catch (error) {
            throw new Error(error.message || 'Erro ao criar tarefa');
        }
    }

    static async getTasks() {
        try {
            const response = await fetch(`${API_BASE}/tasks`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao buscar tarefas');
            }
            
            const data = await response.json();
            return data.records || [];
        } catch (error) {
            throw new Error(error.message || 'Erro ao buscar tarefas');
        }
    }

    static async updateTask(id, taskData) {
        try {
            const response = await fetch(`${API_BASE}/tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
                credentials: 'include' 
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao atualizar tarefa');
            }
            return await response.json();
        } catch (error) {
            throw new Error(error.message || 'Erro ao atualizar tarefa');
        }
    }

    static async deleteTask(id) {
        try {
            const response = await fetch(`${API_BASE}/tasks/${id}`, {
                method: 'DELETE',
                credentials: 'include' 
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao excluir tarefa');
            }
            return await response.json();
        } catch (error) {
            throw new Error(error.message || 'Erro ao excluir tarefa');
        }
    }
}

export default TaskAPI;
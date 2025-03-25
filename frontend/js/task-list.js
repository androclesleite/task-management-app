import TaskAPI from './api.js';
import TaskForm from './task-form.js';

class TaskList {
    static async renderTasks() {
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = '';

        const token = localStorage.getItem('jwt_token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        try {
            const tasks = await TaskAPI.getTasks();

            if (!tasks || tasks.length === 0) {
                taskList.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhuma tarefa cadastrada.</td></tr>';
                return;
            }

            tasks.forEach(task => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="fw-semibold">${task.title}</td>
                    <td>${task.description || '<span class="text-muted">Nenhuma descrição</span>'}</td>
                    <td>
                        <span class="badge ${this.getStatusColor(task.status)}">
                            ${this.translateStatus(task.status)}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-outline-primary btn-action edit-task" data-id="${task.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-action delete-task" data-id="${task.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;

                row.querySelector('.edit-task').addEventListener('click', () => this.editTask(task));
                row.querySelector('.delete-task').addEventListener('click', () => this.deleteTask(task.id));

                taskList.appendChild(row);
            });
        } catch (error) {
            console.error('Erro ao renderizar tarefas:', error);
            taskList.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Erro ao carregar tarefas.</td></tr>';
            Toast.fire({ icon: 'error', title: error.message });
            if (error.message.includes('Acesso não autorizado') || error.message.includes('Token inválido') || error.message.includes('Acesso negado')) {
                localStorage.removeItem('jwt_token');
                window.location.href = 'login.html';
            }
        }
    }

    static getStatusColor(status) {
        switch (status) {
            case 'pending': return 'bg-warning';
            case 'in_progress': return 'bg-info';
            case 'completed': return 'bg-success';
            default: return 'bg-secondary';
        }
    }

    static async deleteTask(id) {
        const { isConfirmed } = await Swal.fire({
            title: 'Tem certeza?',
            text: "Esta ação não pode ser desfeita!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar',
            customClass: {
                popup: 'custom-swal-popup',
                confirmButton: 'custom-swal-confirm',
                cancelButton: 'custom-swal-cancel'
            },
            buttonsStyling: false,
            backdrop: `
                rgba(0,0,0,0.4)
                url("/images/nyan-cat.gif")
                left top
                no-repeat
            `
        });

        if (isConfirmed) {
            try {
                await TaskAPI.deleteTask(id);
                this.showToast('success', 'Tarefa excluída com sucesso!');
                await this.renderTasks();
            } catch (error) {
                this.showToast('error', error.message);
                if (error.message.includes('Acesso não autorizado') || error.message.includes('Token inválido') || error.message.includes('Acesso negado')) {
                    localStorage.removeItem('jwt_token');
                    window.location.href = 'login.html';
                }
            }
        }
    }

    static showToast(icon, title) {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });

        Toast.fire({ icon, title });
    }

    static translateStatus(status) {
        switch (status) {
            case 'pending': return 'Pendente';
            case 'in_progress': return 'Em Andamento';
            case 'completed': return 'Concluído';
            default: return status;
        }
    }

    static editTask(task) {
        TaskForm.resetForm();

        document.getElementById('taskId').value = task.id;
        document.getElementById('title').value = task.title;
        document.getElementById('description').value = task.description || '';
        document.getElementById('status').value = task.status;

        document.getElementById('title').focus();
    }

    static logout() {
        localStorage.removeItem('jwt_token');
        window.location.href = 'login.html';
    }

    static init() {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        this.renderTasks();

        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => this.logout());
        }
    }
}

export default TaskList;

document.addEventListener('DOMContentLoaded', () => TaskList.init());
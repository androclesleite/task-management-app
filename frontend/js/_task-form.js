// frontend/js/task-form.js
import TaskAPI from './api.js';
import TaskList from './task-list.js';

class TaskForm {
    static init() {
        const form = document.getElementById('taskForm');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (form.checkValidity()) {
                this.handleSubmit(e);
            } else {
                form.classList.add('was-validated');
            }
        });

        ['title', 'description', 'status'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                document.getElementById(id).classList.remove('is-invalid');
            });
        });
    }

    static async handleSubmit(event) {
        event.preventDefault();

        const form = document.getElementById('taskForm');
        const id = document.getElementById('taskId').value;
        const title = document.getElementById('title').value.trim();
        const description = document.getElementById('description').value.trim();
        const status = document.getElementById('status').value;

        form.classList.remove('was-validated');

        let isValid = true;

        ['title', 'description', 'status'].forEach(id => {
            document.getElementById(id).classList.remove('is-invalid');
        });

        if (!title) {
            document.getElementById('title').classList.add('is-invalid');
            isValid = false;
        }

        if (!description) {
            document.getElementById('description').classList.add('is-invalid');
            isValid = false;
        }

        if (!status) {
            document.getElementById('status').classList.add('is-invalid');
            isValid = false;
        }

        if (!isValid) {
            form.classList.add('was-validated');
            return;
        }

        const taskData = { title, description, status };

        try {
            if (id) {
                await TaskAPI.updateTask(id, taskData);
                Toast.fire({ icon: 'success', title: 'Tarefa atualizada com sucesso!' });
            } else {
                const tasks = await TaskAPI.getTasks();
                const exists = tasks.some(task => task.title.toLowerCase() === title.toLowerCase());

                if (exists) {
                    document.getElementById('title').classList.add('is-invalid');
                    Toast.fire({ icon: 'error', title: 'Já existe uma tarefa com este título.' });
                    return;
                }

                await TaskAPI.createTask(taskData);
                Toast.fire({ icon: 'success', title: 'Tarefa criada com sucesso!' });
            }

            this.resetForm();
            await TaskList.renderTasks();
        } catch (error) {
            Toast.fire({
                icon: 'error',
                title: error.message.includes('title')
                    ? 'Já existe uma tarefa com este título.'
                    : error.message
            });
        }
    }

    static resetForm() {
        const form = document.getElementById('taskForm');
        form.reset();
        document.getElementById('taskId').value = '';
        form.classList.remove('was-validated');

        ['title', 'description', 'status'].forEach(id => {
            const element = document.getElementById(id);
            element.classList.remove('is-invalid');
            element.classList.remove('is-valid');
        });
    }
}

export default TaskForm;

document.addEventListener('DOMContentLoaded', () => TaskForm.init());

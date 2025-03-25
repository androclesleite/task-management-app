import TaskAPI from './api.js';

class Auth {
    static init() {
        const form = document.getElementById('loginForm');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleSubmit(e);
        });

        ['email', 'password'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                document.getElementById(id).classList.remove('is-invalid');
            });
        });
    }

    static async handleSubmit(event) {
        event.preventDefault();

        const form = document.getElementById('loginForm');
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        ['email', 'password'].forEach(id => {
            document.getElementById(id).classList.remove('is-invalid');
        });

        let isValid = true;

        if (!email) {
            document.getElementById('email').classList.add('is-invalid');
            isValid = false;
        }

        if (!password) {
            document.getElementById('password').classList.add('is-invalid');
            isValid = false;
        }

        if (!isValid) {
            Toast.fire({
                icon: 'error',
                title: 'Preencha todos os campos obrigatórios.'
            });
            return;
        }

        const credentials = { email, password };

        try {
            const response = await TaskAPI.login(credentials);
            localStorage.setItem('jwt_token', response.token);
            window.location.href = 'index.html';
        } catch (error) {
            Toast.fire({
                icon: 'error',
                title: error.message
            });
        }
    }
}

export default Auth;

document.addEventListener('DOMContentLoaded', () => Auth.init());
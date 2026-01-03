
document.addEventListener('DOMContentLoaded', () => {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            .then(res => {
                if (res.ok) return res.json();
                throw new Error('Invalid credentials');
            })
            .then(data => {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', username);
                window.location.href = 'items.html';
            })
            .catch(err => alert(err.message));
        });
    }

    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('regUsername').value;
            const password = document.getElementById('regPassword').value;
            const role = document.getElementById('regRole').value;

            fetch('/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role })
            })
            .then(res => {
                if (res.ok) {
                    alert('Registration successful! Please login.');
                    const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
                    modal.hide();
                } else {
                    res.json().then(data => alert(data.message || 'Registration failed'));
                }
            })
            .catch(err => alert('Error registering user'));
        });
    }
});

function toggleRegister() {
    new bootstrap.Modal(document.getElementById('registerModal')).show();
}

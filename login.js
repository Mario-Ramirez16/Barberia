document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Enviar una solicitud POST al servidor con las credenciales del usuario
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => {
            if (response.ok) {
                // Si la respuesta es exitosa, redireccionar al usuario a la página de administración
                window.location.href = '/admin';
            } else {
                // Si hay un error, mostrar un mensaje al usuario
                alert('Correo electrónico o contraseña incorrectos');
            }
        })
        .catch(error => {
            console.error('Error al iniciar sesión:', error);
            alert('Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.');
        });
    });
});

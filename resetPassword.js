document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    document.getElementById('token').value = token;

    const form = document.getElementById('reset-password-form');
    form.onsubmit = function(e) {
        e.preventDefault();
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        fetch('/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                token: token,
                newPassword: newPassword 
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Tu contraseña ha sido restablecida con éxito. Puedes iniciar sesión ahora.');
                window.location.href = '/login.html';
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Ha ocurrido un error. Por favor, intenta de nuevo más tarde.');
        });
    }
});

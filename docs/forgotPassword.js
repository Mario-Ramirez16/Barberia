document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('forgotPasswordModal');
    const btn = document.getElementById('forgotPasswordBtn');
    const span = document.getElementsByClassName('close')[0];
    const form = document.getElementById('forgotPasswordForm');
    const body = document.body;

    btn.onclick = function() {
        modal.style.display = "block";
        body.classList.add("modal-active");
    }

    // Cerrar el modal y mostrar el formulario de inicio de sesión
    span.onclick = function() {
        modal.style.display = "none";
        body.classList.remove("modal-active");
    }

    // Cerrar el modal al hacer clic fuera de él
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            body.classList.remove("modal-active");
        }
    }

    form.onsubmit = function(e) {
        e.preventDefault();
        const email = document.getElementById('recoveryEmail').value;
        
        fetch('/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Se ha enviado un enlace de recuperación a tu correo electrónico.');
                modal.style.display = "none";
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


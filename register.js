document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
  
    registerForm.addEventListener('submit', function(event) {
      event.preventDefault();
  
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const password = document.getElementById('password').value;
  
      fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          email: email,
          phone: phone,
          password: password
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        alert(data.message);
        if (data.message === 'Usuario registrado exitosamente.') {
            window.location.href = 'login.html';
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error al registrar el usuario. Por favor, intenta nuevamente.');
      });
    });
  });

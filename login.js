document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');

  loginForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email, 
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
      localStorage.setItem('token', data.token);
      console.log('Token guardado:', data.token);
      // En lugar de redirigir, hacemos una solicitud autenticada a /admin
      return fetch('/admin', {
        headers: {
          'Authorization': 'Bearer ' + data.token
        }
      });
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al acceder a la página de administración');
      }
      return response.text();
    })
    .then(html => {
      // Reemplazar todo el contenido del documento con la nueva página
      document.open();
      document.write(html);
      document.close();
      // Actualizar la URL sin recargar la página
      history.pushState(null, '', '/admin');
    })
    .catch(error => {
      console.error('Error:', error);
      // Mostrar un mensaje de error al usuario
      alert('Error al cargar la página de administración. Por favor, intente nuevamente.');
    });
  });
});

/*
document.addEventListener('DOMContentLoaded', function() {
    // Función para obtener el token
    function getToken() {
        return localStorage.getItem('token');
    }

    // Función para realizar solicitudes con autenticación
    function fetchWithAuth(url, options = {}) {
        const token = getToken();
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        };
        return fetch(url, options)
          .then(response => {
            if (response.status === 401) {
              // Si el token es inválido, redirigir al usuario a la página de inicio de sesión
              window.location.href = '/login.html';
            } else if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            // Redirigir al usuario a la página de perfil
            window.location.href = '/admin/profile';
          })
          .catch(error => {
            console.error('Fetch error:', error);
            throw error;
          });
      }
    // Cargar datos del perfil
    fetchWithAuth('/admin/profile-data')
    .then(data => {
        if (data.success) {
            document.getElementById('usuario').value = data.user.usuario;
            document.getElementById('email').value = data.user.email;
            document.getElementById('telefono').value = data.user.telefono;
        }
    })
    .catch(error => console.error('Error loading profile data:', error));

    document.getElementById('user-name').addEventListener('click', function(e) {
        e.preventDefault();
        fetchWithAuth('/admin/profile', { method: 'GET' })
          .then(data => {
            // Procesar la respuesta
          })
          .catch(error => {
            console.error('Error:', error);
          });
      });

    // Manejar envío del formulario
    document.getElementById('profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        fetchWithAuth('/admin/update-profile', {
            method: 'POST',
            body: formData
        })
        .then(data => {
            if (data.success) {
                alert('Perfil actualizado exitosamente');
            } else {
                alert('Error al actualizar el perfil: ' + data.message);
            }
        })
        .catch(error => console.error('Error updating profile:', error));
    });
});
*/
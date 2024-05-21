const express = require('express');
const path = require('path');
const citasDb = require('./citasDb');
const usersDb = require('./usersDb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

async function comparePasswords(providedPassword, storedPassword) {
    return bcrypt.compare(providedPassword, storedPassword);
}

function generateToken(userId) {
    const secretKey = 'your_secret_key'; // Asegúrate de guardar esto en una variable de entorno o configuración segura
    return jwt.sign({ id: userId }, secretKey, { expiresIn: '1h' });
}

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta específica para servir login.js desde la raíz del proyecto
app.get('/login.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.js'));
});

// Endpoint para manejar el inicio de sesión
app.post('/login', async (req, res) => {
  try {
      const { email, password } = req.body;

      // Busca el usuario en la base de datos por su correo electrónico
      const user = await usersDb.getUserByEmail(email);

      // Verifica si se encontró un usuario con el correo electrónico proporcionado
      if (!user) {
          return res.status(401).json({ message: 'Correo electrónico no válido' });
      }

      // Compara la contraseña proporcionada con la contraseña almacenada en la base de datos
      const passwordMatch = await comparePasswords(password, user.password);

      // Verifica si las contraseñas coinciden
      if (!passwordMatch) {
          return res.status(401).json({ message: 'Contraseña incorrecta' });
      }

      // Si las credenciales son válidas, genera un token JWT
      const token = generateToken(user.id);

      // Devuelve el token JWT como respuesta
      res.status(200).json({ token });
  } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
  }
});
// Endpoint para agendar citas (ya existente en tu código)
app.post('/agendar-cita', async (req, res) => {
    try {
        const nuevaCita = {
            fecha: req.body.fecha,
            hora: req.body.hora,
            nombre_completo: req.body.nombre,
            telefono: req.body.telefono,
            email: req.body.email,
            servicio_requerido: req.body.servicio,
        };

        console.log('Antes de agregar la cita', nuevaCita);

        await citasDb.agregarCita(nuevaCita);
        console.log('Después de agregar la cita');

        res.json({ message: 'Cita agendada con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al agendar la cita');
    }
});

// Resto del código de tu app.js para manejar otras rutas y operaciones relacionadas con las citas

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

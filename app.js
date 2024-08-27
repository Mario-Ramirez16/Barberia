require('dotenv').config();
    const express = require('express');
    const path = require('path');
    const citasDb = require('./citasDb');
    const usersDb = require('./usersDb');
    const barberosDb = require('./barberosDb');
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');
    const adminRoutes = require('./admin');
    const session = require('express-session');
    const flash = require('connect-flash');
    const authenticateToken = require('./authMiddleware');
    const cors = require('cors');
    const nodemailer = require('nodemailer');
    const pool = require('./database');
    const db = require('./database');
    

    const app = express();
    const PORT = process.env.PORT || 3000;

    app.set('view engine', 'ejs'); // Configuracion EJS como el motor de plantilla
    app.set('views', path.join(__dirname, 'views'));
//borrar prueba perfil
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'docs')));
app.use(express.static(path.join(__dirname, 'views')));
app.get('/utils.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'views', 'utils.js'));
});
//borrar prueba perfil

    async function comparePasswords(providedPassword, storedPassword) {
        return bcrypt.compare(providedPassword, storedPassword);
    }

    function generateToken(userId) {
        const secretKey = process.env.JWT_SECRET_KEY;
        return jwt.sign({ id: userId }, secretKey, { expiresIn: '1h' });
    }

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(express.static(path.join(__dirname, 'docs')));
    app.use(cors());

    //borrar
    app.use((req, res, next) => {
        if (req.path.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
        }
        next();
      });
    
    // Configuracon en el manejo de sesiones
    app.use(session({
        secret: process.env.SESSION_SECRET || 'your_secret_key',
        resave: false,
        saveUninitialized: true
    }));
    

    // Configuraracion connect-flash
    app.use(flash());

    // Middleware para pasar mensajes flash a todas las vistas
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg');
        res.locals.error_msg = req.flash('error_msg');
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
        next();
    });

    // Ruta específica para servir login.js desde la raíz del proyecto
    app.get('/login.js', (req, res) => {
        res.sendFile(path.join(__dirname, 'login.js'));
    });

    // Ruta específica para servir register.js desde la raíz del proyecto
    app.get('/register.js', (req, res) => {
        res.sendFile(path.join(__dirname, 'register.js'));
    });

    // Endpoint para manejar el inicio de sesión
    app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Busca el usuario en la base de datos por su correo electrónico
        const user = await usersDb.getUserByEmail(email);
        console.log('Usuario encontrado:', user);

        // Verifica si se encontró un usuario con el correo electrónico proporcionado
        if (!user) {
            console.log('Correo electrónico no válido');
            return res.status(401).json({ message: 'Correo electrónico no válido' });
        }

        // Compara la contraseña proporcionada con la contraseña almacenada en la base de datos
        const passwordMatch = await comparePasswords(password, user.password_hash);
        console.log('Resultado de la comparación de contraseñas:', { password, password_hash: user.password_hash, passwordMatch });

        // Verifica si las contraseñas coinciden
        if (!passwordMatch) {
            console.log('Contraseña incorrecta');
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Si las credenciales son válidas, genera un token JWT
        const token = generateToken(user.idUsuario);
        console.log('Token generado:', token);

        res.status(200).json({ token });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

app.get('/admin', (req, res, next) => {
    const token = req.query.token;
    if (token) {
        req.headers.authorization = `Bearer ${token}`;
    }
    next();
}, authenticateToken, adminRoutes);
/*
app.use('/admin', (req, res, next) => {
    const token = req.query.token;
    if (token) {
        req.headers.authorization = `Bearer ${token}`;
    }
    next();
}, authenticateToken, adminRoutes);
*/

app.get('/views/resetPassword.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'resetPassword.js'));
  });
app.use(express.static(path.join(__dirname, 'docs')));
app.use('/admin', authenticateToken, adminRoutes);


    // Endpoint para obtener la lista de barberos
    app.get('/barberos', async (req, res) => {
        try {
            const barberos = await barberosDb.obtenerBarberos();
            res.json(barberos);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al obtener los barberos');
        }
    });

    // Endpoint para agendar citas
    app.post('/agendar-cita', async (req, res) => {
        try {
            const nuevaCita = {
                fecha: req.body.fecha,
                hora: req.body.hora,
                nombre_completo: req.body.nombre,
                telefono: req.body.telefono,
                email: req.body.email,
                servicio_requerido: req.body.servicio,
                barbero_id: req.body.barbero_id,
            };

            console.log('Antes de verificar la disponibilidad', nuevaCita);

            const disponibilidad = await citasDb.verificarDisponibilidad(nuevaCita.fecha, nuevaCita.hora, nuevaCita.barbero_id);

            if (!disponibilidad) {
                return res.status(400).json({ message: 'El barbero no está disponible en esta fecha y hora.' });
            }

            await citasDb.agregarCita(nuevaCita);
            console.log('Después de agregar la cita');

            enviarCorreoConfirmacion(nuevaCita);

            res.json({ message: 'Cita agendada con éxito' });
        } catch (error) {
            console.error(error);
            res.status(500).send('El barbero no está disponible en esta fecha y hora.');
        }
    });

    app.post('/register', async (req, res) => {
        try {
            const { username, email, phone, password } = req.body;
    
            // Verifica si el usuario ya existe
            const existingUser = await usersDb.getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
            }
    
            // Hashea la contraseña
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
    
            // Inserta el nuevo usuario en la base de datos
            const nuevoUsuario = {
                usuario: username,
                email: email,
                telefono: phone,
                password_hash: hashedPassword,
            };
            await usersDb.createUser(nuevoUsuario);
    
            res.status(201).json({ message: 'Usuario registrado exitosamente.' });
        } catch (error) {
            console.error('Error al registrar el usuario:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    });

    //edpoint para recuperar contraseña

    app.post('/forgot-password', async (req, res) => {
        const { email } = req.body;
        
        try {
            // Verifica si el email existe en la base de datos
            const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
            
            if (users.length === 0) {
                return res.json({ success: false, message: 'No se encontró una cuenta con ese correo electrónico.' });
            }
    
            // Genera un token simple
            const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            
            // Guarda el token en la base de datos con una expiración
            const expiration = new Date();
            expiration.setHours(expiration.getHours() + 1); // El token expira en 1 hora
            await pool.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?', [token, expiration, email]);
    
            // Envía el correo electrónico
            const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
            const mailOptions = {
                from: 'tu_correo@gmail.com',
                to: email,
                subject: 'Recuperación de contraseña',
                text: `Hola buen dia, Para restablecer tu contraseña, haz clic en este enlace: ${resetUrl}`
            };
    
            await transporter.sendMail(mailOptions);
    
            res.json({ success: true, message: 'Se ha enviado un enlace de recuperación a tu correo electrónico.' });
        } catch (error) {
            console.error(error);
            res.json({ success: false, message: 'Ha ocurrido un error. Por favor, intenta de nuevo más tarde.' });
        }
    });

    //ruta de restablecer contraseña
    app.post('/reset-password', async (req, res) => {
        const { token, newPassword } = req.body;
        
        try {
            // Verifica si el token es válido y no ha expirado
            const user = await db.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);
            
            if (user.length === 0) {
                return res.json({ success: false, message: 'El enlace de recuperación es inválido o ha expirado.' });
            }
    
            // Hash de la nueva contraseña
            const hashedPassword = await bcrypt.hash(newPassword, 10);
    
            // Actualiza la contraseña y elimina el token de recuperación
            await db.query('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = ?', [hashedPassword, token]);
    
            res.json({ success: true, message: 'Tu contraseña ha sido restablecida con éxito.' });
        } catch (error) {
            console.error(error);
            res.json({ success: false, message: 'Ha ocurrido un error. Por favor, intenta de nuevo más tarde.' });
        }
    });

    //controlador ruta recuperar contraseña
app.get('/reset-password', async (req, res) => {
    const token = req.query.token;
    // Verify the token and check if it's valid
    const user = await db.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);
    if (!user) {
      return res.status(404).send('Invalid or expired token');
    }
    // Render the password reset form
    res.render('reset-password', { token });
  });

    // Configuración de Nodemailer correo de confirmacion de cita
const transporter = nodemailer.createTransport({
    service: 'gmail', // Puedes usar otros servicios como Outlook, Yahoo, etc.
    auth: {
        user: 'mark160589@gmail.com', // Tu correo electrónico
        pass: 'hikf tuty qqgj ouae' // Tu contraseña de correo
    }
});

// Función para enviar correo de confirmación
function enviarCorreoConfirmacion(cita) {
    const mailOptions = {
        from: 'mark160589@gmail.com', // Remitente
        to: cita.email, // Destinatario (correo del cliente)
        subject: 'Agendamiento cita Barbería Frisor',
        text: `¡Hola ${cita.nombre_completo}!, tu cita ha sido agendada con éxito, con el servicio de: ${cita.servicio_requerido} el ${cita.fecha} a las ${cita.hora}. Por favor, llega 10 minutos antes para completar cualquier proceso previo. Si necesitas reprogramar o cancelar tu cita, contáctanos lo antes posible a la línea de WhatsApp 3185049443.
        \n\nFeliz día.
        \nAtentamente,
        \nAdministración Barbería Frisor.`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log('Error al enviar el correo:', error);
        } else {
            console.log('Correo enviado: ' + info.response);
        }
    });
}

    app.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return res.redirect('/admin');
            }
            res.clearCookie('connect.sid');
            res.redirect('/');
        });
    });

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'docs', 'index.html'));
    });
    
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });

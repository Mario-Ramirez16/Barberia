const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { obtenerCitas, actualizarValorPagado, actualizarEstado, eliminarCita, buscarCitas} = require('./citasDb');
const authenticateToken = require('./authMiddleware'); // Añade esta línea
const pool = require('./database');
const bcrypt = require('bcryptjs');

// Obtener todas las citas
router.get('/', async(req, res) => {
    try {
        const citas = await obtenerCitas();
        if (req.xhr || req.headers.accept.includes('application/json')) {
            // Si es una solicitud AJAX o espera JSON
            res.json({ success: true, citas });
        } else {
            // Si es una solicitud normal de página
            res.render('admin', { citas });
        }
    } catch (error) {
        console.error('Error fetching citas:', error);
        if (req.xhr || req.headers.accept.includes('application/json')) {
            res.status(500).json({ success: false, message: 'Error al obtener citas' });
        } else {
            res.status(500).send('Error al obtener citas');
        }
    }
});

// Buscar citas
router.get('/search', async (req, res) => {
    const { nombre, estado, fecha_inicio, fecha_fin } = req.query;
    try {
        const citas = await buscarCitas({ nombre, estado, fecha_inicio, fecha_fin });
        res.json({ success: true, citas });
    } catch (error) {
        console.error('Error searching citas:', error);
        res.status(500).json({ success: false, message: 'Error al buscar citas', error: error.message });
    }
});

//perfil

router.get('/profile', authenticateToken, async (req, res) => {
    console.log('Profile request received. User:', req.user);
    try {
        if (req.user && req.user.userId) {
            const [rows] = await pool.execute('SELECT usuario, email, telefono FROM users WHERE idUsuario = ?', [req.user.userId]);
            console.log('Query result:', rows);
            if (rows.length > 0) {
                res.json({ success: true, user: rows[0] });
            } else {
                console.log('User not found in database');
                res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }
        } else {
            console.log('User ID is undefined');
            res.status(400).json({ success: false, message: 'ID de usuario no válido' });
        }
    } catch (error) {
        console.error('Error al obtener los datos del perfil:', error);
        res.status(500).json({ success: false, message: 'Error al obtener los datos del perfil', error: error.message });
    }
});

router.get('/user-info', authenticateToken, async (req, res) => {
    console.log('Encabezado de autorización recibido:', req.headers.authorization);
    try {
        const userId = req.user.userId;
        const [user] = await pool.execute('SELECT usuario, email, telefono FROM users WHERE idUsuario = ?', [req.user.userId]);
        if (user.length > 0) {
            res.json({ success: true, usuario: user[0].usuario, email: user[0].email, telefono: user[0].telefono });
        } else {
            res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ success: false, message: 'Error al obtener información del usuario' });
    }
});

router.post('/update-profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { usuario, email, telefono } = req.body;
        await pool.execute('UPDATE users SET usuario = ?, email = ?, telefono = ? WHERE idUsuario = ?', [usuario, email, telefono, userId]);
        res.json({ success: true, message: 'Perfil actualizado exitosamente' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar el perfil' });
    }
});

router.get('/profile-data', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const [user] = await pool.execute('SELECT usuario, email, telefono FROM users WHERE idUsuario = ?', [userId]);
        if (user.length > 0) {
            res.json({ success: true, user: user[0] });
        } else {
            res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener los datos del perfil:', error);
        res.status(500).json({ success: false, message: 'Error al obtener los datos del perfil' });
    }
});

router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log('User ID:', userId);
        const { oldPassword, newPassword } = req.body;
        console.log('Old password received:', oldPassword ? 'Yes' : 'No');
        console.log('New password received:', newPassword ? 'Yes' : 'No');

        // Primero, verifica la contraseña actual
        const [user] = await pool.execute('SELECT password_hash FROM users WHERE idUsuario = ?', [userId]);
        
        if (user.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user[0].password_hash);
        
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Contraseña actual incorrecta' });
        }

        // Si la contraseña actual es correcta, actualiza con la nueva
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await pool.execute('UPDATE users SET password_hash = ? WHERE idUsuario = ?', [hashedNewPassword, userId]);
        
        res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: 'Error al cambiar la contraseña' });
    }
});
// Actualizar el valor pagado de una cita
router.post('/update/:cita_id', upload.none(), async (req, res) => {
    console.log('Recibida solicitud de actualización:', req.params, req.body);
    const { cita_id } = req.params;
    const { valor_pagado } = req.body;
    try {
        if (!cita_id || valor_pagado === undefined) {
            throw new Error('cita_id y valor_pagado son requeridos');
        }
        const result = await actualizarValorPagado(cita_id, valor_pagado);
        res.json({ 
            success: true, 
            message: 'Valor pagado actualizado exitosamente.',
            updatedData: { valor_pagado: valor_pagado }
        });
    } catch (error) {
        console.error('Error updating cita:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Actualizar el estado de una cita
router.post('/updateEstado/:cita_id', upload.none(), async (req, res) => {
    console.log('Recibida solicitud de actualización de estado:', req.params, req.body);
    const { cita_id } = req.params;
    const { estado } = req.body;
    
    try {
        if (!cita_id || !estado) {
            throw new Error('cita_id y estado son requeridos');
        }
        const result = await actualizarEstado(cita_id, estado);
        res.json({ 
            success: true, 
            message: 'Estado actualizado exitosamente.',
            updatedData: { estado: estado }
        });
    } catch (error) {
        console.error('Error updating cita state:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});
// Eliminar una cita
router.post('/delete/:cita_id', upload.none(), async (req, res) => {
    const { cita_id } = req.params;
    
    try {
        if (!cita_id) {
            throw new Error('cita_id es requerido');
        }
        await eliminarCita(cita_id);
        res.json({ 
            success: true, 
            message: 'Cita eliminada exitosamente.'
        });
    } catch (error) {
        console.error('Error eliminando cita:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});


function getToken() {
    return localStorage.getItem('token');
}

async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
    } else {
        // Si no hay un token válido, redirigir al usuario a la página de inicio de sesión
        window.location.href = '/login.html';
        return;
    }
    const response = await fetch(url, options);
    if (response.status === 401) {
        // Si el token es inválido, redirigir al usuario a la página de inicio de sesión
        window.location.href = '/login.html';
    } else if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

module.exports = router

// authMiddleware.js
require('dotenv').config();
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    console.log("Ruta solicitada:", req.path);
    console.log("Método de la solicitud:", req.method);
    console.log("Encabezados completos:", req.headers);
    const authHeader = req.headers['authorization'];
    console.log("Encabezado de autorización recibido:", authHeader);
    const token = authHeader && authHeader.split(' ')[1];

    console.log("Token recibido:", token);

    if (!token) {
        console.log('No se encontró token');
        return res.status(401).json({ message: 'No se encontró token' });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            console.log('Token no válido', err);
            return res.status(401).json({ message: 'Token no válido' });
        }
        req.user = { userId: user.id };
        console.log("Usuario autenticado:", user);
        next();
    });
}

module.exports = authenticateToken;

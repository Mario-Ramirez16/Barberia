const db = require('./database');

async function getUserByEmail(email) {
    try {
        // Utiliza el método query del pool para ejecutar la consulta
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        return rows[0]; // Devuelve el primer resultado, que debe ser el usuario
    } catch (error) {
        console.error('Error al obtener el usuario por email:', error);
        throw error; // Lanza el error para manejarlo más arriba en la cadena de promesas
    }
}

module.exports = {
    getUserByEmail
};


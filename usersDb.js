const pool = require('./database'); // Asegúrate de que `database.js` exporta el pool.

const getBarberos = async () => {
    const query = 'SELECT id, nombre FROM barberos';
    try {
        const [rows] = await pool.execute(query);
        return rows;
    } catch (err) {
        console.error('Error al obtener los barberos', err);
        throw err;
    }
};

async function getUserByEmail(email) {
    try {
        const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
        return rows[0]; // Devuelve el primer resultado, que debe ser el usuario
    } catch (error) {
        console.error('Error al obtener el usuario por email:', error);
        throw error; // Lanza el error para manejarlo más arriba en la cadena de promesas
    }
}

// Crear nuevo usuario
async function createUser(user) {
    const { usuario, email, telefono, password_hash } = user;
    await pool.execute('INSERT INTO users (usuario, email, telefono, password_hash) VALUES (?, ?, ?, ?)', [usuario, email, telefono, password_hash]);
}


module.exports = {
    getBarberos,
    getUserByEmail,
    createUser,
};
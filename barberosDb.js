const pool = require('./database');

const obtenerBarberos = async () => {
    const query = 'SELECT * FROM barberos';
    try {
        const [results] = await pool.execute(query);
        return results;
    } catch (err) {
        console.error("Error al obtener los barberos", err);
        throw err;
    }
};

module.exports = {
    obtenerBarberos
};

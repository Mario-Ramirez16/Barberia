const pool = require('./database'); // Asegúrate de que `database.js` exporta el pool.

const agregarCita = async (nuevaCita) => {
    const query = `
        INSERT INTO citas (fecha, hora, nombre_completo, telefono, email, servicio_requerido, estado) 
        VALUES (?, ?, ?, ?, ?, ?, 'Agendada')`;

    const values = [
        nuevaCita.fecha,
        nuevaCita.hora,
        nuevaCita.nombre_completo,  
        nuevaCita.telefono,
        nuevaCita.email,
        nuevaCita.servicio_requerido,
    ];

    try {
        const [results] = await pool.execute(query, values);
        console.log("Consulta ejecutada con éxito", results);
        return results;
    } catch (err) {
        console.error("Error al ejecutar la consulta", err);
        throw err; // Re-lanza el error para manejarlo en el nivel superior si es necesario
    }
};

module.exports = {
    agregarCita
};

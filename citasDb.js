const pool = require('./database');

// Obtener todas las citas//
async function obtenerCitas() {
    const [rows] = await pool.execute(`
        SELECT citas.*, barberos.nombre AS nombre_barbero 
        FROM citas 
        JOIN barberos ON citas.barbero_id = barberos.id
    `);
    return rows;
}

const agregarCita = async (nuevaCita) => {
    const query = `
        INSERT INTO citas (fecha, hora, nombre_completo, telefono, email, servicio_requerido, barbero_id, estado) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Agendada')`;

    const values = [
        nuevaCita.fecha,
        nuevaCita.hora,
        nuevaCita.nombre_completo,  
        nuevaCita.telefono,
        nuevaCita.email,
        nuevaCita.servicio_requerido,
        nuevaCita.barbero_id
    ];

    if (values.some(value => value === undefined)) {
        throw new Error('Todos los campos son requeridos');
    }

    try {
        const [results] = await pool.execute(query, values);
        console.log("Cita agregada con éxito", results);
        return results;
    } catch (err) {
        console.error("Error al agregar la cita", err);
        throw err;
    }
};

const verificarDisponibilidad = async (fecha, hora, barbero_id) => {
    if (!fecha || !hora || !barbero_id) {
        throw new Error('Fecha, hora y barbero_id son requeridos');
    }

    const query = `
        SELECT COUNT(*) AS count
        FROM citas
        WHERE fecha = ? AND hora = ? AND barbero_id = ? AND estado = 'Agendada'`;

    const values = [fecha, hora, barbero_id];

    try {
        const [rows] = await pool.execute(query, values);
        return rows[0].count === 0;
    } catch (err) {
        console.error("Error al verificar la disponibilidad", err);
        throw err;
    }
};
/*
const obtenerCitas = async () => {
    const query = `SELECT * FROM citas`;

    try {
        const [rows] = await pool.execute(query);
        return rows;
    } catch (err) {
        console.error("Error al obtener las citas", err);
        throw err;
    }
};
*/
async function actualizarValorPagado(cita_id, valor_pagado) {
    console.log(`Intentando actualizar cita_id: ${cita_id} con valor_pagado: ${valor_pagado}`);
    if (!cita_id || valor_pagado === undefined) {
        throw new Error('cita_id y valor_pagado son requeridos');
    }

    const query = `UPDATE citas SET valor_pagado = ? WHERE cita_id = ?`;
    const values = [valor_pagado, cita_id];

    try {
        const [results] = await pool.execute(query, values);
        console.log('Resultados de la actualización:', results);
        if (results.affectedRows === 0) {
            throw new Error(`No se encontró la cita con id ${cita_id}`);
        }
        return results;
    } catch (err) {
        console.error("Error al actualizar el valor pagado", err);
        throw err;
    }
}

async function actualizarEstado(cita_id, estado) {
    console.log(`Intentando actualizar cita_id: ${cita_id} con estado: ${estado}`);
    if (!cita_id || estado === undefined) {
        throw new Error('cita_id y estado son requeridos');
    }
    const query = 'UPDATE citas SET estado = ? WHERE cita_id = ?';
    const values = [estado, cita_id];

    try {
        const [results] = await pool.execute(query, values);
        if (results.affectedRows === 0) {
            throw new Error(`No se encontró la cita con id ${cita_id}`);
        }
        return results;
    } catch (err) {
        console.error("Error al actualizar el estado de la cita", err);
        throw err;
    }
}

const eliminarCita = async (cita_id) => {
    if (!cita_id) {
        throw new Error('cita_id es requerido');
    }

    const query = `DELETE FROM citas WHERE cita_id = ?`;
    const values = [cita_id];

    try {
        const [results] = await pool.execute(query, values);
        return results;
    } catch (err) {
        console.error("Error al eliminar la cita", err);
        throw err;
    }
};

const buscarCitas = async ({ nombre, estado, fecha_inicio, fecha_fin }) => {
    let query = `
        SELECT citas.*, barberos.nombre AS nombre_barbero
        FROM citas
        JOIN barberos ON citas.barbero_id = barberos.id
        WHERE 1=1
    `;
    const params = [];

    if (nombre && nombre.trim() !== '') {
        query += ' AND citas.nombre_completo LIKE ?';
        params.push(`%${nombre.trim()}%`);
    }

    if (estado && ['Agendada', 'Cancelada', 'Pendiente'].includes(estado)) {
        query += ' AND citas.estado = ?';
        params.push(estado);
    }

    if (fecha_inicio && !isNaN(Date.parse(fecha_inicio))) {
        query += ' AND citas.fecha >= ?';
        params.push(fecha_inicio);
    }

    if (fecha_fin && !isNaN(Date.parse(fecha_fin))) {
        query += ' AND citas.fecha <= ?';
        params.push(fecha_fin);
    }

    // Agregar ordenamiento por fecha y hora
    query += ' ORDER BY citas.fecha ASC, citas.hora ASC';

    try {
        const [results] = await pool.execute(query, params);
        return results;
    } catch (err) {
        console.error("Error al buscar citas", err);
        throw new Error(`Error al buscar citas: ${err.message}`);
    }
};

module.exports = {
    agregarCita,
    verificarDisponibilidad,
    obtenerCitas,
    actualizarValorPagado,
    actualizarEstado,
    eliminarCita,
    buscarCitas
};

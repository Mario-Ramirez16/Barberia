const mysql = require('mysql2/promise');

// Configura la conexión a la base de datos
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'barberia_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Ejemplo de función que ejecuta una consulta SQL usando una promesa
const ejecutarConsulta = async () => {
  try {
    // Obtiene una conexión del pool
    const connection = await pool.getConnection();
    
    // Realiza la consulta SQL
    const [rows, fields] = await connection.execute('SELECT * FROM citas');

    // Libera la conexión
    connection.release();

    // Devuelve los resultados de la consulta
    return rows;
  } catch (error) {
    // Maneja cualquier error que ocurra durante la ejecución de la consulta
    console.error('Error al ejecutar la consulta:', error);
    throw error; // Propaga el error para que pueda ser manejado por el llamador
  }
};

// Ejemplo de cómo usar la función para ejecutar la consulta
  module.exports = pool;
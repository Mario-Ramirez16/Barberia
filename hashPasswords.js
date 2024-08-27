/*
const bcrypt = require('bcrypt');
const pool = require('./database'); // Asegúrate de que `database.js` exporta el pool.

async function hashPassword(plainTextPassword) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
    return hashedPassword;
}

async function updatePasswordInDb(userId, plainTextPassword) {
    const hashedPassword = await hashPassword(plainTextPassword);
    await pool.execute("UPDATE users SET password_hash = ? WHERE idUsuario = ?", [hashedPassword, userId]);
    console.log(`Contraseña para el usuario con ID ${userId} actualizada.`);
}

// Hashear y actualizar la contraseña para cada usuario
(async () => {
    await updatePasswordInDb(1, 'Lariza140594');
    await updatePasswordInDb(2, 'Mario160589');
    console.log('Contraseñas actualizadas.');
    process.exit();
})();
*/
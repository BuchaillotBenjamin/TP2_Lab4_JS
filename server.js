// Archivo: server.js
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Configuración de la base de datos
const db = mysql.createConnection({
    host: "localhost",
    user: "root", // Cambia esto por tu usuario de MySQL
    password: "", // Cambia esto por tu contraseña de MySQL
    database: "TP2_lab4_js", // Cambia esto por el nombre de tu base de datos
});

// Conexión a la base de datos
db.connect((err) => {
    if (err) {
        console.error("Error al conectar a la base de datos:", err);
        return;
    }
    console.log("Conectado a la base de datos MySQL");
});

// Ruta para guardar un país
app.post("/api/agregarPais", (req, res) => {
    const {
        codigoPais,
        nombrePais,
        capitalPais,
        region,
        subregion,
        poblacion,
        latitud,
        longitud,
    } = req.body;

    const query = `
        INSERT INTO Pais (codigoPais, nombrePais, capitalPais, region, subregion, poblacion, latitud, longitud)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        nombrePais = VALUES(nombrePais),
        capitalPais = VALUES(capitalPais),
        region = VALUES(region),
        subregion = VALUES(subregion),
        poblacion = VALUES(poblacion),
        latitud = VALUES(latitud),
        longitud = VALUES(longitud)
    `;

    db.query(
        query,
        [codigoPais, nombrePais, capitalPais, region, subregion, poblacion, latitud, longitud],
        (err, result) => {
            if (err) {
                console.error("Error al insertar/actualizar el país:", err);
                res.status(500).send("Error al guardar el país");
                return;
            }
            res.send("País guardado correctamente");
        }
    );
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});
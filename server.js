const { getConnection } = require('./config/db');
const axios = require('axios');
const express = require('express');
const app = express();
const port = 3000;

async function getPaisData(code) {
    try {
        const formattedCode = code.toString().padStart(3, '0');
        const response = await axios.get(`https://restcountries.com/v3.1/alpha/${formattedCode}`);
        return response.data[0];
    } catch (error) {
        if (error.response && error.response.status !== 404) {
            console.error(`Error al obtener datos del país ${code}:`, error.message);
        }
        return null;
    }
}

async function insertOrUpdatePais(connection, paisData) {
    try {
        // Verificar si el país existe
        const [rows] = await connection.execute(
            'SELECT * FROM Pais WHERE codigoPais = ?',
            [paisData.codigoPais]
        );

        if (rows.length > 0) {
            // Actualizar país existente
            await connection.execute(`
                UPDATE Pais 
                SET nombrePais = ?, 
                    capitalPais = ?, 
                    region = ?, 
                    subregion = ?, 
                    poblacion = ?, 
                    latitud = ?, 
                    longitud = ?
                WHERE codigoPais = ?`,
                [
                    paisData.nombrePais,
                    paisData.capitalPais,
                    paisData.region,
                    paisData.subregion,
                    paisData.poblacion,
                    paisData.latitud,
                    paisData.longitud,
                    paisData.codigoPais
                ]
            );
            console.log(`País actualizado: ${paisData.nombrePais}`);
        } else {
            // Insertar nuevo país
            await connection.execute(`
                INSERT INTO Pais (
                    codigoPais, 
                    nombrePais, 
                    capitalPais, 
                    region, 
                    subregion, 
                    poblacion, 
                    latitud, 
                    longitud
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    paisData.codigoPais,
                    paisData.nombrePais,
                    paisData.capitalPais,
                    paisData.region,
                    paisData.subregion,
                    paisData.poblacion,
                    paisData.latitud,
                    paisData.longitud
                ]
            );
            console.log(`País insertado: ${paisData.nombrePais}`);
        }
    } catch (error) {
        console.error(`Error al procesar el país ${paisData.nombrePais}:`, error);
    }
}

app.use(express.static('public'));

app.get('/api/paises', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute(
            'SELECT codigoPais, nombrePais, capitalPais FROM Pais ORDER BY nombrePais'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener países:', error);
        res.status(500).json({ error: 'Error al obtener países' });
    } finally {
        if (connection) await connection.end();
    }
});

async function main() {
    let connection;
    try {
        connection = await getConnection();

        for (let codigo = 1; codigo <= 100; codigo++) {
            const datosJSON = await getPaisData(codigo);
            
            if (datosJSON) {
                const paisData = {
                    codigoPais: codigo,
                    nombrePais: datosJSON.name.common,
                    capitalPais: datosJSON.capital ? datosJSON.capital[0] : 'N/A',
                    region: datosJSON.region || 'N/A',
                    subregion: datosJSON.subregion || 'N/A',
                    poblacion: datosJSON.population,
                    latitud: datosJSON.latlng[0],
                    longitud: datosJSON.latlng[1]
                };

                await insertOrUpdatePais(connection, paisData);
            }
        }
    } catch (error) {
        console.error('Error en la ejecución principal:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Conexión cerrada');
        }
    }

    app.listen(port, () => {
        console.log(`Servidor web ejecutándose en http://localhost:${port}`);
    });
}

main();
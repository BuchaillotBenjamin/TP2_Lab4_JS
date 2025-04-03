const tableBody = document.querySelector("#countries-table tbody");

async function fetchCountryData(code) {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${code.toString().padStart(3, '0')}`);
        if (!response.ok) throw new Error("No data found");
        const data = await response.json();
        return data[0]; // Retorna el primer elemento del JSON
    } catch (error) {
        return null; // Si no hay datos, retorna null
    }
}

async function populateTable() {
    for (let code = 1; code <= 300; code++) {
        const countryData = await fetchCountryData(code);
        if (countryData) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${countryData.cca3}</td>
                <td>${countryData.name.common}</td>
                <td>${countryData.capital ? countryData.capital[0] : "N/A"}</td>
            `;
            tableBody.appendChild(row);

            // Enviar los datos al servidor
            try {
                await fetch("http://localhost:3000/api/agregarPais", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        codigoPais: countryData.cca3,
                        nombrePais: countryData.name.common,
                        capitalPais: countryData.capital ? countryData.capital[0] : "N/A",
                        region: countryData.region,
                        subregion: countryData.subregion,
                        poblacion: countryData.population,
                        latitud: countryData.latlng[0],
                        longitud: countryData.latlng[1],
                    }),
                });
            } catch (error) {
                console.error("Error al enviar los datos al servidor:", error);
            }
        }
    }
}

populateTable();
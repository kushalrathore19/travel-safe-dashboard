const countriesUrl = "https://restcountries.com/v3.1/all?fields=name,flags,currencies,region,capital";
const apiKey = "5b388e9a2532042d2a9a3c88"; 
const exchangeUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/INR`;

let combinedData = [];

async function initDashboard() {
    const container = document.getElementById('country-container');
    container.innerHTML = "<p>Loading Global Data...</p>";

    try {
        const [countriesRes, exchangeRes] = await Promise.all([
            fetch(countriesUrl), // Now uses the ?fields= parameter
            fetch(exchangeUrl)
        ]);

        if (!countriesRes.ok) throw new Error("Countries API limit/error");
        if (!exchangeRes.ok) throw new Error("Exchange API error - check your key");

        const countries = await countriesRes.json();
        const exchangeData = await exchangeRes.json();
        const rates = exchangeData.conversion_rates;

        // Combine the data
        combinedData = countries.map(country => {
            const currencyCode = country.currencies ? Object.keys(country.currencies)[0] : "N/A";
            
            // We get the rate for the local currency relative to 1 INR
            let localRate = rates[currencyCode] || "N/A";

            return {
                name: country.name.common,
                flag: country.flags.svg,
                region: country.region,
                capital: country.capital ? country.capital[0] : "N/A",
                currency: currencyCode,
                rate: localRate 
            };
});

        displayCards(combinedData);

    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = `<p style="color:red">Error: ${error.message}</p>`;
    }
}

function displayCards(data) {
    const container = document.getElementById('country-container');
    container.innerHTML = data.map(item => `
        <div class="country-card">
            <img src="${item.flag}" alt="${item.name} Flag">
            <div class="card-content">
                <h3>${item.name}</h3>
                <p><strong>Region:</strong> ${item.region}</p>
                <p><strong>Capital:</strong> ${item.capital}</p>
                <p class="rate-info">1 INR = ${item.rate} ${item.currency}</p>
            </div>
        </div>
    `).join('');
}
initDashboard();
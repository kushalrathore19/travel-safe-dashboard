const countriesUrl = "https://restcountries.com/v3.1/all?fields=name,flags,currencies,region,capital,independent";
const apiKey = "5b388e9a2532042d2a9a3c88"; 
const exchangeUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/INR`;

let combinedData = [];
let currentRegion = 'all'; 

async function init() {
    try {
        const [cRes, eRes] = await Promise.all([fetch(countriesUrl), fetch(exchangeUrl)]);
        const countries = await cRes.json();
        const eData = await eRes.json();
        const rates = eData.conversion_rates;

        const sovereign = countries.filter(c => c.independent === true);

        combinedData = sovereign.map(c => {
            const code = c.currencies ? Object.keys(c.currencies)[0] : "N/A";
            return {
                name: c.name.common,
                flag: c.flags.svg,
                region: c.region,
                capital: c.capital.length > 0 ? c.capital[0] : "N/A",
                currency: code,
                rate: rates[code] || 0
            };
        });

        applyFilters(); 
    } catch (err) {
        document.getElementById('country-container').innerHTML = "Error loading data.";
    }
}

function render(data) {
    const container = document.getElementById('country-container');
    
    container.innerHTML = data.map((item, index) => {
        const delay = index * 0.05; 
        
        return `
        <div class="country-card" style="animation-delay: ${delay}s">
            <img src="${item.flag}" alt="${item.name}">
            <div class="content">
                <h3>${item.name}</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span>Capital</span>
                        <p>${item.capital}</p>
                    </div>
                    <div class="stat-item">
                        <span>Region</span>
                        <p>${item.region}</p>
                    </div>
                </div>
                <div class="rate-badge">
                    1 INR = ${item.rate ? item.rate.toFixed(2) : "N/A"} ${item.currency}
                </div>
            </div>
        </div>
        `;
    }).join('');

    initSpotlightEffect();
}

function initSpotlightEffect() {
    const cards = document.querySelectorAll('.country-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
           
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}


function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const sort = document.getElementById('sortOrder').value;

    let filtered = combinedData.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm) || 
                              c.capital.toLowerCase().includes(searchTerm);
        const matchesRegion = currentRegion === "all" || c.region === currentRegion;
        return matchesSearch && matchesRegion;
    });

    if (sort === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "rateLow") {
        filtered.sort((a, b) => b.rate - a.rate);
    } else if (sort === "rateHigh") {
        filtered.sort((a, b) => a.rate - b.rate);
    }

    render(filtered);
}

document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('sortOrder').addEventListener('change', applyFilters);

document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', (e) => {

        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));

        e.target.classList.add('active');

        currentRegion = e.target.getAttribute('data-region');
        applyFilters();
    });
});

document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

init();
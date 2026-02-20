// DOM Elements
const tickerContent = document.getElementById('ticker-content');
const newsGrid = document.getElementById('news-grid');
const ctx = document.getElementById('marketChart').getContext('2d');
const heroBtcPrice = document.getElementById('hero-btc-price');
const heroBtcChange = document.getElementById('hero-btc-change');
const heroEthPrice = document.getElementById('hero-eth-price');
const heroEthChange = document.getElementById('hero-eth-change');

// API Configuration
const API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,cardano,dogecoin,polkadot&vs_currencies=usd&include_24hr_change=true';

// Mock Data (Fallback)
let coins = [
    { name: 'BTC', price: '98,245.00', change: '+2.4%', type: 'up' },
    { name: 'ETH', price: '5,432.10', change: '-1.2%', type: 'down' },
    { name: 'SOL', price: '345.50', change: '+5.7%', type: 'up' },
    { name: 'XRP', price: '2.45', change: '+0.8%', type: 'up' },
    { name: 'ADA', price: '1.20', change: '-0.5%', type: 'down' },
    { name: 'DOGE', price: '0.45', change: '+12.4%', type: 'up' },
    { name: 'DOT', price: '15.30', change: '-2.1%', type: 'down' }
];

const news = [
    {
        title: 'Bitcoin Smashes $100k Barrier: Historic Milestone Achieved',
        date: 'Just now',
        tag: 'Breaking News',
        image: 'assets/news1.png'
    },
    {
        title: 'G20 Nations Officially Recognize Bitcoin as Digital Commodity',
        date: '4 hours ago',
        tag: 'Regulation',
        image: 'assets/news2.png'
    },
    {
        title: 'New "Green Mining" Tech Reduces Energy Usage by 40%',
        date: '1 day ago',
        tag: 'Technology',
        image: 'assets/hero-bg.png' // Fallback usage
    }
];

// Render Ticker
function renderTicker(displayData) {
    let tickerHTML = '';
    // Duplicate array to ensure smooth infinite scroll
    const loopedData = [...displayData, ...displayData, ...displayData];

    loopedData.forEach(coin => {
        tickerHTML += `
            <div class="ticker-item">
                <span style="color: #fff">${coin.name}</span>
                <span style="margin: 0 10px">$${coin.price}</span>
                <span class="${coin.type}">${coin.change}</span>
            </div>
        `;
    });
    tickerContent.innerHTML = tickerHTML;
}

// Update Prices from API
async function updatePrices() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('API Request Failed');
        const data = await response.json();

        // Update Hero Badge (BTC)
        if (data.bitcoin) {
            const btc = data.bitcoin;
            const price = btc.usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            const changeVal = btc.usd_24h_change;

            if (heroBtcPrice) heroBtcPrice.textContent = price;

            if (heroBtcChange) {
                heroBtcChange.textContent = `${changeVal > 0 ? '+' : ''}${changeVal.toFixed(2)}%`;
                heroBtcChange.className = `badge-change ${changeVal >= 0 ? 'up' : 'down'}`;
            }

            // Update pulse color based on market direction
            const pulse = document.querySelector('.pulse');
            if (pulse) {
                if (changeVal >= 0) {
                    pulse.classList.add('active'); // Green
                } else {
                    pulse.classList.remove('active'); // Red
                }
            }
        }

        // Update Hero Badge (ETH)
        if (data.ethereum) {
            const eth = data.ethereum;
            const price = eth.usd.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            const changeVal = eth.usd_24h_change;

            if (heroEthPrice) heroEthPrice.textContent = price;

            if (heroEthChange) {
                heroEthChange.textContent = `${changeVal > 0 ? '+' : ''}${changeVal.toFixed(2)}%`;
                heroEthChange.className = `badge-change ${changeVal >= 0 ? 'up' : 'down'}`;
            }

            // Update ETH pulse
            const ethPulse = document.getElementById('eth-pulse');
            if (ethPulse) {
                if (changeVal >= 0) {
                    ethPulse.classList.add('active'); // Green
                } else {
                    ethPulse.classList.remove('active'); // Red
                }
            }
        }

        // Update Ticker Data
        const coinMap = {
            'bitcoin': 'BTC',
            'ethereum': 'ETH',
            'solana': 'SOL',
            'ripple': 'XRP',
            'cardano': 'ADA',
            'dogecoin': 'DOGE',
            'polkadot': 'DOT'
        };

        const newCoins = [];
        for (const [id, symbol] of Object.entries(coinMap)) {
            if (data[id]) {
                const info = data[id];
                const change = info.usd_24h_change;
                newCoins.push({
                    name: symbol,
                    price: info.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    change: `${change > 0 ? '+' : ''}${change.toFixed(2)}%`,
                    type: change >= 0 ? 'up' : 'down'
                });
            }
        }

        if (newCoins.length > 0) {
            coins = newCoins;
            renderTicker(coins);
        }

    } catch (error) {
        console.warn('Using offline data:', error);
        // Ensure at least offline data is shown if not already
        if (heroBtcPrice && heroBtcPrice.textContent === 'Loading...') {
            heroBtcPrice.textContent = '$98,245.00';
            heroBtcChange.textContent = '+2.4%';
            heroBtcChange.classList.add('up');
        }
    }
}

// Initialize News - DEPRECATED (Moved to HTML)
// function initNews() { ... }

// Initialize Chart
// with Real BTC Data
async function initChart() {
    const ctx = document.getElementById('marketChart').getContext('2d');
    const CHART_API_URL = 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7';

    let labels = [];
    let prices = [];

    try {
        const response = await fetch(CHART_API_URL);
        if (!response.ok) throw new Error('Chart API Failed');
        const data = await response.json();

        // Process Data (Prices is array of [timestamp, price])
        data.prices.forEach(point => {
            const date = new Date(point[0]);
            // Format: "Mon 14" or similar
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }));
            prices.push(point[1]);
        });
    } catch (error) {
        console.warn('Using fallback chart data:', error);
        // Fallback Data
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            labels.push(d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }));
        }
        prices = [92000, 94000, 93500, 96000, 95000, 97500, 98245];
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 255, 136, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 255, 136, 0.0)');

    if (window.myLineChart) {
        window.myLineChart.destroy();
    }

    window.myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Bitcoin Price (USD) - Last 7 Days',
                data: prices,
                borderColor: '#00ff88',
                backgroundColor: gradient,
                borderWidth: 2,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#00ff88',
                pointRadius: 3,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#fff', font: { family: 'Outfit' } }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function (context) {
                            return '$' + context.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: {
                        color: '#a0a0b0',
                        callback: function (value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#a0a0b0', maxTicksLimit: 7 }
                }
            },
            interaction: {
                intersect: false,
                mode: 'nearest'
            }
        }
    });
}

// Run everything on load
document.addEventListener('DOMContentLoaded', () => {
    // initNews(); // DEPRECATED: News moved to HTML
    renderTicker(coins); // Show cached/mock data immediately
    initChart();

    // Fetch live data
    updatePrices();
    // Refresh every 30 seconds
    setInterval(updatePrices, 30000);
});

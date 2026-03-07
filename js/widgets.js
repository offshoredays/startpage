// ========================================
// Widget Functions
// ========================================

// Weather Widget
async function initWeatherWidget(app) {
    await loadWeatherData(app);
    setInterval(() => loadWeatherData(app), 600000); // 10분마다
    
    document.getElementById('weatherWidget').addEventListener('click', () => {
        openWeatherModal(app);
    });
}

async function loadWeatherData(app) {
    try {
        const { weatherCity, weatherApiKey, weatherUnit } = app.settings;
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${weatherCity}&appid=${weatherApiKey}&units=${weatherUnit}&lang=kr`
        );
        const data = await response.json();
        
        app.currentWeather = data;
        updateWeatherDisplay(data);
    } catch (error) {
        console.error('Weather fetch error:', error);
        document.querySelector('.weather-temp').textContent = '--°';
        document.querySelector('.weather-location').textContent = 'Error';
    }
}

function updateWeatherDisplay(data) {
    const temp = Math.round(data.main.temp);
    const icon = getWeatherIcon(data.weather[0].main);
    const windSpeed = data.wind?.speed || 0;
    const windDeg = data.wind?.deg || 0;
    
    // 파도 높이 추정 (바람 속도 기반)
    // 간단한 추정식: 파도 높이 (m) ≈ 0.3 × 풍속 (m/s)
    const waveHeight = (windSpeed * 0.3).toFixed(1);
    const waveDirection = getWindDirection(windDeg);
    
    document.querySelector('.weather-temp').textContent = `${temp}°`;
    document.querySelector('.weather-location').textContent = data.name;
    document.querySelector('.weather-compact > i').className = icon;
    document.querySelector('.weather-wind').innerHTML = `<i class="fas fa-wind"></i> ${windSpeed.toFixed(1)}m/s`;
    document.querySelector('.weather-wave').innerHTML = `<i class="fas fa-water"></i> ${waveHeight}m ${waveDirection}`;
}

function openWeatherModal(app) {
    const data = app.currentWeather;
    if (!data) return;
    
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const windSpeed = data.wind?.speed || 0;
    const windDeg = data.wind?.deg || 0;
    
    // 파도 높이 추정 (바람 속도 기반)
    const waveHeight = (windSpeed * 0.3).toFixed(1);
    const waveDirection = getWindDirection(windDeg);
    
    document.getElementById('sunrise').textContent = sunrise;
    document.getElementById('sunset').textContent = sunset;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${windSpeed.toFixed(1)} m/s`;
    document.getElementById('windDirection').textContent = getWindDirection(windDeg);
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    document.getElementById('waveHeight').textContent = `${waveHeight} m`;
    document.getElementById('waveDirection').textContent = waveDirection;
    
    document.getElementById('weatherModal').classList.add('active');
}

// Clock Widget
function initClockWidget(app) {
    updateClock(app);
    setInterval(() => updateClock(app), 1000);
    
    document.getElementById('clockWidget').addEventListener('click', () => {
        openClockDetailModal(app);
    });
}

function updateClock(app) {
    const { clockFormat, clockShowSeconds, clockDateFormat, clockTimezone } = app.settings;
    
    const now = new Date();
    const options = { timeZone: clockTimezone || 'Asia/Seoul' };
    const timeInZone = new Date(now.toLocaleString('en-US', options));
    
    let hours = timeInZone.getHours();
    const minutes = timeInZone.getMinutes().toString().padStart(2, '0');
    const seconds = timeInZone.getSeconds().toString().padStart(2, '0');
    
    const colonVisible = seconds % 2 === 0;
    const colon = `<span class="colon"${colonVisible ? '' : ' style="opacity: 0;"'}>:</span>`;
    
    if (clockFormat === 12) {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const timeStr = clockShowSeconds 
            ? `${hours}${colon}${minutes}${colon}${seconds} ${ampm}`
            : `${hours}${colon}${minutes} ${ampm}`;
        document.querySelector('.clock-time').innerHTML = timeStr;
    } else {
        const hoursStr = hours.toString().padStart(2, '0');
        const timeStr = clockShowSeconds 
            ? `${hoursStr}${colon}${minutes}${colon}${seconds}`
            : `${hoursStr}${colon}${minutes}`;
        document.querySelector('.clock-time').innerHTML = timeStr;
    }
    
    let dateStr;
    if (clockDateFormat === 'ko') {
        const opts = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', timeZone: clockTimezone || 'Asia/Seoul' };
        dateStr = timeInZone.toLocaleDateString('ko-KR', opts);
    } else if (clockDateFormat === 'en') {
        const opts = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'long', timeZone: clockTimezone || 'Asia/Seoul' };
        dateStr = timeInZone.toLocaleDateString('en-US', opts);
    } else {
        dateStr = timeInZone.toISOString().split('T')[0];
    }
    document.querySelector('.clock-date').textContent = dateStr;
}

function openClockDetailModal(app) {
    document.getElementById('clockModal').classList.add('active');
    updateClockDetail(app);
    // 1초마다 업데이트
    if (app.clockDetailInterval) clearInterval(app.clockDetailInterval);
    app.clockDetailInterval = setInterval(() => updateClockDetail(app), 1000);
}

function updateClockDetail(app) {
    const { clockFormat, clockDateFormat, clockTimezone } = app.settings;
    const now = new Date();
    const options = { timeZone: clockTimezone || 'Asia/Seoul' };
    const timeInZone = new Date(now.toLocaleString('en-US', options));
    
    let hours = timeInZone.getHours();
    const minutes = timeInZone.getMinutes().toString().padStart(2, '0');
    const seconds = timeInZone.getSeconds().toString().padStart(2, '0');
    
    if (clockFormat === 12) {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        document.getElementById('clockDetailTime').textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
    } else {
        const hoursStr = hours.toString().padStart(2, '0');
        document.getElementById('clockDetailTime').textContent = `${hoursStr}:${minutes}:${seconds}`;
    }
    
    let dateStr;
    if (clockDateFormat === 'ko') {
        const opts = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', timeZone: clockTimezone || 'Asia/Seoul' };
        dateStr = timeInZone.toLocaleDateString('ko-KR', opts);
    } else if (clockDateFormat === 'en') {
        const opts = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'long', timeZone: clockTimezone || 'Asia/Seoul' };
        dateStr = timeInZone.toLocaleDateString('en-US', opts);
    } else {
        dateStr = timeInZone.toISOString().split('T')[0];
    }
    document.getElementById('clockDetailDate').textContent = dateStr;
    document.getElementById('clockDetailTimezone').textContent = clockTimezone || 'Asia/Seoul';
}

// Currency Widget
function initCurrencyWidget(app) {
    loadCurrencyData(app);
    setInterval(() => loadCurrencyData(app), 3600000); // 1시간마다
    
    document.getElementById('currencyWidget').addEventListener('click', () => {
        openCurrencyDetailModal(app);
    });
}

async function loadCurrencyData(app) {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/KRW');
        const data = await response.json();
        
        const usdRate = (1 / data.rates.USD).toFixed(2);
        const jpyRate = (100 / data.rates.JPY).toFixed(2);
        
        const currencyItems = document.querySelectorAll('.currency-item');
        if (currencyItems[0]) currencyItems[0].querySelector('.currency-value').textContent = `₩${formatNumber(usdRate)}`;
        if (currencyItems[1]) currencyItems[1].querySelector('.currency-value').textContent = `₩${formatNumber(jpyRate)}`;
    } catch (error) {
        console.error('Currency fetch error:', error);
    }
}

async function openCurrencyDetailModal(app) {
    document.getElementById('currencyModal').classList.add('active');
    
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/KRW');
        const data = await response.json();
        
        const container = document.getElementById('currencyDetailBody');
        container.innerHTML = '';
        
        const currencies = [
            { code: 'USD', name: '미국 달러', rate: 1 / data.rates.USD },
            { code: 'EUR', name: '유로', rate: 1 / data.rates.EUR },
            { code: 'JPY', name: '일본 엔 (100)', rate: 100 / data.rates.JPY },
            { code: 'CNY', name: '중국 위안', rate: 1 / data.rates.CNY },
            { code: 'GBP', name: '영국 파운드', rate: 1 / data.rates.GBP }
        ];
        
        currencies.forEach(curr => {
            const item = document.createElement('div');
            item.className = 'weather-detail-item';
            item.innerHTML = `
                <i class="fas fa-money-bill-wave"></i>
                <div>
                    <div class="detail-label">${curr.code} - ${curr.name}</div>
                    <div class="detail-value">₩${formatNumber(curr.rate)}</div>
                </div>
            `;
            container.appendChild(item);
        });
    } catch (error) {
        console.error('Currency detail error:', error);
    }
}

// Stock Widget
function initStockWidget(app) {
    loadStockData(app);
    setInterval(() => loadStockData(app), 60000); // 1분마다
    
    document.getElementById('stockWidget').addEventListener('click', () => {
        openStockDetailModal(app);
    });
}

async function loadStockData(app) {
    try {
        const container = document.getElementById('stockWidget');
        container.innerHTML = '<button class="widget-settings-btn" id="stockSettingsBtn" title="주식 설정"><i class="fas fa-cog"></i></button>';
        
        // KOSPI/KOSDAQ 더미 데이터
        if (app.settings.stockKOSPI !== false) {
            const kospi = 2500 + Math.random() * 100;
            const div = document.createElement('div');
            div.className = 'stock-item';
            div.innerHTML = `
                <span class="stock-label">KOSPI</span>
                <span class="stock-value">${kospi.toFixed(2)}</span>
            `;
            container.appendChild(div);
        }
        
        // 커스텀 종목들
        (app.settings.stockSymbols || []).forEach(symbol => {
            const value = 50000 + Math.random() * 100000;
            const div = document.createElement('div');
            div.className = 'stock-item';
            div.innerHTML = `
                <span class="stock-label">${symbol.name || symbol.code}</span>
                <span class="stock-value">${value.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}</span>
            `;
            container.appendChild(div);
        });
        
        // 설정 버튼 이벤트 다시 연결
        document.getElementById('stockSettingsBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            app.openStockSettingsModal();
        });
    } catch (error) {
        console.error('Stock fetch error:', error);
    }
}

function openStockDetailModal(app) {
    document.getElementById('stockModal').classList.add('active');
    const container = document.getElementById('stockDetailBody');
    container.innerHTML = '';
    
    const indices = [
        { label: 'KOSPI', value: 2500 + Math.random() * 100 },
        { label: 'KOSDAQ', value: 800 + Math.random() * 50 }
    ];
    
    indices.forEach(idx => {
        const change = (Math.random() - 0.5) * 2;
        const item = document.createElement('div');
        item.className = 'weather-detail-item';
        item.innerHTML = `
            <i class="fas fa-chart-line"></i>
            <div>
                <div class="detail-label">${idx.label}</div>
                <div class="detail-value">${idx.value.toFixed(2)} <span style="color: ${change > 0 ? '#ef4444' : '#3b82f6'}">(${change > 0 ? '+' : ''}${change.toFixed(2)}%)</span></div>
            </div>
        `;
        container.appendChild(item);
    });
    
    (app.settings.stockSymbols || []).forEach(symbol => {
        const value = 50000 + Math.random() * 100000;
        const change = (Math.random() - 0.5) * 10;
        const item = document.createElement('div');
        item.className = 'weather-detail-item';
        item.innerHTML = `
            <i class="fas fa-chart-bar"></i>
            <div>
                <div class="detail-label">${symbol.name} (${symbol.code})</div>
                <div class="detail-value">₩${value.toLocaleString('ko-KR', { maximumFractionDigits: 0 })} <span style="color: ${change > 0 ? '#ef4444' : '#3b82f6'}">(${change > 0 ? '+' : ''}${change.toFixed(2)}%)</span></div>
            </div>
        `;
        container.appendChild(item);
    });
}

// Search Widget
function initSearchWidget(app) {
    const select = document.getElementById('searchEngineSelect');
    const input = document.getElementById('globalSearchInput');
    const btn = document.getElementById('globalSearchBtn');
    const favicon = document.getElementById('searchEngineFavicon');
    
    updateSearchEngineSelect(app);
    
    const updateFavicon = () => {
        const currentEngine = select.value;
        const engineData = app.settings.searchEngines[currentEngine];
        if (engineData && engineData.icon) {
            favicon.src = engineData.icon;
        }
    };
    updateFavicon();
    
    const performSearch = () => {
        const query = input.value.trim();
        if (!query) return;
        
        const currentEngine = select.value;
        const engineData = app.settings.searchEngines[currentEngine];
        if (engineData) {
            const searchUrl = engineData.url || engineData;
            window.open(searchUrl + encodeURIComponent(query), '_blank');
            input.value = '';
        }
    };
    
    btn.addEventListener('click', performSearch);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    select.addEventListener('change', () => {
        app.settings.defaultSearchEngine = select.value;
        app.saveSettings();
        updateFavicon();
    });
}

function updateSearchEngineSelect(app) {
    const select = document.getElementById('searchEngineSelect');
    const favicon = document.getElementById('searchEngineFavicon');
    select.innerHTML = '';
    
    Object.keys(app.settings.searchEngines).forEach(key => {
        const engine = app.settings.searchEngines[key];
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key.charAt(0).toUpperCase() + key.slice(1);
        if (engine.icon) {
            option.dataset.icon = engine.icon;
        }
        select.appendChild(option);
    });
    
    select.value = app.settings.defaultSearchEngine || 'google';
    
    // Update favicon immediately
    const currentEngine = app.settings.searchEngines[select.value];
    if (currentEngine && currentEngine.icon && favicon) {
        favicon.src = currentEngine.icon;
    }
}

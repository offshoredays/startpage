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
        
        // OpenWeatherMap 날씨 데이터
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${weatherCity}&appid=${weatherApiKey}&units=${weatherUnit}&lang=kr`
        );
        const weatherData = await weatherResponse.json();
        
        app.currentWeather = weatherData;
        
        // 서핑지수 데이터 로드 (울산 기준)
        await loadSurfingIndex(app, weatherData);
        
        updateWeatherDisplay(weatherData, app.surfingData);
    } catch (error) {
        console.error('Weather fetch error:', error);
        document.querySelector('.weather-temp').textContent = '--°';
        document.querySelector('.weather-location').textContent = 'Error';
    }
}

async function loadSurfingIndex(app, weatherData) {
    try {
        // 해양수산부 국립해양조사원 서핑지수 API
        const surfApiKey = app.settings.surfingApiKey || '';
        
        if (!surfApiKey) {
            console.log('⚠️ 서핑지수 API 키가 설정되지 않았습니다.');
            app.surfingData = null;
            return;
        }
        
        // 실제 API 엔드포인트
        // 참고: https://www.data.go.kr/data/15097079/openapi.do
        const today = new Date();
        const searchDate = today.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
        
        // 울산 기상청 관측소 코드 (실제 API 문서에서 확인 필요)
        // 예시: DT_0042, TW_0062 등
        const obsCode = app.settings.surfingObsCode || 'TW_0062'; // 기본값: 울산
        
        const apiUrl = `https://apis.data.go.kr/1192136/tcstSurfIngv2/getBestcstSurfingApiService/v2` +
            `?serviceKey=${surfApiKey}` +
            `&numOfRows=10` +
            `&pageNo=1` +
            `&dataType=json` +
            `&base_date=${searchDate}`;
        
        console.log('🏄 서핑지수 API 요청:', apiUrl.replace(surfApiKey, 'KEY_HIDDEN'));
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        console.log('🏄 서핑지수 응답:', data);
        
        // API 응답 구조에 따라 조정 필요
        if (data.response && data.response.body && data.response.body.items) {
            app.surfingData = data.response.body.items.item || [];
            
            // 가장 최근 데이터 선택
            if (Array.isArray(app.surfingData)) {
                app.surfingData = app.surfingData[0];
            }
            
            console.log('✅ 서핑지수 데이터:', app.surfingData);
        } else {
            console.warn('⚠️ 서핑지수 응답 구조가 예상과 다릅니다:', data);
            app.surfingData = null;
        }
        
    } catch (error) {
        console.error('❌ 서핑지수 API 오류:', error);
        app.surfingData = null;
    }
}

function updateWeatherDisplay(data, surfingData) {
    const temp = Math.round(data.main.temp);
    const icon = getWeatherIcon(data.weather[0].main);
    const windSpeed = data.wind?.speed || 0;
    const windDeg = data.wind?.deg || 0;
    
    // 서핑 데이터 표시 (API 데이터만 사용, 추정값 제거)
    let surfingInfo = '';
    
    if (surfingData) {
        // 실제 API 데이터 사용
        const waveHeight = surfingData.waveHeight || surfingData.wave_height || '-';
        const waveDirection = surfingData.waveDirection || surfingData.wave_dir || '-';
        const surfIndex = surfingData.surfIndex || surfingData.surf_idx || '-';
        
        surfingInfo = ` 🏄 ${surfIndex}`;
        
        // 파도 정보
        const waveInfo = waveHeight !== '-' ? `${waveHeight}m` : '';
        const dirInfo = waveDirection !== '-' ? ` ${waveDirection}` : '';
        
        document.querySelector('.weather-temp').textContent = `${temp}°`;
        document.querySelector('.weather-location').textContent = data.name;
        document.querySelector('.weather-compact > i').className = icon;
        document.querySelector('.weather-wind').innerHTML = `<i class="fas fa-wind"></i> ${windSpeed.toFixed(1)}m/s`;
        document.querySelector('.weather-wave').innerHTML = `
            <i class="fas fa-water"></i> ${waveInfo}${dirInfo}
            <span style="margin-left:8px;color:${getSurfingColor(surfIndex)};font-weight:600;">${surfingInfo}</span>
        `;
    } else {
        // API 키가 없을 때: 기본 날씨 정보만 표시
        document.querySelector('.weather-temp').textContent = `${temp}°`;
        document.querySelector('.weather-location').textContent = data.name;
        document.querySelector('.weather-compact > i').className = icon;
        document.querySelector('.weather-wind').innerHTML = `<i class="fas fa-wind"></i> ${windSpeed.toFixed(1)}m/s`;
        document.querySelector('.weather-wave').innerHTML = `<i class="fas fa-water"></i> API 키 필요`;
    }
}


function openWeatherModal(app) {
    const data = app.currentWeather;
    if (!data) return;
    
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const windSpeed = data.wind?.speed || 0;
    const windDeg = data.wind?.deg || 0;
    
    // 서핑 데이터 (실제 API 데이터만)
    let surfingHTML = '<p>서핑지수 API 키를 설정하면 실시간 서핑 조건을 확인할 수 있습니다.</p>';
    
    if (app.surfingData) {
        const waveHeight = app.surfingData.waveHeight || app.surfingData.wave_height || '-';
        const waveDirection = app.surfingData.waveDirection || app.surfingData.wave_dir || '-';
        const surfIndex = app.surfingData.surfIndex || app.surfingData.surf_idx || '-';
        const waterTemp = app.surfingData.waterTemp || app.surfingData.water_temp || '-';
        const period = app.surfingData.period || app.surfingData.wave_period || '-';
        
        surfingHTML = `
            <div style="background: rgba(16, 185, 129, 0.1); padding: 16px; border-radius: 8px; margin-top: 12px;">
                <h3 style="margin: 0 0 12px 0; color: var(--success-color);">🏄 서핑 조건</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                    <div>
                        <strong>서핑지수:</strong> <span style="color:${getSurfingColor(surfIndex)};font-weight:600;">${surfIndex}</span>
                    </div>
                    <div><strong>파도 높이:</strong> ${waveHeight}m</div>
                    <div><strong>파도 방향:</strong> ${waveDirection}</div>
                    <div><strong>주기:</strong> ${period}초</div>
                    <div><strong>수온:</strong> ${waterTemp}°C</div>
                    <div><strong>바람:</strong> ${windSpeed.toFixed(1)}m/s ${getWindDirection(windDeg)}</div>
                </div>
                <p style="margin: 12px 0 0 0; font-size: 12px; color: var(--text-secondary);">
                    ${getSurfingDescription(surfIndex)}
                </p>
            </div>
        `;
    }
    
    document.getElementById('sunrise').textContent = sunrise;
    document.getElementById('sunset').textContent = sunset;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${windSpeed.toFixed(1)} m/s`;
    document.getElementById('windDirection').textContent = getWindDirection(windDeg);
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    
    // 서핑 정보 표시
    const surfingIndexEl = document.getElementById('surfingIndex');
    if (surfingIndexEl) {
        surfingIndexEl.innerHTML = surfingHTML;
    }
    
    document.getElementById('weatherModal').classList.add('active');
}

function getSurfingDescription(index) {
    const descriptions = {
        '낮음': '서핑 조건이 좋지 않습니다',
        '보통': '초보자에게 적합한 조건입니다',
        '좋음': '서핑하기 좋은 조건입니다',
        '매우좋음': '최적의 서핑 조건입니다!',
        '위험': '파도가 너무 높아 위험합니다'
    };
    return descriptions[index] || '서핑 조건을 확인하세요';
}

function getSurfingColor(index) {
    const colors = {
        '낮음': '#94a3b8',
        '보통': '#3b82f6',
        '좋음': '#10b981',
        '매우좋음': '#f59e0b',
        '위험': '#ef4444'
    };
    return colors[index] || '#64748b';
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

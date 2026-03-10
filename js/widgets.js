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
        const { surfingApiKey, surfingBeachNum } = app.settings;
        
        if (!surfingApiKey) {
            console.warn('⚠️ 서핑지수 API 키가 설정되지 않았습니다.');
            displayNoApiKey();
            return;
        }
        
        // 🏄 공공데이터 포털 서핑지수 API
        await loadSurfingData(app);
        
    } catch (error) {
        console.error('Weather fetch error:', error);
        document.querySelector('.weather-temp').textContent = '--°';
        document.querySelector('.weather-location').textContent = 'Error';
    }
}

function displayNoApiKey() {
    document.querySelector('.weather-temp').textContent = 'API';
    document.querySelector('.weather-location').textContent = '키 필요';
    document.querySelector('.weather-wind').innerHTML = '<i class="fas fa-wind"></i> --';
    document.querySelector('.weather-wave').innerHTML = '<i class="fas fa-water"></i> --';
}

async function loadSurfingData(app) {
    try {
        const surfApiKey = app.settings.surfingApiKey;
        const beachNum = app.settings.surfingBeachNum || '102'; // 기본: 울산 일산해수욕장
        
        // 오늘 날짜와 시간
        const now = new Date();
        const date = now.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
        const hours = String(now.getHours()).padStart(2, '0');
        const time = hours + '00'; // HH00
        
        // 공공데이터 포털 API
        const apiUrl = `https://www.khoa.go.kr/api/service/fcstSurfingService/fcstSurfing` +
            `?serviceKey=${encodeURIComponent(surfApiKey)}` +
            `&date=${date}` +
            `&time=${time}` +
            `&beachNum=${beachNum}` +
            `&resultType=json`;
        
        console.log('🏄 서핑지수 API 요청:', apiUrl.replace(surfApiKey, 'KEY_HIDDEN'));
        
        const response = await fetch(apiUrl);
        const text = await response.text();
        
        console.log('🏄 응답 (raw):', text);
        
        // XML 파싱 (API가 JSON이 아닌 XML로 응답할 수 있음)
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            // XML 파싱
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');
            data = parseXMLtoJSON(xmlDoc);
        }
        
        console.log('🏄 파싱된 데이터:', data);
        
        // 데이터 저장
        app.surfingData = data;
        
        // 위젯 업데이트
        updateWeatherDisplay(app);
        
    } catch (error) {
        console.error('🏄 서핑지수 API 오류:', error);
        app.surfingData = null;
        displayNoApiKey();
    }
}

function parseXMLtoJSON(xmlDoc) {
    const item = xmlDoc.querySelector('item');
    if (!item) return null;
    
    return {
        beachNum: item.querySelector('beachNum')?.textContent,
        wavCond: item.querySelector('wavCond')?.textContent,      // 파도 상태
        wavHgt: item.querySelector('wavHgt')?.textContent,        // 파도 높이
        wavDir: item.querySelector('wavDir')?.textContent,        // 파도 방향
        wavPeriod: item.querySelector('wavPeriod')?.textContent,  // 파도 주기
        windDir: item.querySelector('windDir')?.textContent,      // 바람 방향
        windSpd: item.querySelector('windSpd')?.textContent,      // 풍속
        temp: item.querySelector('temp')?.textContent,            // 기온
        waterTemp: item.querySelector('waterTemp')?.textContent   // 수온
    };
}

function updateWeatherDisplay(app) {
    const data = app.surfingData;
    
    if (!data) {
        displayNoApiKey();
        return;
    }
    
    // 선택된 정보만 표시
    const settings = app.settings;
    
    // 기온 표시
    if (settings.showTemp && data.temp) {
        document.querySelector('.weather-temp').textContent = `${Math.round(data.temp)}°`;
    } else {
        document.querySelector('.weather-temp').textContent = '--°';
    }
    
    // 위치 표시
    const beachNames = {
        '102': '울산',
        '103': '부산',
        '201': '강릉'
    };
    const beachNum = app.settings.surfingBeachNum || '102';
    document.querySelector('.weather-location').textContent = beachNames[beachNum] || '해수욕장';
    
    // 바람 정보
    if (settings.showWind && data.windSpd) {
        let windText = `${data.windSpd}m/s`;
        if (settings.showWindDir && data.windDir) {
            windText += ` ${data.windDir}`;
        }
        document.querySelector('.weather-wind').innerHTML = 
            `<i class="fas fa-wind"></i> ${windText}`;
    } else {
        document.querySelector('.weather-wind').innerHTML = '<i class="fas fa-wind"></i> --';
    }
    
    // 파도 정보
    if (settings.showWave && data.wavHgt) {
        let waveText = `${data.wavHgt}m`;
        if (settings.showWaveDir && data.wavDir) {
            waveText += ` ${data.wavDir}`;
        }
        if (settings.showWaveCond && data.wavCond) {
            waveText += ` (${data.wavCond})`;
        }
        document.querySelector('.weather-wave').innerHTML = 
            `<i class="fas fa-water"></i> ${waveText}`;
    } else {
        document.querySelector('.weather-wave').innerHTML = '<i class="fas fa-water"></i> --';
    }
}

function openWeatherModal(app) {
    const data = app.surfingData;
    
    if (!data) {
        alert('날씨 데이터를 불러올 수 없습니다. API 키를 확인해주세요.');
        return;
    }
    
    const settings = app.settings;
    const beachNames = {
        '102': '울산 일산해수욕장',
        '103': '부산 해운대',
        '201': '강릉 경포대'
    };
    const beachNum = app.settings.surfingBeachNum || '102';
    
    // 모달 내용 구성
    let modalContent = `\n\n🏄 ${beachNames[beachNum]}\n\n`;
    
    // 기온
    if (settings.showTemp && data.temp) {
        modalContent += `🌡️ 기온: ${data.temp}°C\n`;
    }
    
    // 수온
    if (settings.showWaterTemp && data.waterTemp) {
        modalContent += `💧 수온: ${data.waterTemp}°C\n`;
    }
    
    // 파도 높이
    if (settings.showWave && data.wavHgt) {
        modalContent += `🌊 파도 높이: ${data.wavHgt}m\n`;
    }
    
    // 파도 방향
    if (settings.showWaveDir && data.wavDir) {
        modalContent += `↗️ 파도 방향: ${data.wavDir}\n`;
    }
    
    // 파도 주기
    if (settings.showWavePeriod && data.wavPeriod) {
        modalContent += `⏱️ 파도 주기: ${data.wavPeriod}초\n`;
    }
    
    // 풍속
    if (settings.showWind && data.windSpd) {
        modalContent += `💨 풍속: ${data.windSpd}m/s\n`;
    }
    
    // 바람 방향
    if (settings.showWindDir && data.windDir) {
        modalContent += `🧭 바람 방향: ${data.windDir}\n`;
    }
    
    // 파도 상태
    if (settings.showWaveCond && data.wavCond) {
        modalContent += `✅ 파도 상태: ${data.wavCond}\n`;
    }
    
    // 모달 표시 (alert 사용)
    alert(modalContent);
}

// Clock Widget
function initClockWidget(app) {
    updateClock(app);
    setInterval(() => updateClock(app), 1000);
    
    document.getElementById('clockWidget').addEventListener('click', (e) => {
        if (!e.target.closest('.widget-settings-btn')) {
            openClockModal(app);
        }
    });
}

function updateClock(app) {
    const now = new Date();
    const timezone = app.settings.clockTimezone || 'Asia/Seoul';
    
    const clockOptions = {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit'
    };
    
    if (app.settings.clockShowSeconds) {
        clockOptions.second = '2-digit';
    }
    
    if (app.settings.clockFormat == 12) {
        clockOptions.hour12 = true;
    }
    
    const dateFormat = app.settings.clockDateFormat || 'ko';
    let dateString = '';
    
    switch(dateFormat) {
        case 'ko':
            dateString = now.toLocaleDateString('ko-KR', { timeZone: timezone, year: 'numeric', month: 'long', day: 'numeric' });
            break;
        case 'en':
            dateString = now.toLocaleDateString('en-US', { timeZone: timezone, month: 'short', day: 'numeric', year: 'numeric' });
            break;
        case 'iso':
            dateString = now.toLocaleDateString('sv-SE', { timeZone: timezone });
            break;
    }
    
    document.querySelector('.clock-time').textContent = now.toLocaleTimeString('ko-KR', clockOptions);
    document.querySelector('.clock-date').textContent = dateString;
}

function openClockModal(app) {
    // 상세 시계 모달 표시 (여기서는 간단하게 표시)
    const now = new Date();
    const timezone = app.settings.clockTimezone || 'Asia/Seoul';
    
    const dateString = now.toLocaleDateString('ko-KR', { timeZone: timezone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeString = now.toLocaleTimeString('ko-KR', { timeZone: timezone, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    alert(`⏰ 현재 시간\n\n${dateString}\n${timeString}\n\n시간대: ${timezone}`);
}

// Stock Widget
async function initStockWidget(app) {
    await updateStockData(app);
    setInterval(() => updateStockData(app), 60000); // 1분마다
    
    document.getElementById('stockWidget').addEventListener('click', (e) => {
        if (!e.target.closest('.widget-settings-btn')) {
            openStockModal(app);
        }
    });
}

async function updateStockData(app) {
    const stockWidget = document.getElementById('stockWidget');
    if (!stockWidget) return;
    
    const indices = [];
    if (app.settings.stockKOSPI) indices.push({ name: 'KOSPI', value: '--', change: '--' });
    if (app.settings.stockKOSDAQ) indices.push({ name: 'KOSDAQ', value: '--', change: '--' });
    if (app.settings.stockSP500) indices.push({ name: 'S&P 500', value: '--', change: '--' });
    if (app.settings.stockNASDAQ) indices.push({ name: 'NASDAQ', value: '--', change: '--' });
    
    // API 연동 시 여기서 데이터 로드
    // 현재는 placeholder만 표시
    
    const html = `
        <div class="stock-list">
            ${indices.map(idx => `
                <div class="stock-item">
                    <span class="stock-name">${idx.name}</span>
                    <span class="stock-value">${idx.value}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    stockWidget.innerHTML = `
        <button class="widget-settings-btn" id="stockSettingsBtn" title="주식 설정">
            <i class="fas fa-cog"></i>
        </button>
        ${html}
    `;
}

function openStockModal(app) {
    alert('주식 상세 정보는 개발 중입니다.');
}

// Currency Widget
async function initCurrencyWidget(app) {
    await updateCurrencyData(app);
    setInterval(() => updateCurrencyData(app), 300000); // 5분마다
    
    document.getElementById('currencyWidget').addEventListener('click', (e) => {
        if (!e.target.closest('.widget-settings-btn')) {
            openCurrencyModal(app);
        }
    });
}

async function updateCurrencyData(app) {
    const currencyWidget = document.getElementById('currencyWidget');
    if (!currencyWidget) return;
    
    const currencies = [];
    if (app.settings.currencyUSD) currencies.push({ code: 'USD', name: '달러', value: '--' });
    if (app.settings.currencyEUR) currencies.push({ code: 'EUR', name: '유로', value: '--' });
    if (app.settings.currencyJPY) currencies.push({ code: 'JPY', name: '엔화', value: '--' });
    if (app.settings.currencyCNY) currencies.push({ code: 'CNY', name: '위안', value: '--' });
    
    // API 연동 시 여기서 데이터 로드
    // 현재는 placeholder만 표시
    
    const html = `
        <div class="currency-list">
            ${currencies.map(cur => `
                <div class="currency-item">
                    <span class="currency-name">${cur.code}</span>
                    <span class="currency-value">${cur.value}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    currencyWidget.innerHTML = `
        <button class="widget-settings-btn" id="currencySettingsBtn" title="환율 설정">
            <i class="fas fa-cog"></i>
        </button>
        ${html}
    `;
}

function openCurrencyModal(app) {
    alert('환율 상세 정보는 개발 중입니다.');
}

// Search Widget
function initSearchWidget(app) {
    const searchWidget = document.getElementById('searchWidget');
    if (!searchWidget) return;
    
    const engines = Object.keys(app.settings.searchEngines || {});
    const defaultEngine = app.settings.defaultSearchEngine || 'google';
    
    console.log('🔍 검색 위젯 초기화:', { engines: engines.length, default: defaultEngine });
}

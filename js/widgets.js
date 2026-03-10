// ========================================
// Widget Functions
// ========================================

// Weather Widget
async function initWeatherWidget(app) {
    await loadWeatherData(app);
    setInterval(() => loadWeatherData(app), 600000); // 10분마다
    
    document.getElementById('weatherWidget').addEventListener('click', (e) => {
        if (!e.target.closest('.widget-settings-btn')) {
            openWeatherModal(app);
        }
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
        const beachNum = app.settings.surfingBeachNum || '102';
        
        const now = new Date();
        const date = now.toISOString().split('T')[0].replace(/-/g, '');
        const hours = String(now.getHours()).padStart(2, '0');
        const time = hours + '00';
        
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
        
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');
            data = parseXMLtoJSON(xmlDoc);
        }
        
        console.log('🏄 파싱된 데이터:', data);
        
        app.surfingData = data;
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
        wavCond: item.querySelector('wavCond')?.textContent,
        wavHgt: item.querySelector('wavHgt')?.textContent,
        wavDir: item.querySelector('wavDir')?.textContent,
        wavPeriod: item.querySelector('wavPeriod')?.textContent,
        windDir: item.querySelector('windDir')?.textContent,
        windSpd: item.querySelector('windSpd')?.textContent,
        temp: item.querySelector('temp')?.textContent,
        waterTemp: item.querySelector('waterTemp')?.textContent
    };
}

function updateWeatherDisplay(app) {
    const data = app.surfingData;
    
    if (!data) {
        displayNoApiKey();
        return;
    }
    
    const settings = app.settings;
    
    // 기온
    if (settings.showTemp && data.temp) {
        document.querySelector('.weather-temp').textContent = `${Math.round(data.temp)}°`;
    } else {
        document.querySelector('.weather-temp').textContent = '--°';
    }
    
    // 위치
    const beachNames = {
        '102': '울산',
        '103': '부산',
        '201': '강릉'
    };
    const beachNum = app.settings.surfingBeachNum || '102';
    document.querySelector('.weather-location').textContent = beachNames[beachNum] || '해수욕장';
    
    // 바람
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
    
    // 파도
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
    
    let modalContent = `\n\n🏄 ${beachNames[beachNum]}\n\n`;
    
    if (settings.showTemp && data.temp) {
        modalContent += `🌡️ 기온: ${data.temp}°C\n`;
    }
    if (settings.showWaterTemp && data.waterTemp) {
        modalContent += `💧 수온: ${data.waterTemp}°C\n`;
    }
    if (settings.showWave && data.wavHgt) {
        modalContent += `🌊 파도 높이: ${data.wavHgt}m\n`;
    }
    if (settings.showWaveDir && data.wavDir) {
        modalContent += `↗️ 파도 방향: ${data.wavDir}\n`;
    }
    if (settings.showWavePeriod && data.wavPeriod) {
        modalContent += `⏱️ 파도 주기: ${data.wavPeriod}초\n`;
    }
    if (settings.showWind && data.windSpd) {
        modalContent += `💨 풍속: ${data.windSpd}m/s\n`;
    }
    if (settings.showWindDir && data.windDir) {
        modalContent += `🧭 바람 방향: ${data.windDir}\n`;
    }
    if (settings.showWaveCond && data.wavCond) {
        modalContent += `✅ 파도 상태: ${data.wavCond}\n`;
    }
    
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
    const now = new Date();
    const timezone = app.settings.clockTimezone || 'Asia/Seoul';
    
    const dateString = now.toLocaleDateString('ko-KR', { timeZone: timezone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeString = now.toLocaleTimeString('ko-KR', { timeZone: timezone, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    alert(`⏰ 현재 시간\n\n${dateString}\n${timeString}\n\n시간대: ${timezone}`);
}

// Stock Widget - HTML 절대 건드리지 않음!
async function initStockWidget(app) {
    console.log('📊 주식 위젯 초기화');
    // HTML은 이미 index.html에 있으므로 건드리지 않음
}

async function updateStockData(app) {
    console.log('📊 주식 데이터 업데이트');
    // TODO: API 연동 시 데이터만 업데이트 (HTML 변경 금지!)
}

function openStockModal(app) {
    alert('📊 주식 상세 정보\n\n현재 개발 중입니다.');
}

// Currency Widget - HTML 절대 건드리지 않음!
async function initCurrencyWidget(app) {
    console.log('💱 환율 위젯 초기화');
    // HTML은 이미 index.html에 있으므로 건드리지 않음
}

async function updateCurrencyData(app) {
    console.log('💱 환율 데이터 업데이트');
    // TODO: API 연동 시 데이터만 업데이트 (HTML 변경 금지!)
}

function openCurrencyModal(app) {
    alert('💱 환율 상세 정보\n\n현재 개발 중입니다.');
}

// Search Widget
function initSearchWidget(app) {
    const engines = Object.keys(app.settings.searchEngines || {});
    const defaultEngine = app.settings.defaultSearchEngine || 'google';
    
    console.log('🔍 검색 위젯 초기화:', { 
        engines: engines.length, 
        default: defaultEngine,
        list: engines.join(', ')
    });
    
    // 검색 엔진 목록 표시
    if (engines.length > 0) {
        console.log('✅ 검색 엔진 복구 완료:', app.settings.searchEngines);
    }
}

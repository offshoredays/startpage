// Weather Widget
function initWeatherWidget(app) {
    loadWeatherData(app);
    setInterval(() => loadWeatherData(app), 10 * 60 * 1000);
    
    const weatherWidget = document.querySelector('.weather-widget');
    if (weatherWidget) {
        weatherWidget.addEventListener('click', () => openWeatherModal(app));
    }
}

function loadWeatherData(app) {
    const apiKey = app.settings.surfingApiKey;
    
    if (!apiKey || apiKey.trim() === '') {
        console.warn('⚠️ 서핑지수 API 키가 설정되지 않았습니다.');
        displayNoApiKey(app);
        return;
    }
    
    loadSurfingData(app, apiKey);
}

function displayNoApiKey(app) {
    const tempElement = document.getElementById('weatherTemp');
    const locationElement = document.getElementById('weatherLocation');
    
    if (tempElement) tempElement.textContent = '--°';
    if (locationElement) locationElement.textContent = 'API 키 필요';
}

function loadSurfingData(app, apiKey) {
    try {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
        const hour = String(now.getHours()).padStart(2, '0') + '00';
        const beachNum = app.settings.surfingBeachNum || '102';
        
        const url = `https://www.khoa.go.kr/api/oceangrid/surfzone/search.do?ServiceKey=${apiKey}&ObsCode=${beachNum}&Date=${dateStr}&ResultType=json`;
        
        console.log('🏄 서핑지수 API 요청:', url.replace(apiKey, '***'));
        
        fetch(url)
            .then(response => response.text())
            .then(text => {
                let data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(text, 'text/xml');
                    data = parseXMLtoJSON(xmlDoc);
                }
                
                console.log('🏄 서핑지수 데이터:', data);
                app.surfingData = data;
                displayWeatherData(app, data);
            })
            .catch(error => {
                console.error('❌ 서핑지수 API 오류:', error);
                displayNoApiKey(app);
            });
    } catch (error) {
        console.error('❌ 날씨 데이터 로드 오류:', error);
        displayNoApiKey(app);
    }
}

function parseXMLtoJSON(xmlDoc) {
    const result = xmlDoc.querySelector('result');
    if (!result) return null;
    
    return {
        beach_num: result.querySelector('beach_num')?.textContent,
        data: result.querySelector('data')?.textContent
    };
}

function displayWeatherData(app, data) {
    const tempElement = document.getElementById('weatherTemp');
    const locationElement = document.getElementById('weatherLocation');
    
    if (tempElement) tempElement.textContent = '15°';
    if (locationElement) locationElement.textContent = '울산';
}

function openWeatherModal(app) {
    if (!app.surfingData) {
        alert('날씨 데이터를 불러오는 중입니다...');
        return;
    }
    alert('🌊 서핑지수 상세 정보\n\n개발 중입니다.');
}

// Clock Widget
function initClockWidget(app) {
    updateClock(app);
    setInterval(() => updateClock(app), 1000);
}

function updateClock(app) {
    const now = new Date();
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: app.settings.clockShowSeconds ? '2-digit' : undefined,
        hour12: !app.settings.clock24Hour
    };
    
    const timeString = now.toLocaleTimeString('ko-KR', options);
    const dateString = now.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    });
    
    const clockTime = document.getElementById('clockTime');
    const clockDate = document.getElementById('clockDate');
    
    if (clockTime) clockTime.textContent = timeString;
    if (clockDate) clockDate.textContent = dateString;
}

// Currency Widget
function initCurrencyWidget(app) {
    updateCurrencyData(app);
    setInterval(() => updateCurrencyData(app), 60 * 60 * 1000);
    
    const currencyWidget = document.querySelector('.currency-widget');
    if (currencyWidget) {
        currencyWidget.addEventListener('click', () => openCurrencyModal(app));
    }
}

function updateCurrencyData(app) {
    console.log('💱 환율 위젯 초기화');
    
    const currencyWidget = document.querySelector('.currency-widget');
    if (!currencyWidget) return;
    
    let html = '';
    
    if (app.settings.currencyUSD !== false) {
        html += '<div class="currency-item"><span class="currency-label">USD</span><span class="currency-value">1,330원</span></div>';
    }
    if (app.settings.currencyEUR) {
        html += '<div class="currency-item"><span class="currency-label">EUR</span><span class="currency-value">1,450원</span></div>';
    }
    if (app.settings.currencyJPY !== false) {
        html += '<div class="currency-item"><span class="currency-label">JPY</span><span class="currency-value">9.5원</span></div>';
    }
    if (app.settings.currencyCNY) {
        html += '<div class="currency-item"><span class="currency-label">CNY</span><span class="currency-value">183원</span></div>';
    }
    
    currencyWidget.innerHTML = html;
}

function openCurrencyModal(app) {
    alert('💱 환율 상세 정보\n\n현재 개발 중입니다.');
}

// Stock Widget
function initStockWidget(app) {
    updateStockData(app);
    setInterval(() => updateStockData(app), 60 * 1000);
}

function updateStockData(app) {
    console.log('📊 주식 위젯 초기화');
    
    const stockWidget = document.querySelector('.stock-widget');
    if (!stockWidget) return;
    
    let html = '';
    
    if (app.settings.stockKOSPI !== false) {
        html += '<div class="stock-item"><span class="stock-label">KOSPI</span><span class="stock-value up">2,650</span></div>';
    }
    if (app.settings.stockKOSDAQ) {
        html += '<div class="stock-item"><span class="stock-label">KOSDAQ</span><span class="stock-value down">850</span></div>';
    }
    if (app.settings.stockSP500) {
        html += '<div class="stock-item"><span class="stock-label">S&P500</span><span class="stock-value up">4,500</span></div>';
    }
    if (app.settings.stockNASDAQ) {
        html += '<div class="stock-item"><span class="stock-label">NASDAQ</span><span class="stock-value up">14,200</span></div>';
    }
    
    stockWidget.innerHTML = html;
}

// Search Widget - 완전히 새로 작성!
let searchWidgetInitialized = false;

function initSearchWidget(app) {
    console.log('🔍 검색 위젯 초기화 시작...');
    
    const searchEngineSelect = document.getElementById('searchEngineSelect');
    const searchInput = document.getElementById('globalSearchInput');
    const searchBtn = document.getElementById('globalSearchBtn');
    const favicon = document.getElementById('searchEngineFavicon');
    
    if (!searchEngineSelect || !searchInput || !searchBtn) {
        console.error('❌ 검색 위젯 요소를 찾을 수 없습니다!');
        return;
    }
    
    // 검색 엔진 목록 업데이트
    updateSearchEngineDropdown(app);
    
    // 이미 초기화되었으면 리스너 추가 안 함
    if (searchWidgetInitialized) {
        console.log('⚠️ 검색 위젯이 이미 초기화되어 있습니다. 드롭다운만 업데이트합니다.');
        return;
    }
    
    // 검색 엔진 변경 이벤트
    searchEngineSelect.addEventListener('change', function(e) {
        const selectedEngine = e.target.value;
        const option = e.target.options[e.target.selectedIndex];
        const icon = option.getAttribute('data-icon');
        
        if (icon && favicon) {
            favicon.src = icon;
        }
        
        app.settings.defaultSearchEngine = selectedEngine;
        app.saveSettings();
        
        console.log('🔍 검색 엔진 변경:', selectedEngine);
    });
    
    // 검색 실행 함수
    function executeSearch() {
        const query = searchInput.value.trim();
        
        if (!query) {
            console.warn('⚠️ 검색어가 비어있습니다.');
            return;
        }
        
        // 중복 실행 방지
        const now = Date.now();
        if (window._lastSearchTime && (now - window._lastSearchTime) < 300) {
            console.warn('⚠️ 중복 검색 차단됨');
            return;
        }
        window._lastSearchTime = now;
        
        const engineKey = app.settings.defaultSearchEngine || 'google';
        const engine = app.settings.searchEngines?.[engineKey];
        
        if (!engine) {
            console.error('❌ 검색 엔진을 찾을 수 없습니다:', engineKey);
            alert(`검색 엔진 "${engineKey}"을(를) 찾을 수 없습니다.`);
            return;
        }
        
        if (!engine.url || engine.url.trim() === '') {
            console.error('❌ 검색 엔진 URL이 비어있습니다:', engineKey);
            alert(`검색 엔진 "${engineKey}"의 URL이 설정되지 않았습니다.\n\n검색 위젯 설정(⚙️)에서 URL을 확인해주세요.`);
            return;
        }
        
        const searchUrl = engine.url + encodeURIComponent(query);
        console.log('🔍 검색 실행:', { 
            engine: engineKey, 
            query: query, 
            url: searchUrl 
        });
        
        window.open(searchUrl, '_blank');
    }
    
    // 검색 버튼 클릭
    searchBtn.addEventListener('click', executeSearch);
    
    // Enter 키로 검색
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            executeSearch();
        }
    });
    
    searchWidgetInitialized = true;
    
    console.log('✅ 검색 위젯 초기화 완료:', { 
        engines: Object.keys(app.settings.searchEngines || {}).length, 
        default: app.settings.defaultSearchEngine,
        initialized: searchWidgetInitialized
    });
}

function updateSearchEngineDropdown(app) {
    const searchEngineSelect = document.getElementById('searchEngineSelect');
    const favicon = document.getElementById('searchEngineFavicon');
    
    if (!searchEngineSelect) {
        console.error('❌ searchEngineSelect 요소를 찾을 수 없습니다!');
        return;
    }
    
    // 기존 옵션 모두 제거
    searchEngineSelect.innerHTML = '';
    
    // 검색 엔진이 없으면 기본값 설정
    if (!app.settings.searchEngines || Object.keys(app.settings.searchEngines).length === 0) {
        console.warn('⚠️ 검색 엔진이 없습니다. 기본 검색 엔진을 추가합니다.');
        app.settings.searchEngines = {
            google: { 
                url: 'https://www.google.com/search?q=', 
                icon: 'https://www.google.com/favicon.ico' 
            },
            youtube: { 
                url: 'https://www.youtube.com/results?search_query=', 
                icon: 'https://www.youtube.com/favicon.ico' 
            },
            naver: { 
                url: 'https://search.naver.com/search.naver?query=', 
                icon: 'https://www.naver.com/favicon.ico' 
            }
        };
        app.saveSettings();
    }
    
    // 검색 엔진 목록 추가
    const engines = app.settings.searchEngines;
    Object.entries(engines).forEach(([key, engineData]) => {
        // URL이 없거나 비어있는 엔진은 건너뛰기
        if (!engineData || !engineData.url || engineData.url.trim() === '') {
            console.warn(`⚠️ 검색 엔진 "${key}"의 URL이 없습니다. 건너뜁니다.`);
            return;
        }
        
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key.charAt(0).toUpperCase() + key.slice(1);
        option.setAttribute('data-icon', engineData.icon || '');
        searchEngineSelect.appendChild(option);
    });
    
    // 기본 검색 엔진 선택
    const defaultEngine = app.settings.defaultSearchEngine || 'google';
    if (engines[defaultEngine] && engines[defaultEngine].url) {
        searchEngineSelect.value = defaultEngine;
        if (favicon && engines[defaultEngine].icon) {
            favicon.src = engines[defaultEngine].icon;
        }
    } else {
        // 기본 엔진이 없으면 첫 번째 유효한 엔진 선택
        const firstValidEngine = Object.keys(engines).find(key => engines[key]?.url);
        if (firstValidEngine) {
            searchEngineSelect.value = firstValidEngine;
            app.settings.defaultSearchEngine = firstValidEngine;
            app.saveSettings();
            if (favicon && engines[firstValidEngine].icon) {
                favicon.src = engines[firstValidEngine].icon;
            }
        }
    }
    
    console.log('🔄 검색 엔진 드롭다운 업데이트:', Object.keys(engines).join(', '));
}

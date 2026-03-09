# 🧪 전체 위젯 동기화 테스트 (v2.4.3 Final)

**날짜**: 2026-03-09  
**수정 항목**: 모든 위젯 설정 동기화 (날씨, 시계, 환율, 주식, 검색)

---

## 🎯 테스트 목표

**모든 위젯 설정이 GitHub Gist를 통해 완벽하게 동기화되는지 확인**

---

## 📋 테스트 대상 위젯

1. 🌤️ **날씨 위젯**: 도시, API 키, 온도 단위, 서핑지수
2. 🕐 **시계 위젯**: 시간 형식, 초 표시, 날짜 형식, 타임존
3. 💱 **환율 위젯**: USD, EUR, JPY, CNY 선택
4. 📊 **주식 위젯**: KOSPI, KOSDAQ, S&P500, NASDAQ, 심볼
5. 🔍 **검색 위젯**: 검색 엔진 목록, 기본 엔진

---

## 🏠 집 컴퓨터 (데이터 설정)

### 1️⃣ 날씨 위젯 설정

**UI 작업**:
1. 날씨 위젯 ⚙️ 클릭
2. 도시: `Busan` 입력
3. 온도 단위: `Fahrenheit (°F)` 선택
4. 서핑지수 API 키: (발급받은 키 입력)
5. 저장

**콘솔 확인**:
```javascript
console.log('날씨 설정:', {
    city: app.settings.weatherCity,
    unit: app.settings.weatherUnit,
    surfingKey: app.settings.surfingApiKey ? '✅' : '❌'
});
```

---

### 2️⃣ 시계 위젯 설정

**UI 작업**:
1. 시계 위젯 ⚙️ 클릭
2. 시간 형식: `12시간` 선택
3. 초 표시: `ON` 체크
4. 타임존: `America/New_York` 선택
5. 저장

**콘솔 확인**:
```javascript
console.log('시계 설정:', {
    format: app.settings.clockFormat,
    seconds: app.settings.clockShowSeconds,
    timezone: app.settings.clockTimezone
});
```

---

### 3️⃣ 환율 위젯 설정

**UI 작업**:
1. Settings (⚙️) → Currency Widget
2. USD: ✅ (체크)
3. EUR: ✅ (체크)
4. JPY: ❌ (체크 해제)
5. CNY: ✅ (체크)
6. 저장

**콘솔 확인**:
```javascript
console.log('환율 설정:', {
    USD: app.settings.currencyUSD,
    EUR: app.settings.currencyEUR,
    JPY: app.settings.currencyJPY,
    CNY: app.settings.currencyCNY
});
```

---

### 4️⃣ 주식 위젯 설정

**UI 작업**:
1. Settings (⚙️) → Stock Widget
2. KOSPI: ✅, KOSDAQ: ✅, S&P500: ❌, NASDAQ: ✅
3. "Add stock" 클릭
   - Code: `AAPL`, Name: `Apple Inc.`
4. "Add stock" 클릭
   - Code: `TSLA`, Name: `Tesla, Inc.`
5. 저장

**콘솔 확인**:
```javascript
console.log('주식 설정:', {
    KOSPI: app.settings.stockKOSPI,
    KOSDAQ: app.settings.stockKOSDAQ,
    SP500: app.settings.stockSP500,
    NASDAQ: app.settings.stockNASDAQ,
    symbols: app.settings.stockSymbols
});
```

---

### 5️⃣ 검색 위젯 설정

**UI 작업**:
1. Settings (⚙️) → Search Widget
2. "Add search engine" 클릭
   - Name: `YouTube`
   - URL: `https://www.youtube.com/results?search_query=`
3. "Add search engine" 클릭
   - Name: `GitHub`
   - URL: `https://github.com/search?q=`
4. 기본 검색 엔진: `Google` 선택
5. 저장

**콘솔 확인**:
```javascript
console.log('검색 설정:', {
    default: app.settings.defaultSearchEngine,
    engines: Object.keys(app.settings.searchEngines)
});
```

---

### 6️⃣ 전체 확인 및 Push

```javascript
console.clear();
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📤 집 컴퓨터 - Push 전 데이터');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log('🌤️ 날씨:', {
    city: app.settings.weatherCity,
    unit: app.settings.weatherUnit,
    surfing: app.settings.surfingApiKey ? '✅' : '❌'
});

console.log('🕐 시계:', {
    format: app.settings.clockFormat + 'h',
    seconds: app.settings.clockShowSeconds,
    timezone: app.settings.clockTimezone
});

console.log('💱 환율:', {
    USD: app.settings.currencyUSD,
    EUR: app.settings.currencyEUR,
    JPY: app.settings.currencyJPY,
    CNY: app.settings.currencyCNY
});

console.log('📊 주식:', {
    indices: [
        app.settings.stockKOSPI && 'KOSPI',
        app.settings.stockKOSDAQ && 'KOSDAQ',
        app.settings.stockSP500 && 'S&P500',
        app.settings.stockNASDAQ && 'NASDAQ'
    ].filter(Boolean),
    symbols: app.settings.stockSymbols?.length || 0
});

console.log('🔍 검색:', {
    default: app.settings.defaultSearchEngine,
    engines: Object.keys(app.settings.searchEngines || {}).length
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📤 Pushing to GitHub Gist...');
await app.githubSync.pushData();
console.log('✅ Push 완료!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
```

**예상 로그**:
```
📦 업로드: {
    categories: 5,
    bookmarks: 37,
    settings: 38,
    searchEngines: 5,
    stocks: 2,
    footerBookmarks: 4
}
🔍 Verification - Gist now contains: { ... }
✅ Data pushed to GitHub Gist successfully
```

---

## 🏢 회사 컴퓨터 (데이터 Pull)

### 1️⃣ 초기 상태 확인 (Pull 전)

```javascript
console.clear();
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📥 회사 컴퓨터 - Pull 전 상태');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log('🌤️ 날씨:', app.settings.weatherCity, app.settings.weatherUnit);
console.log('🕐 시계:', app.settings.clockFormat + 'h', app.settings.clockTimezone);
console.log('💱 환율:', {USD: app.settings.currencyUSD, EUR: app.settings.currencyEUR});
console.log('📊 주식:', app.settings.stockSymbols?.length || 0, 'symbols');
console.log('🔍 검색:', Object.keys(app.settings.searchEngines || {}).length, 'engines');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
```

---

### 2️⃣ 강제 새로고침 및 자동 Sync

**작업**:
1. `Ctrl + Shift + R` (강제 새로고침)
2. 페이지 로드 완료 대기 (5초)
3. 콘솔에서 자동 sync 로그 확인

**예상 로그**:
```
☁️ Cloud data received: {
    categories: 5,
    bookmarks: 37,
    searchEngines: 5,
    footerBookmarks: 4,
    timestamp: "2026-03-09T14:30:00.000Z"
}
📥 설정 적용: 38 항목
🔄 Re-initializing ALL widgets with restored settings...
✅ All widgets reinitialized with settings: {
    weather: "Busan (imperial)",
    clock: "12h / America/New_York",
    currency: "USD, EUR, CNY",
    stock: "2 symbols",
    search: "5 engines"
}
✅ Data pulled from GitHub Gist successfully
```

---

### 3️⃣ Pull 후 상태 확인

```javascript
console.clear();
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📥 회사 컴퓨터 - Pull 후 상태');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log('🌤️ 날씨:', {
    city: app.settings.weatherCity,
    unit: app.settings.weatherUnit,
    surfing: app.settings.surfingApiKey ? '✅' : '❌'
});

console.log('🕐 시계:', {
    format: app.settings.clockFormat + 'h',
    seconds: app.settings.clockShowSeconds,
    timezone: app.settings.clockTimezone
});

console.log('💱 환율:', {
    USD: app.settings.currencyUSD,
    EUR: app.settings.currencyEUR,
    JPY: app.settings.currencyJPY,
    CNY: app.settings.currencyCNY
});

console.log('📊 주식:', {
    indices: [
        app.settings.stockKOSPI && 'KOSPI',
        app.settings.stockKOSDAQ && 'KOSDAQ',
        app.settings.stockSP500 && 'S&P500',
        app.settings.stockNASDAQ && 'NASDAQ'
    ].filter(Boolean),
    symbols: app.settings.stockSymbols
});

console.log('🔍 검색:', {
    default: app.settings.defaultSearchEngine,
    engines: Object.keys(app.settings.searchEngines || {})
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
```

---

### 4️⃣ UI에서 직접 확인

**날씨 위젯**:
- [ ] 위젯에 "Busan" 표시됨
- [ ] 온도가 °F로 표시됨
- [ ] Settings → Weather Widget → 도시가 "Busan"
- [ ] Settings → Weather Widget → 단위가 "Fahrenheit"

**시계 위젯**:
- [ ] 시간이 12시간 형식으로 표시됨 (예: 2:30 PM)
- [ ] 초가 표시됨
- [ ] Settings → Clock Widget → 형식이 "12시간"
- [ ] Settings → Clock Widget → 타임존이 "America/New_York"

**환율 위젯**:
- [ ] USD, EUR, CNY만 표시됨 (JPY 없음)
- [ ] Settings → Currency Widget → USD ✅, EUR ✅, JPY ❌, CNY ✅

**주식 위젯**:
- [ ] KOSPI, KOSDAQ, NASDAQ만 표시됨 (S&P500 없음)
- [ ] AAPL, TSLA 심볼이 표시됨
- [ ] Settings → Stock Widget → 체크박스 확인
- [ ] Settings → Stock Widget → 심볼 리스트에 AAPL, TSLA 있음

**검색 위젯**:
- [ ] 검색 엔진 드롭다운에 YouTube, GitHub 있음
- [ ] 기본 엔진이 Google
- [ ] Settings → Search Widget → 엔진 리스트 확인

---

## ✅ 성공 기준

**집 컴퓨터 설정**:
```json
{
    "weather": "Busan (°F)",
    "clock": "12h + seconds + America/New_York",
    "currency": "USD, EUR, CNY",
    "stock": "KOSPI, KOSDAQ, NASDAQ + AAPL, TSLA",
    "search": "Google (default) + YouTube, GitHub"
}
```

**회사 컴퓨터 결과 (Pull 후)**:
```json
{
    "weather": "Busan (°F)",  ✅ 일치
    "clock": "12h + seconds + America/New_York",  ✅ 일치
    "currency": "USD, EUR, CNY",  ✅ 일치
    "stock": "KOSPI, KOSDAQ, NASDAQ + AAPL, TSLA",  ✅ 일치
    "search": "Google (default) + YouTube, GitHub"  ✅ 일치
}
```

---

## 🔍 디버깅 팁

### 1. "날씨 도시가 Ulsan으로 돌아갔어요!"

```javascript
// 콘솔에서 확인
console.log('Settings:', app.settings.weatherCity);

// Gist 확인
const gistId = localStorage.getItem('github_gist_id');
const token = localStorage.getItem('github_token');
const resp = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: {'Authorization': `token ${token}`}
});
const gist = await resp.json();
const data = JSON.parse(gist.files['startpage-data.json'].content);
console.log('Gist weatherCity:', data.settings.weatherCity);

// 불일치하면 수동 push
app.settings.weatherCity = 'Busan';
await app.githubSync.pushData();
```

---

### 2. "시계 타임존이 변경 안 돼요!"

```javascript
// 강제 재초기화
initClockWidget(app);

// 설정 확인
console.log('Clock settings:', {
    format: app.settings.clockFormat,
    timezone: app.settings.clockTimezone,
    seconds: app.settings.clockShowSeconds
});
```

---

### 3. "환율 체크박스가 이상해요!"

```javascript
// 설정 확인
console.log('Currency:', {
    USD: app.settings.currencyUSD,
    EUR: app.settings.currencyEUR,
    JPY: app.settings.currencyJPY,
    CNY: app.settings.currencyCNY
});

// 강제 재초기화
initCurrencyWidget(app);
```

---

## 🎉 최종 체크리스트

### 날씨 위젯
- [ ] 도시 이름 동기화됨
- [ ] 온도 단위 동기화됨
- [ ] 서핑지수 API 키 동기화됨
- [ ] UI에 정확히 표시됨

### 시계 위젯
- [ ] 시간 형식 (12/24h) 동기화됨
- [ ] 초 표시 옵션 동기화됨
- [ ] 타임존 동기화됨
- [ ] UI에 정확히 표시됨

### 환율 위젯
- [ ] USD 선택 동기화됨
- [ ] EUR 선택 동기화됨
- [ ] JPY 선택 동기화됨
- [ ] CNY 선택 동기화됨
- [ ] UI에 선택한 통화만 표시됨

### 주식 위젯
- [ ] KOSPI/KOSDAQ/S&P500/NASDAQ 선택 동기화됨
- [ ] 심볼 리스트 동기화됨
- [ ] UI에 정확히 표시됨

### 검색 위젯
- [ ] 검색 엔진 목록 동기화됨
- [ ] 기본 엔진 동기화됨
- [ ] UI에 정확히 표시됨

---

**브라이언, 이제 진짜 모든 위젯이 동기화될 거예요! 🚀**

테스트해보시고 문제 있으면 바로 알려주세요!

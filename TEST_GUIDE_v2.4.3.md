# 🧪 v2.4.3 테스트 가이드

**버전**: v2.4.3  
**날짜**: 2026-03-09  
**수정 항목**: 위젯 설정 초기화 버그 + 카테고리 자유 배치 개선

---

## 🎯 테스트 목표

1. ✅ 주식/검색 위젯 설정이 서버 파일 업로드 후에도 유지되는지 확인
2. ✅ 카테고리 드래그 앤 드롭이 자유롭게 동작하는지 확인
3. ✅ 드래그 시 시각적 피드백이 명확한지 확인
4. ✅ GitHub Gist 동기화가 양방향으로 완벽하게 동작하는지 확인

---

## 🔴 Test 1: 주식/검색 위젯 설정 동기화

### 집 컴퓨터 (데이터 추가)

```javascript
// 1. 콘솔 열기 (F12)
console.clear();

// 2. 현재 상태 확인
console.log('현재 검색 엔진:', Object.keys(app.settings.searchEngines || {}).length);
console.log('현재 주식:', app.settings.stockSymbols?.length || 0);
```

**UI 작업**:
1. Settings (⚙️) → Search Widget → "Add search engine"
   - Name: `YouTube`
   - URL: `https://www.youtube.com/results?search_query=`
   - Save

2. Settings (⚙️) → Stock Widget → "Add stock"
   - Code: `AAPL`
   - Name: `Apple Inc.`
   - Save

3. Settings (⚙️) → Stock Widget → "Add stock"
   - Code: `TSLA`
   - Name: `Tesla, Inc.`
   - Save

```javascript
// 3. 추가 후 확인
console.log('추가 후 검색 엔진:', Object.keys(app.settings.searchEngines || {}).length);
console.log('추가 후 주식:', app.settings.stockSymbols?.length || 0);

// 4. 수동 push (즉시 동기화)
await app.githubSync.pushData();

// 5. 로그 확인
// 예상: "📦 업로드: { bookmarks: XX, searchEngines: X, stocks: X }"
// 예상: "🔍 Verification - Gist now contains: { bookmarks: XX, ... }"
```

---

### 회사 컴퓨터 (데이터 pull)

```javascript
// 1. 콘솔 열기 (F12)
console.clear();

// 2. 현재 상태 확인 (pull 전)
console.log('[Before Pull]');
console.log('검색 엔진:', Object.keys(app.settings.searchEngines || {}).length);
console.log('주식:', app.settings.stockSymbols?.length || 0);

// 3. 강제 새로고침 (캐시 클리어)
// Ctrl + Shift + R
```

**새로고침 후**:
```javascript
// 4. 자동 sync 확인
// 콘솔에 "☁️ Cloud data received: { ... }" 로그가 보여야 함
// "🔄 Re-initializing widgets with restored settings..." 로그 확인!

// 5. pull 후 상태 확인
console.log('[After Pull]');
console.log('검색 엔진:', Object.keys(app.settings.searchEngines || {}).length);
console.log('주식:', app.settings.stockSymbols?.length || 0);

// 6. UI 확인
// Settings (⚙️) → Search Widget: "YouTube" 항목 확인
// Settings (⚙️) → Stock Widget: "AAPL", "TSLA" 항목 확인
```

**예상 결과**:
```
✅ 집 컴퓨터: searchEngines: 5, stocks: 2
✅ 회사 컴퓨터: searchEngines: 5, stocks: 2
✅ UI에서 모든 항목이 정상 표시됨
✅ 콘솔에 "Re-initializing widgets" 로그 표시됨
```

---

## 🟢 Test 2: 카테고리 자유 배치

### 준비 단계

1. **카테고리 생성** (6개):
   - 카테고리 추가 → 이름: `여행`, 아이콘: `fa-plane`, 북마크: 3개
   - 카테고리 추가 → 이름: `쇼핑브랜드`, 아이콘: `fa-shopping-cart`, 북마크: 15개
   - 카테고리 추가 → 이름: `업무`, 아이콘: `fa-briefcase`, 북마크: 8개
   - 카테고리 추가 → 이름: `개발`, 아이콘: `fa-code`, 북마크: 20개
   - 카테고리 추가 → 이름: `엔터테인먼트`, 아이콘: `fa-film`, 북마크: 5개
   - 카테고리 추가 → 이름: `금융`, 아이콘: `fa-wallet`, 북마크: 10개

### 드래그 테스트

**시나리오 1: 순서 변경**
```
초기 상태:
[여행]       [쇼핑브랜드]
[업무]       [개발]
[엔터]       [금융]

목표 상태:
[엔터]       [여행]
[금융]       [업무]
[쇼핑]       [개발]
```

**작업**:
1. "여행" 카테고리를 "쇼핑브랜드" 위치로 드래그
2. "엔터테인먼트"를 첫 번째 위치로 드래그
3. "금융"을 두 번째 줄 첫 번째 위치로 드래그

**확인 사항**:
- ✅ 드래그 시 `cursor: move` 표시됨
- ✅ 드래그 중 카드가 투명도 50% + scale 0.95로 변함
- ✅ 드래그 오버 시 대상 카드에 **파란 테두리** 표시
- ✅ 드롭 후 순서가 즉시 변경됨
- ✅ 새로고침 후에도 순서가 유지됨

---

**시나리오 2: 자유 배치 (왼쪽 작은 것, 오른쪽 큰 것)**
```
목표:
[여행 - 3개]         [쇼핑브랜드 - 15개]
[엔터 - 5개]         [개발 - 20개]
                     [금융 - 10개]
```

**작업**:
1. 북마크가 적은 카테고리들을 왼쪽으로 이동
2. 북마크가 많은 카테고리들을 오른쪽으로 이동

**확인 사항**:
- ✅ 각 카테고리가 내용에 맞춰 **자동 높이 조절**됨
- ✅ 작은 카테고리는 높이가 짧고, 큰 카테고리는 높이가 길어짐
- ✅ 빈 공간이 최소화됨 (Masonry 효과)
- ✅ 왼쪽 열과 오른쪽 열의 높이가 다름 (순서대로 채워지지 않음)

---

## 🟡 Test 3: 드래그 시각 피드백

### Hover 테스트
1. 카테고리 카드에 마우스 올리기
2. **확인 사항**:
   - ✅ `cursor: move` 표시
   - ✅ 그림자가 강해짐 (`box-shadow: var(--shadow-lg)`)
   - ✅ 테두리 색상이 파란색으로 변경 (`border-color: var(--primary)`)
   - ✅ 약간 위로 올라감 (`transform: translateY(-2px)`)

### Drag 테스트
1. 카테고리를 드래그 시작
2. **확인 사항**:
   - ✅ 드래그 중인 카드의 투명도 50%
   - ✅ 드래그 중인 카드가 약간 작아짐 (`scale(0.95)`)

### Drag Over 테스트
1. 드래그 중인 카드를 다른 카드 위로 이동
2. **확인 사항**:
   - ✅ 대상 카드에 **파란 테두리 (dashed)** 표시
   - ✅ 대상 카드의 배경색이 파란색 반투명으로 변경 (`rgba(59, 130, 246, 0.1)`)
   - ✅ 대상 카드가 약간 확대됨 (`scale(1.02)`)

### Drop 테스트
1. 카드를 드롭
2. **확인 사항**:
   - ✅ 모든 시각 효과가 즉시 사라짐
   - ✅ 카드 순서가 변경됨
   - ✅ 애니메이션이 부드러움 (0.3s ease)

---

## 🟠 Test 4: 전체 워크플로우

### 시나리오: 집 → 회사 → 집 동기화

**집 컴퓨터 (초기 설정)**:
1. 검색 엔진 3개 추가 (YouTube, GitHub, Stack Overflow)
2. 주식 2개 추가 (AAPL, TSLA)
3. 카테고리 5개 생성 (다양한 북마크 수)
4. 카테고리 순서 변경 (드래그 앤 드롭)
5. `await app.githubSync.pushData()` 실행

**회사 컴퓨터 (데이터 pull)**:
1. 강제 새로고침 (Ctrl + Shift + R)
2. 자동 sync 대기 (5분) 또는 수동 sync
3. 검색 엔진, 주식, 카테고리 순서 확인
4. 추가 작업:
   - 검색 엔진 1개 추가 (Wikipedia)
   - 주식 1개 추가 (GOOGL)
   - 카테고리 1개 추가 (뉴스)
5. `await app.githubSync.pushData()` 실행

**집 컴퓨터 (최종 확인)**:
1. 강제 새로고침 (Ctrl + Shift + R)
2. 자동 sync 대기
3. **확인**:
   - ✅ 검색 엔진: 4개 (YouTube, GitHub, Stack Overflow, Wikipedia)
   - ✅ 주식: 3개 (AAPL, TSLA, GOOGL)
   - ✅ 카테고리: 6개 (뉴스 카테고리 포함)
   - ✅ 카테고리 순서가 회사에서 설정한 대로 유지됨

---

## 🔍 디버깅 팁

### 1. "검색 엔진이 안 나타나요!"
```javascript
// 콘솔에서 확인
console.log('Settings:', app.settings);
console.log('Search Engines:', app.settings.searchEngines);

// 강제 재초기화
initSearchWidget(app);

// Settings 다시 저장
app.saveSettings();
```

### 2. "주식이 안 나타나요!"
```javascript
// 콘솔에서 확인
console.log('Stock Symbols:', app.settings.stockSymbols);

// 강제 재초기화
initStockWidget(app);

// Settings 다시 저장
app.saveSettings();
```

### 3. "카테고리 드래그가 안 돼요!"
```
1. 카테고리 헤더가 아닌 카드 전체를 드래그
2. cursor: move가 보이는지 확인
3. 드래그 시 투명도가 50%로 변하는지 확인
4. 강제 새로고침 (Ctrl + Shift + R)
```

### 4. "GitHub Gist가 업데이트 안 돼요!"
```javascript
// Gist 확인
const gistId = localStorage.getItem('github_gist_id');
console.log(`https://gist.github.com/${gistId}`);

// 타임스탬프 확인
console.log('Last Sync:', localStorage.getItem('lastSyncTime'));

// 수동 push
await app.githubSync.pushData();

// 검증 로그 확인
// "🔍 Verification - Gist now contains: { ... }"
```

---

## ✅ 테스트 체크리스트

### 위젯 설정 동기화
- [ ] 검색 엔진 추가 → push → pull → UI에서 확인됨
- [ ] 주식 추가 → push → pull → UI에서 확인됨
- [ ] 파일 업로드 → 검색 엔진 유지됨
- [ ] 파일 업로드 → 주식 유지됨
- [ ] 콘솔에 "Re-initializing widgets" 로그 표시됨

### 카테고리 드래그
- [ ] 카테고리 hover 시 `cursor: move` 표시
- [ ] 드래그 시 투명도 50% + scale 0.95
- [ ] 드래그 오버 시 파란 테두리 표시
- [ ] 드롭 후 순서 변경됨
- [ ] 새로고침 후에도 순서 유지됨

### 자동 높이 조절
- [ ] 북마크 3개 카테고리: 높이 짧음
- [ ] 북마크 15개 카테고리: 높이 김
- [ ] 왼쪽 열과 오른쪽 열의 높이가 다름
- [ ] 빈 공간이 최소화됨

### GitHub Gist 동기화
- [ ] 집 → 회사 동기화 성공
- [ ] 회사 → 집 동기화 성공
- [ ] 타임스탬프 비교 로직 작동
- [ ] 충돌 자동 해결됨
- [ ] Gist 내용과 로컬 데이터 일치

---

## 🎉 성공 기준

모든 테스트를 통과하면 다음과 같은 상태가 됩니다:

✅ **위젯 설정**이 서버 파일 업로드 후에도 완벽하게 유지됨  
✅ **카테고리 드래그**가 자유롭고 직관적임  
✅ **시각 피드백**이 명확해서 드래그 가능 여부를 쉽게 알 수 있음  
✅ **GitHub Gist 동기화**가 양방향으로 완벽하게 동작함  
✅ **충돌이 자동으로 해결**되어 데이터 손실이 없음  

---

**브라이언, 이제 완벽하게 동작할 거예요! 🚀**

테스트하시고 문제 있으면 바로 알려주세요!

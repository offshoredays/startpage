# 🚀 Bryan's Start Page v2.4.4 Final

**울산 소재 법률사무소 변호사이자 울산광역시서핑협회 회장**인 브라이언을 위한 **맞춤형 스타트 페이지**

---

## ✨ 주요 기능

### 🌊 **서핑 전용 날씨 위젯**
- **공공데이터 포털 서핑지수 API** 통합
- 울산/부산/강릉 해수욕장 실시간 데이터
- 기온, 수온, 파도, 바람 등 **8가지 정보 선택 표시**

### 📚 **스마트 북마크 관리**
- **드래그 앤 드롭**으로 자유로운 카테고리 배치
- **Masonry 레이아웃**으로 빈 공간 자동 채움
- 북마크 개수에 따라 카테고리 크기 자동 조절

### ☁️ **GitHub Gist 클라우드 동기화**
- **집/회사 어디서나** 같은 북마크 사용
- **F5 새로고침만으로** 자동 동기화
- 5분마다 백그라운드 자동 동기화

### 🎨 **완전한 커스터마이징**
- 다크/라이트 테마
- 배경 이미지/색상/그라데이션
- 폰트 크기 조절
- 위젯 크기 조절

---

## 🚀 빠른 시작

### 1️⃣ **GitHub Pages 배포**
```bash
# 저장소 클론
git clone https://github.com/offshoredays/startpage.git
cd startpage

# GitHub Pages 활성화
# Settings → Pages → Source: main branch → Save
```

**배포 URL**: https://offshoredays.github.io/startpage/

### 2️⃣ **서핑지수 API 설정** (선택사항)
1. https://www.data.go.kr 로그인
2. https://www.data.go.kr/data/15142490/openapi.do 접속
3. "활용신청" → 용도: "개인 스타트 페이지"
4. 승인 후 "마이페이지 → 개발계정 → 일반 인증키" 복사
5. 날씨 위젯 ⚙️ → API 키 입력

### 3️⃣ **클라우드 동기화 설정** (선택사항)
1. https://github.com/settings/tokens/new 접속
2. `gist` 권한 선택 → 토큰 생성
3. 헤더 클릭 → 전체 설정 → GitHub 연결
4. 토큰 입력 → "GitHub 연결하기"
5. ✅ 완료! 이제 F5만 누르면 자동 동기화

---

## 📂 프로젝트 구조

```
startpage/
├── index.html              # 메인 페이지
├── css/
│   └── style.css          # 전체 스타일 (통합)
├── js/
│   ├── app.js             # 메인 앱 로직
│   ├── widgets.js         # 위젯 (날씨, 시계, 환율, 주식)
│   ├── github-sync.js     # GitHub Gist 동기화
│   ├── footer.js          # 푸터 북마크
│   ├── modals.js          # 모달 관리
│   ├── drag-drop.js       # 드래그 앤 드롭
│   └── utils.js           # 유틸리티 함수
└── README.md              # 이 파일
```

---

## 🎯 핵심 기능 상세

### 날씨 위젯 🌊
**서핑지수 API 통합**
- **3개 해수욕장**: 울산(102), 부산(103), 강릉(201)
- **8가지 정보**: 기온, 수온, 파도 높이/방향/주기, 풍속, 바람 방향, 파도 상태
- **선택 표시**: 원하는 정보만 위젯에 표시

### 북마크 관리 📚
**자유로운 배치**
- 드래그 앤 드롭으로 카테고리 순서 변경
- 2컬럼 Masonry 레이아웃 (빈 공간 자동 채움)
- 북마크 개수에 따라 높이 자동 조절

### 클라우드 동기화 ☁️
**GitHub Gist 기반**
- **자동 동기화**: 5분마다 클라우드 확인
- **F5 동기화**: 새로고침만으로 최신 데이터 가져오기
- **충돌 방지**: 타임스탬프 비교로 데이터 손실 방지

### 위젯 ⚙️
- **날씨**: 서핑지수 API
- **시계**: 다중 타임존, 12/24시간 형식
- **환율**: USD, EUR, JPY, CNY
- **주식**: KOSPI, KOSDAQ, S&P500, NASDAQ
- **검색**: Google, YouTube, Naver (커스텀 추가 가능)

---

## 📊 데이터 저장

### localStorage
- `bookmarkData`: 카테고리 & 북마크
- `settings`: 모든 설정 (위젯, 테마, 폰트 등)
- `footerBookmarks`: 푸터 북마크
- `lastSyncTime`: 마지막 동기화 시간

### GitHub Gist (클라우드)
- 파일명: `startpage-data.json`
- 구조: `{ categories, settings, footerBookmarks, lastUpdated }`

---

## 🔧 개발자 가이드

### 북마크 추가
```javascript
// 프로그래밍 방식으로 북마크 추가
app.categories.push({
    id: 'dev',
    name: '개발',
    bookmarks: [
        { id: '1', title: 'GitHub', url: 'https://github.com' }
    ]
});
app.saveData();
app.render();
```

### 설정 변경
```javascript
// 배경 이미지 변경
app.settings.bgImage = 'https://example.com/bg.jpg';
app.saveSettings();
app.applyBackgroundSettings();
```

### 동기화
```javascript
// 수동 푸시
await app.githubSync.pushData();

// 수동 풀
await app.githubSync.pullData(true); // forceOverwrite
```

---

## 🐛 문제 해결

### 1️⃣ 북마크가 동기화 안 됨
**증상**: F5 눌러도 새 북마크가 안 보임

**해결**:
1. F12 콘솔 열기
2. `await app.githubSync.pullData(true)` 실행
3. 강제로 클라우드 데이터 가져오기

### 2️⃣ 날씨 위젯 "API 키 필요"
**증상**: 날씨 정보가 `API 키 필요`로 표시

**해결**:
1. 공공데이터 포털에서 API 승인 확인
2. 날씨 위젯 ⚙️ → API 키 재입력
3. **일반 인증키 (Encoding)** 사용 (Decoding 아님!)

### 3️⃣ 위젯 설정 버튼 안 눌림
**증상**: 환율/주식 ⚙️ 버튼 클릭 안 됨

**해결**:
- F5 새로고침
- 브라우저 캐시 삭제 (Ctrl + Shift + Delete)

### 4️⃣ 검색 엔진이 사라짐
**증상**: 검색 위젯에 추가한 엔진이 안 보임

**해결**:
```javascript
// 콘솔에서 확인
console.log('검색 엔진:', app.settings.searchEngines);

// 복구
app.settings.searchEngines = {
    google: { url: 'https://www.google.com/search?q=', icon: 'https://www.google.com/favicon.ico' },
    youtube: { url: 'https://www.youtube.com/results?search_query=', icon: 'https://www.youtube.com/favicon.ico' },
    naver: { url: 'https://search.naver.com/search.naver?query=', icon: 'https://www.naver.com/favicon.ico' }
};
app.saveSettings();
```

---

## 📈 버전 히스토리

### v2.4.4 Final (2026-03-10)
- ✅ 서핑지수 API 완전 통합
- ✅ F5 동기화 수정 (클라우드 우선)
- ✅ 검색 엔진 복구
- ✅ 위젯 설정 버튼 수정
- ✅ 불필요한 파일 34개 삭제 (약 300KB 절약)
- ✅ CSS 파일 통합 (3개 → 1개)

### v2.4.3 (2026-03-09)
- ✅ 모든 위젯 설정 동기화
- ✅ 드래그 앤 드롭 시각 피드백
- ✅ Masonry 레이아웃

### v2.3 (2026-03-08)
- ✅ GitHub Gist 동기화
- ✅ 충돌 방지 시스템
- ✅ 자동 Gist 검색

---

## 💡 팁 & 트릭

### 1️⃣ 빠른 동기화 확인
```javascript
// 콘솔에서 실행 (F12)
console.log('Token:', localStorage.getItem('github_token') ? '✅' : '❌');
console.log('Gist ID:', localStorage.getItem('github_gist_id') || '없음');
console.log('마지막 동기화:', localStorage.getItem('lastSyncTime'));
```

### 2️⃣ 백업 다운로드
헤더 클릭 → 전체 설정 → "백업 다운로드" → JSON 파일 저장

### 3️⃣ 테마 변경
F12 콘솔:
```javascript
document.documentElement.setAttribute('data-theme', 'dark'); // 또는 'light'
```

### 4️⃣ 자동 동기화 간격 조절
```javascript
app.githubSync.startAutoSync(1); // 1분마다 (기본 5분)
```

---

## 🎨 커스터마이징 예제

### 배경 이미지
```javascript
app.settings.bgImage = 'https://source.unsplash.com/1920x1080/?ocean,surfing';
app.saveSettings();
app.applyBackgroundSettings();
```

### 그라데이션 배경
```javascript
app.settings.bgPreset = 'sunset'; // 또는 'purple', 'pink', 'blue', 'green'
app.saveSettings();
app.applyBackgroundSettings();
```

### 폰트 크기
```javascript
app.settings.categoryFontSize = 14;  // 카테고리 제목 (6-20)
app.settings.bookmarkFontSize = 16;  // 북마크 (8-20)
app.saveSettings();
app.applyFontSizes();
```

---

## 🌟 브라이언 전용 기능

### 🏄 서핑 조건 확인
- 울산 일산해수욕장 실시간 파도/바람
- 출근 전 빠른 확인

### 📚 업무별 북마크
- 법률: 대법원, 법제처, 로앤비
- 서핑: 협회 사이트, 날씨, 용품
- 개발: GitHub, Stack Overflow
- 쇼핑: 서핑 브랜드, 법률 도서

### ☁️ 집↔회사 동기화
- F5만 누르면 자동 동기화
- 회사에서 추가한 북마크 → 집에서 자동 반영
- 충돌 방지 시스템

---

## 🚀 성능 최적화

### 파일 크기
- **index.html**: 44KB
- **CSS**: 32KB (통합)
- **JavaScript**: 총 약 120KB
- **총**: 약 196KB

### 로딩 속도
- **초기 로드**: < 1초
- **동기화**: < 2초
- **렌더링**: < 100ms

### 최적화 항목
- ✅ 불필요한 문서 31개 삭제
- ✅ 백업 파일 3개 삭제
- ✅ CSS 파일 3개 → 1개 통합
- ✅ CDN 사용 (Font Awesome, Google Fonts)
- ✅ localStorage 캐싱

---

## 📞 지원

### 문제 보고
- GitHub Issues: https://github.com/offshoredays/startpage/issues

### 개발자
- **AI Assistant**: 브라이언 전용 맞춤 개발
- **버전**: v2.4.4 Final
- **업데이트**: 2026-03-10

---

## 📜 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

---

## 🎉 감사의 말

이 프로젝트는 **브라이언**을 위해 만들어졌습니다.

**법률 전문가**이자 **서핑 협회 회장**으로서, 업무와 라이프스타일을 완벽하게 통합한 맞춤형 스타트 페이지를 목표로 개발되었습니다.

**"진부함을 거부하고, 혁신적이며 감각적인 접근"** - 브라이언의 철학이 담긴 프로젝트입니다.

---

**🏄 Good vibes only!**

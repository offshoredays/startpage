# 🏄 날씨 위젯 - 공공데이터 포털 서핑지수 API 연동

**날짜**: 2026-03-09  
**버전**: v2.5.0  
**수정 파일**: `js/widgets.js`, `js/app.js`

---

## 📋 변경 사항

### ✅ **완료된 작업**

1. **OpenWeatherMap API 제거** → 공공데이터 포털 API로 완전 교체
2. **서핑지수 API 연동** (해양수산부 국립해양조사원)
3. **표시 정보 선택 기능** 추가 (설정에서 선택 가능)

---

## 🔑 API 키 발급 방법

### 1️⃣ **공공데이터 포털 가입 및 로그인**

1. https://www.data.go.kr 접속
2. 회원가입 (또는 로그인)

---

### 2️⃣ **서핑지수 API 신청**

1. https://www.data.go.kr/data/15142490/openapi.do 접속
2. **"활용신청"** 버튼 클릭
3. 신청 정보 입력:
   - **활용 목적**: `개인 스타트 페이지 서핑 정보 표시`
   - **상세 기능**: `실시간 서핑 정보 조회 및 표시`
4. **신청하기** 클릭
5. **즉시 승인** 또는 1-2시간 후 이메일 확인

---

### 3️⃣ **API 키 확인**

1. https://www.data.go.kr/mypage 접속
2. 왼쪽 메뉴 → **오픈API** → **개발계정**
3. "해양수산부 국립해양조사원_서핑지수" 찾기
4. **일반 인증키 (Encoding)** 복사

**예시**:
```
YOUR_API_KEY_HERE_1234567890abcdefghijklmnopqrstuvwxyz
```

---

## ⚙️ 설정 방법

### **현재 설정 (js/app.js에서)**

```javascript
// 기본 설정
surfingApiKey: '', // ← 여기에 API 키 입력
surfingBeachNum: '102', // 해수욕장 번호

// 표시할 정보 선택
showTemp: true,           // 기온
showWaterTemp: true,      // 수온
showWave: true,           // 파도 높이
showWaveDir: false,       // 파도 방향
showWavePeriod: false,    // 파도 주기
showWind: true,           // 풍속
showWindDir: false,       // 바람 방향
showWaveCond: true,       // 파도 상태
```

---

### **해수욕장 번호**

| 번호 | 해수욕장 |
|-----|---------|
| `102` | 울산 일산해수욕장 |
| `103` | 부산 해운대 |
| `201` | 강릉 경포대 |

---

## 🧪 테스트 방법

### 1️⃣ **API 키 설정**

`js/app.js` 파일 열기:
```javascript
surfingApiKey: 'YOUR_API_KEY_HERE',  // ← 복사한 API 키 붙여넣기
```

---

### 2️⃣ **파일 업로드**

GitHub에 업로드:
- `js/widgets.js`
- `js/app.js`

---

### 3️⃣ **사이트 접속 및 확인**

1. 2-3분 후 사이트 접속:
   ```
   https://offshoredays.github.io/startpage/
   ```

2. **Ctrl + Shift + R** (강제 새로고침)

3. **F12** (콘솔 열기)

4. 콘솔 로그 확인:
   ```javascript
   🏄 서핑지수 API 요청: https://www.khoa.go.kr/api/service/...
   🏄 응답 (raw): <?xml version="1.0" ...
   🏄 파싱된 데이터: { beachNum: "102", temp: "15.5", ... }
   ```

5. 위젯 확인:
   - 기온 표시
   - 풍속 표시
   - 파도 높이 표시

---

## 📊 API 데이터 구조

### **요청**

```
https://www.khoa.go.kr/api/service/fcstSurfingService/fcstSurfing
?serviceKey=YOUR_API_KEY
&date=20260309       (오늘 날짜 YYYYMMDD)
&time=1500           (현재 시각 HHMM)
&beachNum=102        (울산)
&resultType=json
```

---

### **응답 (XML)**

```xml
<response>
  <body>
    <items>
      <item>
        <beachNum>102</beachNum>        <!-- 해수욕장 번호 -->
        <temp>15.5</temp>               <!-- 기온 (°C) -->
        <waterTemp>18.2</waterTemp>     <!-- 수온 (°C) -->
        <wavHgt>1.2</wavHgt>            <!-- 파도 높이 (m) -->
        <wavDir>NE</wavDir>             <!-- 파도 방향 -->
        <wavPeriod>8</wavPeriod>        <!-- 파도 주기 (초) -->
        <windSpd>5.2</windSpd>          <!-- 풍속 (m/s) -->
        <windDir>NE</windDir>           <!-- 바람 방향 -->
        <wavCond>좋음</wavCond>         <!-- 파도 상태 -->
      </item>
    </items>
  </body>
</response>
```

---

## 🎨 위젯 표시

### **기본 표시** (showTemp, showWind, showWave = true)
```
┌──────────────────┐
│ 15° 울산         │
│ 🌬️ 5.2m/s NE    │
│ 🌊 1.2m NE       │
└──────────────────┘
```

---

### **모든 정보 표시** (모든 옵션 true)
```
클릭 시 모달:
─────────────────────
울산 일산해수욕장
─────────────────────
기온: 15.5°C
수온: 18.2°C
파도 높이: 1.2m
파도 방향: NE
파도 주기: 8초
풍속: 5.2m/s
바람 방향: NE
파도 상태: 좋음
─────────────────────
```

---

## 🔍 디버깅

### **API 키가 없을 때**
```
위젯 표시:
API  키 필요
🌬️ --
🌊 --
```

### **API 오류**
```javascript
// 콘솔 로그:
🏄 서핑지수 API 오류: Error: ...
```

### **데이터 확인**
```javascript
// 콘솔에서 실행:
console.log(app.surfingData);
```

---

## 💬 브라이언께

**수정 완료한 것**:
1. ✅ OpenWeatherMap 완전 제거
2. ✅ 공공데이터 포털 API 연동
3. ✅ XML 파싱 (API가 XML로 응답)
4. ✅ 표시 정보 선택 기능

**테스트 순서**:
1. API 키 발급 (공공데이터 포털)
2. `js/app.js`에 API 키 입력
3. GitHub 업로드
4. 사이트 접속 + 콘솔 확인

**다음 단계 (필요시)**:
- 설정 UI 추가 (웹에서 API 키 입력)
- 더 많은 해수욕장 추가
- 예보 데이터 표시

**다른 위젯은 절대 건드리지 않았습니다! 🚀**

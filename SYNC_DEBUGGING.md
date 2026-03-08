# 🔍 GitHub 동기화 디버깅 가이드

## 문제: 동기화가 안 됨

### ✅ 체크리스트

브라우저 콘솔(F12)에서 다음 명령어를 실행해보세요:

```javascript
// 1. 현재 연결 상태 확인
console.log('=== GitHub 동기화 상태 ===');
console.log('Token 존재:', localStorage.getItem('github_token') ? '✅ 있음' : '❌ 없음');
console.log('Gist ID:', localStorage.getItem('github_gist_id') || '❌ 아직 생성 안 됨');
console.log('App 초기화:', typeof app !== 'undefined' ? '✅' : '❌');
console.log('GitHubSync 객체:', app?.githubSync ? '✅' : '❌');
console.log('연결 상태:', app?.githubSync?.isConfigured() ? '✅ 연결됨' : '❌ 연결 안 됨');
```

---

## 📋 시나리오별 해결 방법

### 시나리오 1: 첫 번째 컴퓨터 (집)

#### 1단계: Token 연결
```
1. 설정(⚙️) 열기
2. GitHub Token 입력
3. "GitHub 연결하기" 클릭
4. "GitHub 연결 완료!" 메시지 확인
```

#### 2단계: 북마크 추가
```
1. 북마크 추가
2. F12 콘솔 확인:
   📦 Data to sync: ...
   📤 Creating new Gist... (또는 Updating existing Gist...)
   ✅ Data pushed to GitHub Gist successfully
```

**❗ 중요**: 위 로그가 안 보이면 동기화가 안 된 거예요!

#### 3단계: Gist ID 확인
```javascript
// 콘솔에서 실행
console.log('Gist ID:', localStorage.getItem('github_gist_id'));
```

**이 ID를 복사해두세요!** (두 번째 컴퓨터에서 필요할 수 있음)

---

### 시나리오 2: 두 번째 컴퓨터 (회사)

#### 방법 A: 같은 Token 사용 (자동 감지)

```
1. 설정(⚙️) 열기
2. 첫 번째 컴퓨터와 **정확히 같은 Token** 입력
3. "GitHub 연결하기" 클릭
4. "클라우드에서 가져오기" 버튼 클릭
```

**⚠️ 주의**: 같은 Token을 입력해도 자동으로 Gist ID를 찾지 못할 수 있어요!

#### 방법 B: Gist ID 수동 설정 (확실한 방법)

```javascript
// 콘솔에서 실행 (첫 번째 컴퓨터의 Gist ID 사용)
localStorage.setItem('github_gist_id', '여기에_Gist_ID_붙여넣기');
```

그 다음:
```
1. 페이지 새로고침
2. 설정 → "클라우드에서 가져오기" 클릭
```

---

## 🐛 일반적인 문제들

### 문제 1: "북마크 추가 시 로그가 안 보임"

**원인**: `saveData()`가 호출되지 않음 또는 `githubSync`가 null

**확인**:
```javascript
// 콘솔에서 실행
app.githubSync.pushData();
```

**예상 결과**: 
- ✅ 로그 출력: "📤 Updating existing Gist..."
- ❌ 에러: TypeError 또는 undefined

### 문제 2: "Token은 있는데 Gist ID가 없음"

**원인**: Gist 생성 실패 (권한 문제 or API 에러)

**해결**:
```javascript
// 수동으로 Gist 생성
await app.githubSync.migrateFromLocalStorage();
```

### 문제 3: "Gist ID는 있는데 데이터가 안 불러와짐"

**원인**: 다른 Token의 Gist 또는 삭제된 Gist

**확인**: https://gist.github.com/ 접속해서 Gist 존재 확인

**해결**:
```javascript
// Gist 내용 직접 확인
const token = localStorage.getItem('github_token');
const gistId = localStorage.getItem('github_gist_id');

fetch(`https://api.github.com/gists/${gistId}`, {
  headers: { 'Authorization': `token ${token}` }
})
.then(r => r.json())
.then(data => console.log('Gist 데이터:', data))
.catch(err => console.error('에러:', err));
```

---

## 🔄 완전 초기화 후 재설정

### 모든 게 꼬였다면 (주의: 데이터 손실 가능!)

#### 1단계: 백업 (선택)
```
설정 → "백업 다운로드" 클릭
```

#### 2단계: 완전 초기화
```javascript
// 콘솔에서 실행
console.log('삭제 전 백업:', {
  token: localStorage.getItem('github_token'),
  gistId: localStorage.getItem('github_gist_id')
});

// GitHub 동기화만 초기화
localStorage.removeItem('github_token');
localStorage.removeItem('github_gist_id');

// 페이지 새로고침
location.reload();
```

#### 3단계: 재연결
```
1. 설정 → GitHub Token 재입력
2. "GitHub 연결하기" 클릭
3. 북마크 추가해서 테스트
```

---

## 📝 올바른 사용 흐름 (요약)

### 집 컴퓨터 (A)
1. Token 입력 → 연결
2. 북마크 추가
3. 콘솔에서 "✅ Data pushed..." 확인
4. Gist ID 확인 및 복사

### 회사 컴퓨터 (B)
1. **같은 Token** 입력 → 연결
2. (선택) Gist ID 수동 설정
3. "클라우드에서 가져오기" 클릭
4. 북마크 확인

### 이후 자동 동기화
- A에서 북마크 추가 → 5분 이내 자동 업로드
- B에서 페이지 새로고침 → 자동으로 최신 데이터 불러옴

---

## 💡 핵심 포인트

1. **같은 Token 사용**: 양쪽 컴퓨터에서 정확히 같은 Token
2. **Gist ID 확인**: 첫 저장 후 Gist ID가 생성되었는지 확인
3. **콘솔 로그 확인**: 동기화 성공/실패 메시지 체크
4. **수동 가져오기**: 처음엔 "클라우드에서 가져오기" 클릭 필요

---

## 🚨 아직도 안 되면?

**다음 정보를 알려주세요**:

1. 콘솔 로그 스크린샷 (F12)
2. 다음 명령어 결과:
```javascript
console.log({
  token: localStorage.getItem('github_token') ? 'Exists' : 'Missing',
  gistId: localStorage.getItem('github_gist_id'),
  isConfigured: app?.githubSync?.isConfigured(),
  hasCategories: !!localStorage.getItem('bookmarkData')
});
```

**가장 확실한 테스트 방법**:
```javascript
// 수동으로 동기화 테스트
await app.githubSync.pushData(); // 업로드
await app.githubSync.pullData(); // 다운로드
```

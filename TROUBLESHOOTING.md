# 🔧 GitHub 동기화 문제 해결 가이드

## 일반적인 문제들

### 1. "Load failed: this.app.renderCategories is not a function" 오류

**증상**: 설정 모달을 열 때 오류 발생, GitHub 동기화 실패

**원인**: 함수 이름 오타 (해결됨 ✅)

**해결**: 
- 최신 코드로 업데이트
- 브라우저 캐시 삭제 (Ctrl+Shift+R 또는 Cmd+Shift+R)
- 페이지 새로고침

---

### 2. 텍스트 드래그 시 모달이 닫힘

**증상**: 설정이나 위젯 모달에서 텍스트를 드래그하면 모달이 사라짐

**원인**: 드래그 종료 시 클릭 이벤트 발생 (해결됨 ✅)

**해결**:
- 최신 코드로 업데이트
- mousedown 위치 추적 로직 적용됨

---

### 3. "GitHub 연결됨"으로 표시되지만 동기화 안 됨

**증상**: 설정에서 연결됨으로 표시되지만 실제로 데이터가 동기화되지 않음

**디버깅 방법**:

1. **브라우저 콘솔 열기** (F12 → Console 탭)
2. **다음 명령어 실행**:
   ```javascript
   console.log('Token:', localStorage.getItem('github_token') ? '✅ Exists' : '❌ Missing');
   console.log('Gist ID:', localStorage.getItem('github_gist_id') || '❌ Not created yet');
   ```

3. **결과 분석**:
   - Token: ❌ Missing → 토큰 재입력 필요
   - Gist ID: ❌ Not created yet → 정상 (첫 저장 시 자동 생성)

---

### 4. Token이 있는데도 동기화 실패

**가능한 원인들**:

#### A. Token 권한 부족
**확인**: https://github.com/settings/tokens → 해당 Token 클릭
**필요 권한**: ✅ `gist` 체크되어 있어야 함

#### B. Token 만료
**확인**: Token 생성 시 Expiration 설정 확인
**해결**: 새 Token 발급 → 재연결

#### C. 네트워크 오류
**확인**: 브라우저 콘솔에서 에러 메시지 확인
**해결**: 
- 인터넷 연결 확인
- VPN 사용 중이라면 끄고 재시도
- 방화벽 설정 확인

---

### 5. 다른 기기에서 데이터가 안 보임

**체크리스트**:

- [ ] **같은 Token 사용했는지 확인**
  - 다른 Token = 다른 Gist = 다른 데이터
  
- [ ] **Gist ID 확인**
  ```javascript
  console.log(localStorage.getItem('github_gist_id'));
  ```
  
- [ ] **"클라우드에서 가져오기" 클릭했는지 확인**
  - 연결만 하면 자동 가져오기는 안 됨
  - 수동으로 버튼 클릭 필요

- [ ] **첫 기기에서 먼저 "지금 동기화" 실행**
  - Gist가 생성되어야 다른 기기에서 가져올 수 있음

---

### 6. 자동 동기화가 작동하지 않음

**확인 방법**:
1. 북마크 추가/수정/삭제
2. 5분 대기
3. 브라우저 콘솔에서 확인:
   ```javascript
   // 로그에 "📤 Updating existing Gist..." 표시되어야 함
   ```

**해결**:
- 페이지를 5분 이상 열어두어야 함
- 탭이 백그라운드에 있으면 지연될 수 있음
- "지금 동기화" 버튼으로 수동 동기화 가능

---

### 7. API Rate Limit 초과

**증상**: "API rate limit exceeded" 오류

**원인**: GitHub API는 시간당 5000 요청 제한

**해결**:
- 일반적으로 발생하지 않음 (5분마다 1회)
- 발생 시 1시간 대기
- 수동 동기화 남발하지 않기

---

## 고급 트러블슈팅

### localStorage 초기화

**주의**: 모든 로컬 데이터가 삭제됩니다!

```javascript
// 백업 먼저!
console.log('Backup:', {
  token: localStorage.getItem('github_token'),
  gistId: localStorage.getItem('github_gist_id'),
  data: localStorage.getItem('bookmarkData')
});

// 초기화
localStorage.clear();
location.reload();
```

---

### Gist 직접 확인

1. https://gist.github.com/ 접속
2. "Secret" 탭 클릭
3. "startpage-data.json" 찾기
4. 데이터 구조 확인:
   ```json
   {
     "categories": [...],
     "settings": {...},
     "footerBookmarks": [...],
     "lastUpdated": "2026-03-06T...",
     "version": "2.1"
   }
   ```

---

### 수동으로 Gist에서 복원

**시나리오**: 로컬 데이터가 깨졌는데 Gist는 정상

```javascript
// 1. Token과 Gist ID 확인
const token = localStorage.getItem('github_token');
const gistId = localStorage.getItem('github_gist_id');

// 2. 수동으로 데이터 가져오기
fetch(`https://api.github.com/gists/${gistId}`, {
  headers: { 'Authorization': `token ${token}` }
})
.then(r => r.json())
.then(gist => {
  const data = JSON.parse(gist.files['startpage-data.json'].content);
  console.log('Gist data:', data);
  
  // 3. localStorage에 저장
  localStorage.setItem('bookmarkData', JSON.stringify(data.categories));
  localStorage.setItem('settings', JSON.stringify(data.settings));
  localStorage.setItem('footerBookmarks', JSON.stringify(data.footerBookmarks));
  
  // 4. 새로고침
  location.reload();
});
```

---

## 로그 분석

### 정상 작동 시 콘솔 로그:

```
✅ Data pulled from GitHub Gist successfully
📤 Creating new Gist...
✅ Data pushed to GitHub Gist successfully
```

### 오류 발생 시:

```
❌ Pull error: [에러 내용]
❌ Push error: [에러 내용]
```

**일반적인 에러 메시지**:
- `401 Unauthorized` → Token 문제
- `403 Forbidden` → 권한(scope) 문제
- `404 Not Found` → Gist가 아직 생성 안 됨 (정상)
- `Network error` → 인터넷 연결 문제

---

## 여전히 해결 안 되면?

1. **브라우저 콘솔 스크린샷** 찍기 (F12 → Console)
2. **설정 모달 스크린샷** 찍기 (GitHub 연결 섹션)
3. **다음 정보 수집**:
   ```javascript
   console.log({
     token: localStorage.getItem('github_token') ? 'Exists' : 'Missing',
     gistId: localStorage.getItem('github_gist_id'),
     hasCategories: !!localStorage.getItem('bookmarkData'),
     hasSettings: !!localStorage.getItem('settings')
   });
   ```
4. GitHub Issues에 리포트

---

**최종 업데이트**: 2026-03-06  
**버전**: v2.1

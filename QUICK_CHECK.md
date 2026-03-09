# 🔍 빠른 동기화 상태 확인

브라우저 콘솔(F12)에서 실행하세요:

```javascript
// === 1. 현재 상태 확인 ===
console.log('📊 GitHub 동기화 상태:');
console.log('Token:', localStorage.getItem('github_token') ? '✅ 존재' : '❌ 없음');
console.log('Gist ID:', localStorage.getItem('github_gist_id') || '❌ 없음');
console.log('연결 상태:', app?.githubSync?.isConfigured() ? '✅ 연결됨' : '❌ 연결 안 됨');

// === 2. 수동 동기화 테스트 ===
// 업로드 테스트
console.log('\n📤 업로드 테스트 시작...');
await app.githubSync.pushData();

// 다운로드 테스트 (주의: 현재 데이터를 덮어씀)
// console.log('\n📥 다운로드 테스트 시작...');
// await app.githubSync.pullData();

// === 3. Gist 직접 확인 ===
console.log('\n🔗 Gist 확인 URL:');
const gistId = localStorage.getItem('github_gist_id');
if (gistId) {
    console.log(`https://gist.github.com/${gistId}`);
} else {
    console.log('Gist ID가 없습니다. Token을 먼저 연결하세요.');
}
```

---

## 예상 결과

### ✅ 정상 (모든 게 잘 작동)
```
📊 GitHub 동기화 상태:
Token: ✅ 존재
Gist ID: ✅ a1b2c3d4e5f6...
연결 상태: ✅ 연결됨

📤 업로드 테스트 시작...
📦 Data to sync: { categories: 2, settings: 60, footerBookmarks: 4 }
📤 Updating existing Gist: a1b2c3d4...
✅ Data pushed to GitHub Gist successfully

🔗 Gist 확인 URL:
https://gist.github.com/a1b2c3d4e5f6...
```

### ❌ 문제 (Token이 없거나 연결 안 됨)
```
📊 GitHub 동기화 상태:
Token: ❌ 없음
Gist ID: ❌ 없음
연결 상태: ❌ 연결 안 됨

📤 업로드 테스트 시작...
❌ Push error: GitHub token not configured
```

---

## 다음 단계

### Token이 없다면:
1. 설정(⚙️) → GitHub 클라우드 동기화
2. Token 입력 → "GitHub 연결하기" 클릭

### Token은 있는데 Gist ID가 없다면:
```javascript
// 수동으로 Gist 생성
await app.githubSync.migrateFromLocalStorage();
```

### 모든 게 정상인데 동기화가 안 된다면:
```javascript
// 즉시 동기화
await app.githubSync.pushData();

// 또는 설정 모달에서 "지금 동기화" 버튼 클릭
```

---

## Favicon 에러 무시하기

콘솔에서 favicon 에러를 필터링하려면:

1. F12 → Console 탭
2. Filter 입력창에: `-favicon -ico -NotSameOrigin`
3. Enter

이제 중요한 로그만 보입니다!

---

## 실제 테스트

**회사 컴퓨터에서**:
1. 위 스크립트 실행
2. Gist URL 복사 → 브라우저에서 열기
3. `startpage-data.json` 파일 확인
4. 북마크 데이터가 있는지 확인

**집 컴퓨터에서**:
1. 같은 Token 입력
2. "기존 Gist 발견" → 확인
3. 북마크가 동기화되었는지 확인

---

**실행 후 결과를 알려주세요!** 📊

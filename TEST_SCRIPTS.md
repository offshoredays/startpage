# 🧪 v2.3 빠른 테스트 스크립트

브라이언이 콘솔(F12)에 복사-붙여넣기해서 실행할 수 있는 간단한 테스트 스크립트입니다.

---

## 1️⃣ 현재 상태 확인

```javascript
// === 현재 상태 체크 ===
console.log('\n📊 === 현재 상태 ===');
console.log('Token:', localStorage.getItem('github_token') ? '✅ 있음' : '❌ 없음');
console.log('Gist ID:', localStorage.getItem('github_gist_id') || '❌ 없음');
console.log('마지막 동기화:', localStorage.getItem('lastSyncTime') || '❌ 없음');
console.log('연결 상태:', app?.githubSync?.isConfigured() ? '✅ 연결됨' : '❌ 연결 안 됨');
console.log('\n📚 데이터 현황:');
console.log('- 카테고리:', app.categories.length);
console.log('- 북마크:', app.categories.reduce((sum, c) => sum + c.bookmarks.length, 0));
console.log('- 푸터 북마크:', app.footerBookmarks?.length || 0);
console.log('- 검색 엔진:', app.settings?.searchEngines?.length || 0);
```

---

## 2️⃣ 동기화 테스트 (업로드)

```javascript
// === 클라우드에 업로드 ===
console.log('\n📤 === 클라우드에 업로드 중... ===');
await app.githubSync.pushData();
console.log('업로드 완료! 위 메시지에서 ✅를 확인하세요.');
```

---

## 3️⃣ 동기화 테스트 (다운로드)

```javascript
// === 클라우드에서 다운로드 ===
console.log('\n📥 === 클라우드에서 다운로드 중... ===');
await app.githubSync.pullData(true);  // 강제 덮어쓰기
console.log('다운로드 완료! 위 메시지에서 ✅를 확인하세요.');
```

---

## 4️⃣ 충돌 감지 테스트

```javascript
// === 충돌 감지 로직 테스트 ===
console.log('\n🔍 === 충돌 감지 테스트 ===');

// 현재 타임스탬프 확인
const localTime = localStorage.getItem('lastSyncTime');
console.log('현재 로컬 타임스탬프:', localTime);

// pullData() 실행 (자동으로 비교)
console.log('\n다운로드 시도 중...');
await app.githubSync.pullData();  // forceOverwrite = false (기본값)

console.log('\n⚠️ 위 메시지를 확인하세요:');
console.log('- "Local data is newer" → 로컬이 최신이라 업로드함');
console.log('- "Data pulled successfully" → 클라우드가 최신이라 다운로드함');
```

---

## 5️⃣ Gist ID 확인 및 비교

```javascript
// === 두 컴퓨터의 Gist ID 비교 ===
console.log('\n🔗 === Gist ID 확인 ===');
const gistId = localStorage.getItem('github_gist_id');
console.log('현재 Gist ID:', gistId);
console.log('\nGist URL:', 'https://gist.github.com/' + gistId);
console.log('\n⚠️ 다른 컴퓨터에서도 이 스크립트를 실행하고 Gist ID를 비교하세요!');
console.log('만약 다르다면 v2.3_SUMMARY.md의 "테스트 체크리스트" 참고!');
```

---

## 6️⃣ 완전 초기화 (문제 발생 시만 사용!)

```javascript
// ⚠️ 경고: 이 스크립트는 모든 로컬 데이터를 삭제합니다!
// 먼저 백업을 권장합니다.

console.log('\n⚠️ === 완전 초기화 (주의!) ===');
const confirmReset = confirm(
  '⚠️ 경고!\n\n' +
  '모든 로컬 데이터가 삭제됩니다.\n' +
  '계속하시겠습니까?\n\n' +
  '(취소를 누르면 아무 일도 일어나지 않습니다.)'
);

if (confirmReset) {
  console.log('백업 생성 중...');
  const backup = {
    categories: app.categories,
    settings: app.settings,
    footerBookmarks: app.footerBookmarks,
    timestamp: new Date().toISOString()
  };
  console.log('📦 백업 데이터 (복사해서 저장하세요):');
  console.log(JSON.stringify(backup, null, 2));
  
  console.log('\n로컬 데이터 삭제 중...');
  localStorage.clear();
  
  console.log('✅ 초기화 완료!');
  console.log('페이지를 새로고침한 후 GitHub Token을 다시 입력하세요.');
  
  setTimeout(() => {
    location.reload();
  }, 3000);
} else {
  console.log('초기화 취소됨.');
}
```

---

## 7️⃣ 자동 동기화 간격 변경

```javascript
// === 자동 동기화 간격 변경 ===
console.log('\n⏱️ === 자동 동기화 간격 변경 ===');

// 현재 간격 확인
console.log('현재 간격:', app.githubSync.syncInterval ? '5분 (기본값)' : '❌ 정지됨');

// 1분으로 변경
app.githubSync.startAutoSync(1);
console.log('✅ 자동 동기화 간격을 1분으로 변경했습니다.');

// 또는 10분으로 변경하려면:
// app.githubSync.startAutoSync(10);
```

---

## 8️⃣ 전체 통합 테스트

```javascript
// === 전체 시나리오 테스트 ===
console.log('\n🧪 === 전체 통합 테스트 시작 ===\n');

// 1. 상태 확인
console.log('1️⃣ 현재 상태 확인...');
console.log('Token:', localStorage.getItem('github_token') ? '✅' : '❌');
console.log('Gist ID:', localStorage.getItem('github_gist_id')?.substring(0, 8) + '...');
console.log('북마크 수:', app.categories.reduce((s,c)=>s+c.bookmarks.length,0));

// 2. 백업 생성
console.log('\n2️⃣ 백업 생성 중...');
const testBackup = {
  timestamp: new Date().toISOString(),
  bookmarks: app.categories.reduce((s,c)=>s+c.bookmarks.length,0)
};
console.log('백업:', testBackup);

// 3. 업로드 테스트
console.log('\n3️⃣ 업로드 테스트...');
await app.githubSync.pushData();
console.log(localStorage.getItem('lastSyncTime') ? '✅ 타임스탬프 저장됨' : '❌ 실패');

// 4. 다운로드 테스트
console.log('\n4️⃣ 다운로드 테스트 (충돌 감지 활성화)...');
await app.githubSync.pullData();  // forceOverwrite = false

// 5. 결과 확인
console.log('\n5️⃣ 결과 확인...');
console.log('북마크 수:', app.categories.reduce((s,c)=>s+c.bookmarks.length,0));
console.log('백업과 비교:', testBackup.bookmarks === app.categories.reduce((s,c)=>s+c.bookmarks.length,0) ? '✅ 동일' : '⚠️ 변경됨');

console.log('\n✅ === 전체 테스트 완료! ===');
console.log('위 로그에서 에러가 없으면 정상입니다.');
```

---

## 9️⃣ 빠른 북마크 추가 (테스트용)

```javascript
// === 테스트용 북마크 추가 ===
console.log('\n➕ === 테스트 북마크 추가 ===');

// 첫 번째 카테고리에 테스트 북마크 추가
const testBookmark = {
  id: 'test_' + Date.now(),
  title: '테스트 북마크 ' + new Date().toLocaleTimeString(),
  url: 'https://www.google.com',
  description: 'v2.3 동기화 테스트용'
};

app.categories[0].bookmarks.push(testBookmark);
app.saveData();  // 저장 + 자동 업로드

console.log('✅ 테스트 북마크 추가됨:', testBookmark.title);
console.log('📤 5초 후 자동으로 클라우드에 업로드됩니다...');
console.log('다른 컴퓨터에서 "클라우드에서 가져오기"를 눌러보세요!');
```

---

## 🔟 디버그 모드 활성화

```javascript
// === 디버그 모드 ===
console.log('\n🐛 === 디버그 정보 ===\n');

window.DEBUG_SYNC = true;  // 디버그 모드 활성화

// 기존 pushData에 로깅 추가
const originalPush = app.githubSync.pushData.bind(app.githubSync);
app.githubSync.pushData = async function() {
  console.log('🔍 [DEBUG] pushData() 시작');
  console.log('🔍 [DEBUG] 현재 데이터:', {
    categories: this.app.categories.length,
    bookmarks: this.app.categories.reduce((s,c)=>s+c.bookmarks.length,0),
    timestamp: new Date().toISOString()
  });
  const result = await originalPush();
  console.log('🔍 [DEBUG] pushData() 완료');
  return result;
};

// 기존 pullData에 로깅 추가
const originalPull = app.githubSync.pullData.bind(app.githubSync);
app.githubSync.pullData = async function(force) {
  console.log('🔍 [DEBUG] pullData() 시작 (force=' + (force || false) + ')');
  const localTime = localStorage.getItem('lastSyncTime');
  console.log('🔍 [DEBUG] 로컬 타임스탬프:', localTime);
  const result = await originalPull(force);
  console.log('🔍 [DEBUG] pullData() 완료');
  return result;
};

console.log('✅ 디버그 모드 활성화됨!');
console.log('이제 pushData()와 pullData()를 실행하면 상세 로그가 출력됩니다.');
```

---

## 📝 사용 방법

1. **브라우저 콘솔 열기**: `F12` 키 또는 `우클릭 → 검사`
2. **Console 탭** 선택
3. 위 스크립트 중 하나를 **복사**
4. 콘솔에 **붙여넣기**
5. **Enter** 키로 실행

---

## 💡 팁

### 빠른 체크 함수 만들기
콘솔에 이 코드를 실행하면 `check()`만 입력하면 바로 상태 확인:

```javascript
window.check = () => {
  console.clear();
  console.log('📊 상태:', {
    token: !!localStorage.getItem('github_token'),
    gist: localStorage.getItem('github_gist_id')?.substring(0,8)+'...',
    sync: localStorage.getItem('lastSyncTime')?.substring(11,19),
    bookmarks: app.categories.reduce((s,c)=>s+c.bookmarks.length,0)
  });
};
console.log('✅ check() 함수 등록됨! 언제든 check()를 입력하세요.');
```

이제 `check()`만 입력하면:
```
📊 상태: {
  token: true,
  gist: "83d7ab0d...",
  sync: "12:34:56",
  bookmarks: 15
}
```

---

**작성일**: 2026-03-09  
**버전**: v2.3  
**용도**: 브라이언의 빠른 동기화 테스트

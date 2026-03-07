# 🚀 GitHub 클라우드 동기화 사용 가이드

## 📝 시작하기 전에

GitHub Gist 동기화를 사용하면:
- ✅ 집, 회사, 카페 등 **어디서든 같은 북마크** 사용
- ✅ 5분마다 **자동으로 클라우드 백업**
- ✅ **Private Gist**로 안전하게 저장
- ✅ 무료, 무제한 (GitHub 계정만 있으면 OK)

---

## 1️⃣ GitHub Personal Access Token 발급

### 방법 A: 자동 링크 사용 (추천)
1. 아래 링크 클릭:
   👉 https://github.com/settings/tokens/new?description=Startpage%20Sync&scopes=gist
2. 권한이 자동으로 체크됨 (`gist`)
3. "Generate token" 클릭
4. **토큰 복사** (ghp_로 시작) ⚠️ 다시 볼 수 없으니 꼭 복사!

### 방법 B: 수동 설정
1. https://github.com/settings/tokens 접속
2. "Generate new token" → "Generate new token (classic)" 선택
3. **Note**: `Startpage Sync` (원하는 이름)
4. **Expiration**: `No expiration` 추천
5. **Select scopes**: ✅ **gist** 체크
6. "Generate token" 클릭
7. **토큰 복사**

---

## 2️⃣ 스타트 페이지에 연결

### 첫 번째 기기 (집 or 회사)
1. 스타트 페이지 열기 (`index.html`)
2. 오른쪽 상단 **⚙️ 설정** 버튼 클릭
3. 아래로 스크롤해서 **"GitHub 클라우드 동기화"** 섹션 찾기
4. 복사한 Token 붙여넣기
5. **"GitHub 연결하기"** 버튼 클릭
6. ✅ "GitHub 연결 완료!" 메시지 확인

**축하합니다! 이제 자동으로 5분마다 클라우드에 저장됩니다.**

---

## 3️⃣ 다른 기기에서 동기화

### 두 번째 기기 (회사 or 집)
1. 스타트 페이지 열기
2. 설정 → "GitHub 클라우드 동기화"
3. **같은 Token** 붙여넣기
4. "GitHub 연결하기" 클릭
5. **"클라우드에서 가져오기"** 버튼 클릭
6. ✅ 모든 북마크와 설정이 동기화됩니다!

---

## 4️⃣ 일상 사용법

### 자동 동기화 (권장)
- 아무것도 하지 않아도 **5분마다 자동 저장**
- 북마크 추가/수정/삭제 시 자동으로 클라우드에 반영
- 상태 표시: ⏳ 동기화 중 / ✅ 성공 / ❌ 실패

### 수동 동기화
- **지금 동기화**: 즉시 클라우드에 저장
- **클라우드에서 가져오기**: 다른 기기의 최신 데이터 불러오기

### 연결 해제
- 설정 → "연결 해제" 버튼
- 로컬 데이터는 유지됨 (localStorage)
- 자동 동기화만 중단

---

## 🔒 보안 및 프라이버시

### Token 보안
- ⚠️ Token은 **비밀번호처럼 관리**하세요
- 브라우저 localStorage에 저장됨
- 공용 PC에서는 사용 후 "연결 해제" 권장

### 데이터 저장 위치
- **GitHub Private Gist**: 나만 볼 수 있는 비공개 저장소
- **LocalStorage**: 브라우저 내부 (오프라인 백업)

### Gist 확인 방법
1. https://gist.github.com/ 접속
2. "Secret" 탭에서 `startpage-data.json` 확인
3. JSON 형식으로 모든 북마크/설정 저장됨

---

## 🐛 문제 해결

### "유효하지 않은 Token" 오류
- [ ] Token이 올바르게 복사되었는지 확인
- [ ] `gist` 권한이 체크되어 있는지 확인
- [ ] Token이 만료되지 않았는지 확인

### 동기화가 안 됨
- [ ] 인터넷 연결 확인
- [ ] "지금 동기화" 버튼으로 수동 시도
- [ ] F12 → Console 탭에서 오류 확인

### 다른 기기에서 데이터가 안 보임
- [ ] **같은 Token**을 사용했는지 확인 (다른 Token = 다른 Gist)
- [ ] "클라우드에서 가져오기" 버튼 클릭했는지 확인
- [ ] 첫 번째 기기에서 "지금 동기화" 먼저 실행

---

## 💡 Pro Tips

### Token 관리
- Token을 안전한 곳에 저장해두세요 (비밀번호 관리자 추천)
- 여러 기기에서 **같은 Token** 사용
- Token 분실 시: 새로 발급하고 모든 기기에서 재연결

### 데이터 안전
- GitHub Gist 동기화 + 로컬 백업(JSON) 병행 추천
- 중요한 변경 전 "백업 다운로드" 습관화

### 성능 최적화
- 자동 동기화는 백그라운드에서 실행 (성능 영향 없음)
- 오프라인에서도 정상 작동 (LocalStorage 백업)

---

## 📞 도움이 필요하신가요?

- GitHub Issues: [프로젝트 저장소](https://github.com/offshoredays/startpage)
- 문제 리포트: README.md 참조

---

**버전**: v2.1  
**최종 업데이트**: 2026-03-06  
**작성자**: Genspark AI Assistant

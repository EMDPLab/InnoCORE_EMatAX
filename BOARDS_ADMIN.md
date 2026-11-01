# 공지·세미나·채용 게시판 운영

게시판은 기존 GitHub Pages에서 운영합니다. 게시글 원본은 `content.js`의
`ko.news`, `en.news`입니다. 홈의 소식 카드와 게시판은 같은 게시 데이터를 읽습니다.
별도 계정·DB·유료 서비스 없이 저장소 편집과 기존 Actions 배포로 계속 관리합니다.

## 새 글 또는 수정

1. 공개 가능한 자료와 날짜·출처를 확인합니다. 내부 메일·지원자 자료·평가자료·
   개인 식별정보·비공개 접속 링크를 올리지 않습니다.
2. `ko.news`와 `en.news`에 같은 `id`, `category`, `sortDate`, 이미지·원문 링크를
   사용하고 제목·본문·표시 날짜를 각각 작성합니다. 게시 후 ID를 바꾸지 않습니다.
3. 분류는 `notice`(공지사항), `seminar`(세미나), `recruitment`(채용) 중 하나입니다.
   종료된 행사에는 `archived: true`를 지정하고, 진행 중인 공고·상시 안내에는 지정하지 않습니다.
   `sortDate`는 실제 원문 날짜를 `YYYY-MM-DD` 또는 월만 아는 경우 `YYYY-MM`으로
   기록합니다. 날짜가 없는 상시 안내는 빈 문자열을 사용합니다. 작성일을 추측하지 않습니다.
4. `date`는 화면에 표시하는 날짜, `title`은 제목, `description`은 본문입니다.
   `href`에는 검증된 공개 원문 URL을, `images`에는 공개 승인된 사진 경로를 넣습니다.
   사진은 기존과 같이 `{ thumb: "./assets/news/...", full: "./assets/news/..." }`를 사용합니다.

```js
{
  id: "seminar-202611-example",
  category: "seminar",
  archived: false, // 종료가 확인된 행사만 true
  sortDate: "2026-11", // 날짜를 확인한 뒤 실제 값으로 작성
  date: "2026.11",
  title: "공개 승인된 제목",
  description: "공개 승인된 본문",
  href: "https://example.org/approved-source",
  images: []
}
```

날짜순 목록, 분류/연도 필터와 검색은 자동 갱신됩니다. 지난 세미나와 채용 행사는
`archived: true`가 지정된 경우 ‘행사 기록’으로 표시됩니다. 채용 게시판의 공식 공고 링크에서 현재 모집 여부를
확인하도록 안내하며, 과거 행사만으로 현재 채용 중이라고 표시하지 않습니다.

## 편집·저장·게시의 구분

- 파일 편집: 양 언어 카탈로그를 수정합니다. GitHub 웹 편집기나 로컬 Codex 모두 가능합니다.
- 기존 로컬 관리자: `node admin-server.js`를 실행하고 출력된 로컬 주소의 `admin.html`을
  엽니다. 분류·ID·날짜·사진을 편집할 수 있습니다. 브라우저 저장은 그 브라우저의 초안입니다.
  `content.js 반영`은 로컬 국문 파일만 수정하며 영문은 별도로 편집해야 합니다.
  오래된 초안의 ID가 비어 있으면 필요한 내용을 백업하고 ‘뉴스 초기화’로 최신 게시본을 읽습니다.
- 공개 게시: 양 언어 확인 → 테스트 → commit → main에 push → Actions 성공 → 실제 URL 확인입니다.
  ‘저장’, ‘반영’, ‘commit’만으로 공개 게시가 완료되지 않습니다.
- 관리자 페이지와 서버 코드는 Pages 산출물에서 제외됩니다. 공개 홈페이지에 관리자 비밀번호나
  저장소 쓰기 토큰을 넣지 않습니다. 기존 PI Issue Form과 PI 상세 페이지는 계속 사용합니다.

## 검증과 배포

```bash
node --test tests/*.test.cjs
node scripts/build-site.cjs
python3 -m http.server 8080 --directory dist
```

로컬과 실제 공개 사이트에서 아래를 확인합니다.

- 홈 → 공지/세미나/채용 → 목록 → 상세 → 목록 복귀.
- 검색 결과, 결과 없음, 연도 필터, 잘못된 글 ID 안내.
- KR → EN → KR에서 같은 글·분류 유지, 원문·사진·기존 Fellow/PI 링크.
- 작은 화면의 메뉴·목록·사진과 가로 넘침.

`main` push 시 기존 `.github/workflows/deploy-pages.yml`이 검사 후 `dist/`만 배포합니다.
운영 문서·로컬 관리자·테스트·Apps Script 서버 소스는 산출물에 포함하지 않습니다.
기존 URL `https://emdplab.github.io/InnoCORE_EMatAX/`를 유지합니다.

게시판 주소:

- `boards.html?category=notice`
- `boards.html?category=seminar`
- `boards.html?category=recruitment`
- `boards.html?id=<게시글-ID>&lang=ko` 또는 `&lang=en` (새 브라우저에서도 해당 언어로 표시)

글의 ‘이 글 주소’ 필드에서 공유 주소를 복사할 수 있습니다. 되돌리기는 해당 게시 커밋을
`git revert`하여 main에 push하고 Pages 성공 및 공개 결과를 확인합니다.

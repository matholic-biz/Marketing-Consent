매쓰홀릭 마케팅 활용 및 초상권 사용 동의서 — 배포 파일

[구성]
  matholic-consent.html      메인 페이지 (이 파일 하나에 CSS/JS 모두 포함)
  assets/matholic_logo.png   로고
  fonts/*.woff2              SUIT 서체 (SIL OFL)
  google-sheets-setup.md     구글 스프레드시트 연동 안내

[올리는 방법]
  이 폴더 전체를 웹서버에 그대로 업로드하면 됩니다.
  폴더 구조를 바꾸실 경우 HTML 안의 ./assets/ 와 ./fonts/ 경로를 함께 수정해 주세요.

[구글 시트 연동]
  matholic-consent.html 하단 <script> 첫 줄
    var SHEETS_ENDPOINT = "";
  여기에 Apps Script 웹앱 배포 URL을 붙여넣으면 제출 데이터가 시트에 쌓입니다.
  자세한 절차는 google-sheets-setup.md 참고.

[폰트 라이선스]
  SUIT — SIL Open Font License 1.1 (https://sunn.kr/suit)

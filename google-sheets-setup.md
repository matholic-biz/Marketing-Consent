# 구글 스프레드시트 연동 설정

동의서 제출 데이터를 시트에 자동으로 쌓는 방법입니다. 서버 없이 무료로 동작합니다.

## 1. 시트 만들기

새 구글 스프레드시트를 만들고, 1행에 아래 머리글을 넣습니다.

| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 제출시각 | 성명 | 학원명 | 연락처 | 동의여부 | 사례금 | 은행명 | 예금주 | 계좌번호 | 사업자/주민번호 | 서명성명 | 서명이미지 |

## 2. Apps Script 붙여넣기

시트에서 **확장 프로그램 → Apps Script**를 열고, 기존 내용을 지운 뒤 아래를 붙여넣습니다.

```javascript
// 서명 이미지를 저장할 드라이브 폴더 ID (폴더 URL 끝부분). 비워두면 내 드라이브 최상위에 저장됩니다.
const SIGN_FOLDER_ID = '';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    let signUrl = '';
    if (d.signatureImage) {
      const base64 = d.signatureImage.split(',')[1];
      const blob = Utilities.newBlob(
        Utilities.base64Decode(base64),
        'image/png',
        '서명_' + (d.name || '무명') + '_' + new Date().getTime() + '.png'
      );
      const folder = SIGN_FOLDER_ID
        ? DriveApp.getFolderById(SIGN_FOLDER_ID)
        : DriveApp.getRootFolder();
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      signUrl = file.getUrl();
    }

    sheet.appendRow([
      Utilities.formatDate(new Date(d.submittedAt), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'),
      d.name || '',
      d.academy || '',
      d.phone || '',
      d.agree || '',
      d.fee || '',
      d.bank || '',
      d.holder || '',
      "'" + (d.account || ''),
      "'" + (d.tax || ''),
      d.signName || '',
      signUrl
    ]);

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

> 계좌번호·주민번호 앞의 `'`는 시트가 숫자로 인식해 0을 없애는 것을 막기 위한 것입니다.

## 3. 웹앱으로 배포

1. 우측 상단 **배포 → 새 배포**
2. 유형 선택(톱니바퀴) → **웹 앱**
3. 실행 계정: **나**
4. 액세스 권한: **모든 사용자**
5. **배포** → 권한 승인 → 나오는 **웹 앱 URL** 복사

URL 형태: `https://script.google.com/macros/s/AKfy.../exec`

## 4. 페이지에 URL 넣기

`동의서 랜딩페이지.dc.html`의 로직 상단:

```javascript
const SHEETS_ENDPOINT = "";
```

여기에 복사한 URL을 붙여넣으면 끝입니다. 저에게 URL을 주시면 대신 넣어드릴 수도 있습니다.

## 참고

- URL 미설정 상태에서는 제출 시 브라우저 콘솔에 전송될 데이터가 출력됩니다(테스트용).
- 전송은 `no-cors` 방식이라 브라우저가 응답 본문을 읽지 못합니다. 정상 동작 확인은 시트에 행이 쌓이는지로 판단합니다.
- 스크립트를 수정한 뒤에는 반드시 **배포 → 배포 관리 → 새 버전**으로 재배포해야 반영됩니다.
- 개인정보(계좌·주민번호)가 쌓이는 시트이므로 공유 권한을 담당자로 제한하고, 지급 완료 후 관계 법령 보관기간 경과 시 파기 절차를 두시길 권합니다.

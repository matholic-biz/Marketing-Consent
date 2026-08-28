/**
 * 매쓰홀릭 초상권 동의서 - Google Apps Script 백엔드
 *
 * 사용 방법:
 * 1. 데이터를 쌓을 Google Sheets 파일을 새로 만든다.
 * 2. 그 시트에서 [확장 프로그램 > Apps Script]를 연다.
 * 3. 기본 생성된 Code.gs 내용을 지우고 이 파일 내용을 그대로 붙여넣는다.
 * 4. SHEET_NAME, DRIVE_FOLDER_ID 값을 아래에서 채운다.
 * 5. 우측 상단 [배포 > 새 배포] → 유형: 웹 앱
 *    - 실행 계정: 나
 *    - 액세스 권한: 모든 사용자 (익명 포함) ← 반드시 이렇게 설정해야 폼에서 호출 가능
 * 6. 배포 후 발급되는 웹 앱 URL을 index.html의 GAS_ENDPOINT 값에 붙여넣는다.
 */

// ====== 설정값 ======
const SHEET_NAME = '제출내역';           // 데이터를 쌓을 시트 탭 이름
const DRIVE_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID'; // 서명 이미지를 저장할 구글 드라이브 폴더 ID
// =====================

const HEADERS = [
  '제출일시', '성명', '학원명', '연락처', '동의여부',
  '은행명', '예금주', '계좌번호', '사업자등록번호_또는_주민등록번호',
  '서명파일링크'
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet_();
    const signatureUrl = saveSignature_(data);

    sheet.appendRow([
      new Date(),
      data.name || '',
      data.academyName || '',
      data.phone || '',
      data.consent || '',
      data.bankName || '',
      data.accountHolder || '',
      data.accountNumber || '',
      data.taxId || '',
      signatureUrl
    ]);

    return jsonResponse_({ result: 'success' });
  } catch (err) {
    return jsonResponse_({ result: 'error', message: err.message });
  }
}

// 시트가 없으면 만들고, 헤더가 없으면 채운다.
function getOrCreateSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// 서명 Base64 이미지를 구글 드라이브에 PNG로 저장하고 열람 링크를 반환한다.
function saveSignature_(data) {
  if (!data.signature || !data.signature.includes(',')) return '';
  const base64 = data.signature.split(',')[1];
  const blob = Utilities.newBlob(
    Utilities.base64Decode(base64),
    'image/png',
    `${data.name || 'unknown'}_${new Date().getTime()}.png`
  );

  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// 배포 확인용 (브라우저로 웹앱 URL을 직접 열었을 때 응답)
function doGet(e) {
  return ContentService
    .createTextOutput('매쓰홀릭 동의서 백엔드가 정상 동작 중입니다.')
    .setMimeType(ContentService.MimeType.TEXT);
}

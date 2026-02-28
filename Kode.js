const SHEET_ID = "1yCQA__1FfgrnFo03ikebPuT5z2NAMrGyhcNE6x5LQf0";
const SHEET_NAME = "cloud1";

/* =========================
   DO GET (Routing + Status API)
========================= */
function doGet(e) {

  const path = e.parameter.path;

  // FRONTEND ROUTING
  if (path === "generate") {
    return HtmlService.createHtmlOutputFromFile("generate");
  }

  if (path === "scan") {
    return HtmlService.createHtmlOutputFromFile("scan");
  }

  // STATUS API
  if (path === "presence/status") {

    const user_id = e.parameter.user_id;
    const course_id = e.parameter.course_id;
    const session_id = e.parameter.session_id;

    if (!user_id || !course_id || !session_id) {
      return json({ ok: false, message: "Missing parameters" });
    }

    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {

      if (
        String(data[i][1]) === String(user_id) &&
        String(data[i][2]) === String(course_id) &&
        String(data[i][3]) === String(session_id)
      ) {
        return json({
          ok: true,
          data: {
            user_id: String(data[i][1]),
            course_id: String(data[i][2]),
            session_id: String(data[i][3]),
            status: data[i][6],
            last_ts: data[i][7]
          }
        });
      }
    }

    return json({ ok: false, message: "Not Found" });
  }

  return HtmlService.createHtmlOutput("API Running");
}

/* =========================
   DO POST (Generate + Checkin)
========================= */
function doPost(e) {

  if (!e.postData || !e.postData.contents) {
    return json({
      ok: false,
      message: "No body received. Make sure Content-Type is application/json"
    });
  }

  const body = JSON.parse(e.postData.contents);
  const path = e.parameter.path;

  if (!path) {
    return json({ ok: false, message: "Path required" });
  }

  // GENERATE QR
  if (path === "presence/qr/generate") {

    const qr_token = "TKN-" + Utilities.getUuid().slice(0, 8);
    const EXPIRE_SECONDS = 120;
    const expires_at = new Date(Date.now() + EXPIRE_SECONDS * 1000);

    CacheService.getScriptCache().put(
      qr_token,
      JSON.stringify({
        course_id: body.course_id,
        session_id: body.session_id,
        expires_at: expires_at.toISOString()
      }),
      EXPIRE_SECONDS
    );

    return json({
      ok: true,
      data: {
        qr_token,
        expires_at
      }
    });
  }

  // CHECKIN
  if (path === "presence/checkin") {

    const cache = CacheService.getScriptCache();
    const tokenData = cache.get(body.qr_token);

    if (!tokenData) {
      return json({ ok: false, message: "Token invalid / expired" });
    }

    const sheet = getSheet();
    const presence_id = "PR-" + Math.floor(Math.random() * 10000);

    sheet.appendRow([
      presence_id,
      body.user_id,
      body.course_id,
      body.session_id,
      body.qr_token,
      body.device_id,
      "checked_in",
      new Date().toISOString()
    ]);

    return json({
      ok: true,
      data: {
        presence_id,
        status: "checked_in"
      }
    });
  }

  return json({ ok: false, message: "Invalid POST endpoint" });
}

function generateQrServer(course_id, session_id) {

  try {

    const qr_token = "TKN-" + Utilities.getUuid().slice(0, 8);
    const EXPIRE_SECONDS = 120;
    const expires_at = new Date(Date.now() + EXPIRE_SECONDS * 1000);

    CacheService.getScriptCache().put(
      qr_token,
      JSON.stringify({
        course_id: course_id,
        session_id: session_id,
        expires_at: expires_at.toISOString()
      }),
      EXPIRE_SECONDS
    );

    return {
      ok: true,
      qr_token: qr_token,
      expires_at: expires_at.toISOString()
    };

  } catch (err) {

    return {
      ok: false,
      message: err.toString()
    };

  }
}

/* =========================
   UTIL
========================= */
function getSheet() {
  return SpreadsheetApp
    .openById(SHEET_ID)
    .getSheetByName(SHEET_NAME);
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
/**
 * Google Apps Script endpoint for the portfolio contact form.
 *
 * Setup:
 * 1. Create or open the Google Sheet that should receive messages.
 * 2. Open Extensions > Apps Script, replace the default code with this file,
 *    and deploy it as a Web app. Use "Anyone" as the access setting.
 * 3. Copy the deployed Web app URL into public/contact-config.js.
 *
 * Leave this blank when this script is bound to the destination spreadsheet.
 * For a standalone script, paste the spreadsheet ID from its URL instead.
 */
const SPREADSHEET_ID = '';
const SHEET_NAME = 'Contact messages';

function doPost(event) {
  try {
    const payload = readPayload_(event);
    const message = validatePayload_(payload);
    const sheet = getSheet_();

    sheet.appendRow([
      new Date(),
      message.name,
      message.email,
      message.message,
    ]);

    return json_({ ok: true, message: 'Thanks — your message has been received.' });
  } catch (error) {
    return json_({ ok: false, message: error.message || 'Unable to save the message.' });
  }
}

function doGet() {
  return json_({ ok: true, message: 'Portfolio contact endpoint is ready.' });
}

function readPayload_(event) {
  const raw = event && event.postData && event.postData.contents;
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (_) {
      // The form uses URL-encoded data for a CORS-safe browser request.
    }
  }
  return (event && event.parameter) || {};
}

function validatePayload_(payload) {
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim();
  const message = String(payload.message || '').trim();

  if (name.length < 2) throw new Error('Please enter a name of at least 2 characters.');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Please enter a valid email address.');
  if (message.length < 10) throw new Error('Please enter a message of at least 10 characters.');

  return { name, email, message };
}

function getSheet_() {
  const spreadsheet = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('Set SPREADSHEET_ID or bind this script to a Google Sheet.');

  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(['Received at', 'Name', 'Email', 'Message']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}

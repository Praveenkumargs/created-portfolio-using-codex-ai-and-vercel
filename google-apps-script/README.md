# Google Sheets contact-message endpoint

1. Create a Google Sheet for portfolio messages.
2. In that sheet, select **Extensions → Apps Script** and paste in `Code.gs`.
3. Click **Deploy → New deployment → Web app**.
4. Set **Execute as** to yourself and **Who has access** to **Anyone**, then deploy.
5. Copy the resulting `/exec` URL into `public/contact-config.js`.

The first valid form submission creates a **Contact messages** tab with the columns: received time, name, email, and message.

For a standalone Apps Script project, paste the target spreadsheet ID into `SPREADSHEET_ID` in `Code.gs` instead of leaving it blank.

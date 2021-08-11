
async function readsheet(query) {
    const google1 = require('googleapis');
    const google = new google1.GoogleApis();
    const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });

    const sheets = google.sheets({ version: 'v4', auth });

    const { id } = query;
    const range = `Sheet1!A${id}:C${id}`;
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range,
    });

    const [title, content] = response.data.values[0];
    return  {
        title,
        content
    }
}

module.exports = readsheet;
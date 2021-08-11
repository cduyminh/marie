const {google} = require('googleapis');
const request = require('request')
async function writesheet(query, req) {
    //Auth
    const auth = new google.auth.GoogleAuth({ 
        keyFile: 'secrets.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets'] ,

    });
    //Create client instance for google sheets
    const client = await auth.getClient();

    //Instance of google sheets Api
    const sheets = google.sheets({ version: 'v4', auth: client});

    let str = String(query);
    const mapObj = {
        '%Class Report%' : "~",
        'Date:' : "~",
        "Class ID:": "~",
        'Educator:': "~",
        'Attendance:': "~",
        'Recapture Knowledge:': "~",
        'Active Level:': "~",
        'Groupwork:': "~",
        'Progress:': "~",
        'Problems:': "~",
        'Homework:': "~"};
    let str1 = str.replace('%Class Report%','');
        str1 = str1.replace('Date:' ,'~');
        str1 = str1.replace("Class ID:",'~');
        str1 = str1.replace('Educator:' ,'~');
        str1 = str1.replace("Attendance:",'~');
        str1 = str1.replace('Recapture Knowledge:' ,'~');
        str1 = str1.replace("Active Level:",'~');
        str1 = str1.replace('Groupwork:' ,'~');
        str1 = str1.replace("Progress:",'~');
        str1 = str1.replace('Problems:' ,'~');
        str1 = str1.replace("Homework:",'~');
    let str2 = str1.split("~");
    await sheets.spreadsheets.values.append({
        auth,
        spreadsheetId: process.env.SHEET_ID,
        range:'Sheet2!A:B',
        valueInputOption: "RAW",
        resource: {
            values: [
                str2
            ]
        }
    });
    console.log("--------------metadata");
    getChatbotToken(req);

}
function getChatbotToken(req) {
    request({
        url: `https://zoom.us/oauth/token?grant_type=client_credentials`,
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(process.env.zoom_client_id + ':' + process.env.zoom_client_secret).toString('base64')
        }
    }, (error, httpResponse, body) => {
        if (error) {
            console.log('Error getting chatbot_token from Zoom.', error)
        } else {
            body = JSON.parse(body)
            sendChat(body.access_token,req)
        }
    })
}
function sendChat(chatbotToken,req) {
    console.log("----------------sendChat")
    request({
        url: 'https://api.zoom.us/v2/im/chat/messages',
        method: 'POST',
        json: true,
        body: {
            'robot_jid': process.env.zoom_bot_jid,
            'to_jid': req.body.payload.toJid,
            'account_id': req.body.payload.accountId,
            'content': {
                'head': {
                    'text': 'I have posted your report.'
                },
                'body': [{
                    'type': 'message',
                    'text': 'Thank you very much!'
                }]
            }
        },
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + chatbotToken
        }
    }, (error, httpResponse, body) => {
        if (error) {
            console.log('Error sending chat.', error)
        } else {
            console.log(body)
        }
    })
}


module.exports = writesheet;
const request = require('request')
var ts = Date.now();
var datetime = new Date(ts);
let date = String(datetime.getDate())+'/'+String(datetime.getUTCMonth()+1)+'/'+String(datetime.getFullYear());
let timestamp = date + " " + String(datetime.getHours()) + ":" + String(datetime.getMinutes())+":" + String(datetime.getSeconds());
console.log(date);
console.log(timestamp);
async function readwrite(){
    const a = {
        "id": 2
    };
    
    await writesheet(req.body.payload.cmd);
    return await readsheet(a);
}
function getChatbotToken(req) {
    let template = 
    `%Class Report%
    Class Date: ${date}
    Class ID:
    Educator: ${req.body.payload.userName}
    Attendance:
    Recapture Knowledge: 0/1/2/3
    Active Level: 0/1/2/3
    Groupwork: 0/1/2/3
    Progress: 
    Problems: 
    Homework: 

    *Note: Change your class date to the date it happened.
    `;
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
            sendTemplate(body.access_token,req,template)
        }
    })
}
function sendChat(chatbotToken) {
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
                    'text': 'Unsplash'
                },
                'body': [{
                    'type': 'message',
                    'text': 'You sent ' + req.body.payload.cmd
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

 function sendTemplate(chatbotToken,req,template) {
    console.log("----------------sendTemplate")
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
                    'text': timestamp
                },
                'body': [{
                    'type': 'message',
                    'text': template,
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

module.exports = getChatbotToken;
require('dotenv').config()


const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const readsheet = require('./readsheet')
const writesheet = require('./writesheet')
const getChatbotToken = require('./sendreporttemplate')

const app = express()
const port = process.env.PORT || 5000

app.use(express.json())

app.get('/', (req, res) => {
    res.send('Welcome to the Unsplash Chatbot for Zoom!')
})

app.get('/authorize', (req, res) => {
    res.redirect('https://zoom.us/launch/chat?jid=robot_' + process.env.zoom_bot_jid)
})

app.get('/support', (req, res) => {
    res.send('See Zoom Developer Support  for help.')
})

app.get('/privacy', (req, res) => {
    res.send('The Unsplash Chatbot for Zoom does not store any user data.')
})

app.get('/terms', (req, res) => {
    res.send('By installing the Unsplash Chatbot for Zoom, you are accept and agree to these terms...')
})

app.get('/documentation', (req, res) => {
    res.send('Try typing "island" to see a photo of an island, or anything else you have in mind!')
})

app.get('/zoomverify/verifyzoom.html', (req, res) => {
    res.send(process.env.zoom_verification_code)
})

app.post('/unsplash', (req, res) => {
    console.log('--------------req.Body /Unsplash');
    let cmd = String(req.body.payload.cmd);


    if(cmd==="") return;
    if(cmd.includes("template"))
        {
            getChatbotToken(req);
        }
        else{
            if (cmd.includes("%Class Report%")){
                writesheet(cmd,req);
            }
            //getChatbotToken();
        }
    //const props = readwrite();

    
})

app.post('/deauthorize', (req, res) => {
    if (req.headers.authorization === process.env.zoom_verification_token) {
        res.status(200)
        res.send()
        request({
            url: 'https://api.zoom.us/oauth/data/compliance',
            method: 'POST',
            json: true,
            body: {
                'client_id': req.body.payload.client_id,
                'user_id': req.body.payload.user_id,
                'account_id': req.body.payload.account_id,
                'deauthorization_event_received': req.body.payload,
                'compliance_completed': true
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(process.env.zoom_client_id + ':' + process.env.zoom_client_secret).toString('base64'),
                'cache-control': 'no-cache'
            }
        }, (error, httpResponse, body) => {
            if (error) {
                console.log(error)
            } else {
                console.log(body)
            }
        })
    } else {
        res.status(401)
        res.send('Unauthorized request to Unsplash Chatbot for Zoom.')
    }
})

app.get('/tshirt', (req, res) => {
    res.status(200).send({
        tshirt: '👕',
        size: 'large'
    });

})

app.get('/tshirt/:id', (req, res) => {
    const {id} = req.params;
    const {logo} = req.body;

    if(!logo){
        res.status(418).send({message: 'We need a logo!'});
    }

    res.send({tshirt: `👕 with your ${logo} and ${id}`,});
})

app.get('/html',(req, res) => {
    const {id} = req.params;
    res.status(200).send({
        tshirt: '👕',
        size: 'large'
    });
})


app.get('/html/:id',async (req, res) => {
    const {id} = req.params;
    props =  await readsheet(req.params);
    console.log(props);
    console.log(props);
    console.log(props);

    res.status(200).send({
        tshirt: '👕',
        size: id,
        props:props,
    });
    console.log(props);

})




app.listen(port, () => console.log(`Unsplash Chatbot for Zoom listening on port ${port}!`))
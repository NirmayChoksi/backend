const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const app = express();
const port = 3000;
require('dotenv').config()

// Initialize Firebase Admin SDK only once
admin.initializeApp({
    credential: admin.credential.cert({
        "type": process.env.TYPE,
        "project_id": process.env.PROJECTID,
        "private_key_id": process.env.PRIVATEKEYID,
        "private_key": process.env.PRIVATEKEY,
        "client_email": process.env.CLIENTEMAIL,
        "client_id": process.env.CLIENTID,
        "auth_uri": process.env.AUTHURI,
        "token_uri": process.env.TOKENURI,
        "auth_provider_x509_cert_url": process.env.AUTHPROVIDERX509CERTURL,
        "client_x509_cert_url": process.env.CLIENTX509CERTURL,
        "universe_domain": process.env.UNIVERSEDOMAN
    }),
    databaseURL: "https://push-notifications-f7c23-default-rtdb.asia-southeast1.firebasedatabase.app"
});

// Use body-parser middleware to parse incoming request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use CORS middleware to enable Cross-Origin Resource Sharing
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/send', async (req, res) => {
    const requestData = req.body;
    const payload = {
        notification: {
            title: requestData.title,
            body: requestData.body,
        },
        tokens: requestData.guestTokens,
    };

    try {
        const response = await admin.messaging().sendMulticast(payload); // Corrected method name
        console.log(`${response.successCount} messages were sent successfully`);
        res.status(200).json({ message: 'Notifications sent successfully.' });
    } catch (error) {
        console.error('Error sending notifications:', error);
        res.status(500).json({ message: 'Error sending notifications.' });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

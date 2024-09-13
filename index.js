const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const app = express();
const port = 3000;

// Initialize Firebase Admin SDK only once
admin.initializeApp({
    projectId: "push-notifications-f7c23",
    serviceAccountId: "101646088545574856608"
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
        res.status(200).send('Notifications sent successfully.');
    } catch (error) {
        console.error('Error sending notifications:', error);
        res.status(500).send('Error sending notifications.');
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

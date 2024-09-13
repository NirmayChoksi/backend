const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;
const admin = require('firebase-admin')

// Use body-parser middleware to parse incoming request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use CORS middleware to enable Cross-Origin Resource Sharing
app.use(cors());

app.get('/', (req, res) => {
    admin.initializeApp({
        projectId: "push-notifications-f7c23",
        serviceAccountId: "101646088545574856608"
    })
    res.send('Hello World!');
});

app.post('/send', async (req, res) => {
    const requestData = req.body
    const payload = {
        notification: {
            title: requestData.title,
            body: requestData.body,
        },
        tokens: requestData.guestTokens,
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(payload);
        console.log(`${response.successCount} messages were sent successfully`);
    } catch (error) {
        console.error('Error sending notifications:', error);
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

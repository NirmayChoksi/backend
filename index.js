const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const { getMessaging } = require('firebase-admin/messaging');
const app = express();
const schedule = require('node-schedule');
const port = 3000;

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// Initialize Firebase Admin SDK only once
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "push-notifications-f7c23",
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

    // Schedule the notification to be sent 5 minutes from now
    const job = schedule.scheduleJob(new Date(Date.now() + 1 * 30000), () => {
        getMessaging().sendEachForMulticast(payload).then(response => {
            console.log(response);
        }).catch(err => {
            console.error('Error sending notification:', err);
        });
    });

    res.status(200).json({ message: 'Notification scheduled to be sent in 5 minutes.' });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

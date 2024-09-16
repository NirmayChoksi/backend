const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const { getMessaging } = require('firebase-admin/messaging');
const app = express();
const schedule = require('node-schedule');
const port = 3000;
const agenda = require('agenda');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// Initialize Firebase Admin SDK only once
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "push-notifications-f7c23",
    databaseURL: "https://push-notifications-f7c23-default-rtdb.asia-southeast1.firebasedatabase.app"
});

agenda.define('send event reminder', async (job) => {
    const { tokens, message } = job.attrs.data;
    sendNotification(tokens, message);  // Call the notification function
});

function sendNotification(tokens, message) {
    const payload = {
        notification: {
            title: message.title,
            body: message.body
        },
        token: tokens,
    };

    getMessaging().sendEach(payload)
        .then(response => {
            console.log("Successfully sent message:", response);
        })
        .catch(error => {
            console.log("Error sending message:", error);
        });
}

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

    agenda.schedule(new Date(Date.now() + 1 * 20000), 'send event reminder', {
        token: token,
        message: {
            title: 'Event Reminder',
            body: `Reminder: Your event is tomorrow at ${eventDate.format('MMMM Do YYYY, h:mm A')}`
        }
    });

    res.status(200).json({ message: 'Notification scheduled to be sent in 5 minutes.' });
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

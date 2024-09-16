const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const { getMessaging } = require('firebase-admin/messaging');
const Agenda = require('agenda');

const app = express();
const port = 3000;

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "push-notifications-f7c23",
    databaseURL: "https://push-notifications-f7c23-default-rtdb.asia-southeast1.firebasedatabase.app"
});

// Initialize Agenda
const agenda = new Agenda({ db: { address: 'mongodb+srv://Nirmaychoksi:NirmayChoksi2002@cluster0.s6dc1no.mongodb.net/Shaadi' } });

// Define the job for sending notifications
agenda.define('send event reminder', async (job) => {
    const { tokens, message } = job.attrs.data;
    console.log('Agenda Defined');
    try {
        // Call the notification function
        await sendNotification(tokens, message);

        // Remove the job document after sending the notification
        await job.remove();
        console.log('Job completed and removed from the database.');
    } catch (error) {
        console.error('Error sending notification:', error);
    }
});

// Send notification function
async function sendNotification(tokens, message) {
    console.log('Send Notification function called', tokens, message);
    const payload = {
        notification: {
            title: message.title,
            body: message.body,
        },
        tokens
    };

    try {
        const response = await getMessaging().sendEachForMulticast(payload);
        console.log("Successfully sent message:", response);
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

// Use body-parser middleware to parse incoming request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use CORS middleware to enable Cross-Origin Resource Sharing
app.use(cors());

// Simple route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Schedule notification route
app.post('/send', async (req, res) => {
    const { title, body, guestTokens, eventDate } = req.body;

    // Schedule the notification to be sent in 5 minutes
    await agenda.schedule(new Date(Date.now() + 20000), 'send event reminder', {
        tokens: guestTokens,
        message: {
            title: 'Event Reminder',
            body: `Reminder: Your event is tomorrow at ${eventDate}`,
        },
    });

    res.status(200).json({ message: 'Notification scheduled to be sent in 5 minutes.' });
});

// Start agenda to process jobs
agenda.start();

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

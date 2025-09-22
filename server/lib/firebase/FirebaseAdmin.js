// FirebaseAdmin.js
const admin = require("firebase-admin");

class FirebaseAdmin {
  constructor() {
    if (!FirebaseAdmin.instance) {
      this._initialize();
      FirebaseAdmin.instance = this;
    }

    return FirebaseAdmin.instance;
  }

  _initialize() {
    // Load the service account key
    const serviceAccount = require("./serviceAccountKey.json");

    // Initialize Firebase Admin SDK if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: "retina-lms-824b3",
      });
    }

    this.messaging = admin.messaging();
  }

  getMessaging() {
    return this.messaging;
  }

  // Function to send a notification to a single client
  async sendNotificationToClient(token, title, body) {
    const message = {
      notification: {
        title: title,
        body: body,
      },
      token: token, // Target device token
    };

    try {
      const response = await this.messaging.send(message);
      console.log("Notification sent to single client:", response);
      return response;
    } catch (error) {
      console.error("Error sending notification to client:", error);
      throw error;
    }
  }

  // Function to send a notification to multiple clients
  async sendNotificationToMultipleClients(tokens, title, body) {
    const message = {
      notification: {
        title: title,
        body: body,
      },
      tokens: tokens, // Array of device tokens
    };

    try {
      const response = await this.messaging.sendMulticast(message);
      console.log("Notification sent to multiple clients:", response);
      return response;
    } catch (error) {
      console.error("Error sending notification to multiple clients:", error);
      throw error;
    }
  }

  // Optionally, add other Firebase services like Auth or Firestore
  getAuth() {
    return admin.auth();
  }

  getFirestore() {
    return admin.firestore();
  }
}

// Ensure the instance is a singleton
const instance = new FirebaseAdmin();
Object.freeze(instance);

module.exports = instance;

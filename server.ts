import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Firebase Admin (requires service account)
  const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountVar) {
    try {
      let serviceAccount;
      if (serviceAccountVar.trim().startsWith('{')) {
        // Plain JSON
        serviceAccount = JSON.parse(serviceAccountVar);
      } else {
        // Base64 encoded
        serviceAccount = JSON.parse(
          Buffer.from(serviceAccountVar, 'base64').toString('utf-8')
        );
      }
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("Firebase Admin initialized");
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT", e);
    }
  }

  // API to send notification
  app.post("/api/send-notification", async (req, res) => {
    const { tokens, title, body, data } = req.body;

    if (!tokens || tokens.length === 0) {
      return res.status(400).json({ error: "No tokens provided" });
    }

    if (!admin.apps.length) {
      return res.status(500).json({ error: "Firebase Admin not initialized. Please set FIREBASE_SERVICE_ACCOUNT env var." });
    }

    const message = {
      notification: { title, body },
      data: data || {},
      tokens: tokens,
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      res.json({ success: true, response });
    } catch (error: any) {
      console.error("FCM Send Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/send-notification-auto", async (req, res) => {
    const { userId, title, body, data } = req.body;

    if (!userId) return res.status(400).json({ error: "No userId provided" });
    if (!admin.apps.length) return res.status(500).json({ error: "Firebase Admin not initialized" });

    try {
      let tokens: string[] = [];
      if (userId === 'admin') {
        const adminUsers = await admin.firestore().collection('users').where('is_admin', '==', true).get();
        adminUsers.forEach(doc => {
          const data = doc.data();
          if (data.fcmTokens) tokens.push(...data.fcmTokens);
        });
      } else {
        const userDoc = await admin.firestore().collection('users').doc(userId).get();
        const userData = userDoc.data();
        tokens = userData?.fcmTokens || [];
      }

      if (!tokens.length) {
          return res.json({ success: false, message: "No tokens found for target" });
      }

      const message = {
        notification: { title, body },
        data: data || {},
        tokens: tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      res.json({ success: true, response });
    } catch (error: any) {
      console.error("FCM Auto Send Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

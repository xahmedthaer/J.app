import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Firebase Admin if Service Account is available
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("Firebase Admin initialized successfully.");
    } catch (error) {
      console.error("Failed to initialize Firebase Admin:", error);
    }
  } else {
    console.warn("FIREBASE_SERVICE_ACCOUNT is missing. Real push notifications will not be sent.");
  }

  // API Route for Broadcasting Notifications
  app.post('/api/broadcast', async (req, res) => {
    const { title, message } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    if (!admin.apps.length) {
      return res.status(503).json({ 
        error: "Firebase Admin is not configured. Please provide FIREBASE_SERVICE_ACCOUNT in environment variables." 
      });
    }

    try {
      // 1. Get all user tokens from Firestore
      const db = admin.firestore();
      const tokensSnap = await db.collection('fcm_tokens').get();
      
      const allTokens: string[] = [];
      tokensSnap.forEach(doc => {
        const data = doc.data();
        if (data.tokens && Array.isArray(data.tokens)) {
          allTokens.push(...data.tokens);
        }
      });

      if (allTokens.length === 0) {
        return res.json({ success: true, message: "No tokens found to send to." });
      }

      // 2. Send multi-cast message
      const response = await admin.messaging().sendEachForMulticast({
        tokens: allTokens,
        notification: {
          title: title,
          body: message,
        },
        android: {
          priority: 'high',
          notification: {
            icon: 'stock_ticker_update',
            color: '#f97316'
          }
        },
        apns: {
          payload: {
            aps: {
              contentAvailable: true,
            },
          },
        },
      });

      console.log(`Successfully sent ${response.successCount} messages; ${response.failureCount} failed.`);
      
      res.json({ 
        success: true, 
        sentCount: response.successCount, 
        failedCount: response.failureCount 
      });
    } catch (error) {
      console.error("Error broadcasting notification:", error);
      res.status(500).json({ error: "Internal server error" });
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

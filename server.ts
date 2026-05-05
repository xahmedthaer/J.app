import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };
import serviceAccountKey from './firebase-service-account.json' assert { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Explicitly serve public assets (like firebase-messaging-sw.js)
  app.use(express.static(path.join(__dirname, 'public')));

  // Initialize Firebase Admin
  let serviceAccount: any = serviceAccountKey;
  
  if (admin.apps.length === 0) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("Firebase Admin initialized successfully using service account file for project:", serviceAccount.project_id);
    } catch (error) {
      console.error("Failed to initialize Firebase Admin from file:", error);
      serviceAccount = { ...serviceAccount, error: error instanceof Error ? error.message : String(error) };
    }
  }

  // API Route for Broadcasting Notifications
  app.get('/api/admin/firebase-status', (req, res) => {
    res.json({
      initialized: admin.apps.length > 0,
      projectId: serviceAccount && !serviceAccount.error ? serviceAccount.project_id : null,
      configProjectId: firebaseConfig.projectId,
      usingFile: true,
      envVariableExists: !!process.env.FIREBASE_SERVICE_ACCOUNT,
      parseError: serviceAccount?.error || null,
      error: admin.apps.length === 0 ? "Firebase Admin failed to initialize" : null
    });
  });

  app.post('/api/broadcast', async (req, res) => {
    const { title, message } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    if (!admin.apps.length) {
      return res.status(503).json({ 
        error: "Firebase Admin is not configured. Please ensure firebase-service-account.json is correctly set up." 
      });
    }

    try {
      console.log(`Starting broadcast. Title: ${title}, Message: ${message}`);
      
      // 1. Get all user tokens from Firestore
      console.log(`Fetching tokens from Firestore (DB: ${firebaseConfig.firestoreDatabaseId})...`);
      const db = getFirestore(firebaseConfig.firestoreDatabaseId);
      const tokensSnap = await db.collection('fcm_tokens').get();
      
      const allTokens: string[] = [];
      tokensSnap.forEach(doc => {
        const data = doc.data();
        if (data.tokens && Array.isArray(data.tokens)) {
          allTokens.push(...data.tokens);
        }
      });

      console.log(`Found ${allTokens.length} tokens in Firestore.`);

      if (allTokens.length === 0) {
        return res.json({ success: true, message: "No tokens found to send to." });
      }

      // 2. Send multi-cast message
      console.log("Sending multicast message via FCM...");
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

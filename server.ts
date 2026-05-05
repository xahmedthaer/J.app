import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Load configs manually to avoid ESM import issues with JSON and enable dynamic updates
  const rootDir = process.cwd();
  const firebaseConfigPath = path.join(rootDir, 'firebase-applet-config.json');
  const serviceAccountPath = path.join(rootDir, 'firebase-service-account.json');
  
  let firebaseConfig: any = {};
  try {
    if (fs.existsSync(firebaseConfigPath)) {
      firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
    } else {
      console.error("firebase-applet-config.json NOT FOUND at", firebaseConfigPath);
    }
  } catch (err) {
    console.error("Error reading firebase-applet-config.json:", err);
  }

  let serviceAccount: any = null;
  try {
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      console.log("Service account file found and parsed.");
    } else {
      console.warn("firebase-service-account.json NOT FOUND at", serviceAccountPath);
    }
  } catch (err) {
    console.error("Error reading firebase-service-account.json:", err);
    serviceAccount = { error: `Read error: ${err instanceof Error ? err.message : String(err)}` };
  }

  // Explicitly serve public assets (like firebase-messaging-sw.js)
  app.use(express.static(path.join(rootDir, 'public')));

  // Initialize Firebase Admin
  if (serviceAccount && !serviceAccount.error && admin.apps.length === 0) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("Firebase Admin initialized successfully using service account file for project:", serviceAccount.project_id);
    } catch (error) {
      console.error("Failed to initialize Firebase Admin from file:", error);
      serviceAccount = { ...serviceAccount, error: `Init error: ${error instanceof Error ? error.message : String(error)}` };
    }
  } else if (!serviceAccount || serviceAccount.error) {
    // Fallback if file missing or errored
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountEnv && admin.apps.length === 0) {
      try {
        const envAccount = JSON.parse(serviceAccountEnv);
        admin.initializeApp({
          credential: admin.credential.cert(envAccount)
        });
        serviceAccount = envAccount;
        console.log("Firebase Admin initialized via environment variable.");
      } catch (error) {
        console.error("Failed to initialize Firebase Admin via env:", error);
      }
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

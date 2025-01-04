// sync-data.ts
import { Handler } from "@netlify/functions";
import admin from "firebase-admin";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize CORS middleware
const corsHandler = cors({ origin: true });

// Initialize Firebase admin SDK with better error handling
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    throw error;
  }
}

const firestoreDb = admin.firestore();

export const handler: Handler = async (event) => {
  // Log the incoming request
  console.log("Received request:", {
    method: event.httpMethod,
    body: event.body,
    headers: event.headers,
  });

  return new Promise((resolve) => {
    corsHandler(
      { method: event.httpMethod, headers: event.headers },
      {
        statusCode: 200,
        headers: {},
        setHeader(key: string, value: string) {
          this.headers[key] = value;
        },
        end(message: string) {
          resolve({
            statusCode: this.statusCode,
            headers: this.headers,
            body: message,
          });
        },
      },
      async () => {
        try {
          if (!event.body) {
            throw new Error("Missing request body");
          }

          const { groupId, expenseName } = JSON.parse(event.body);

          if (!groupId || !expenseName) {
            throw new Error(
              `Invalid parameters: groupId=${groupId}, expenseName=${expenseName}`,
            );
          }

          console.log(
            `Fetching data for group: ${groupId}, expense: ${expenseName}`,
          );

          const docRef = firestoreDb
            .collection("groups")
            .doc(groupId)
            .collection("expenses")
            .doc(expenseName);

          const documentSnapshot = await docRef.get();

          if (!documentSnapshot.exists) {
            console.log("Document does not exist");
            return resolve({
              statusCode: 404,
              body: JSON.stringify({
                error: "No such document",
                expenses: [],
              }),
            });
          }

          console.log("Document data:", documentSnapshot.data());

          return resolve({
            statusCode: 200,
            body: JSON.stringify({
              expenses: documentSnapshot.data()?.expenses || [],
            }),
          });
        } catch (error) {
          console.error("Error in sync-data function:", error);
          return resolve({
            statusCode: 500,
            body: JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown error",
              stack: error instanceof Error ? error.stack : undefined,
            }),
          });
        }
      },
    );
  });
};

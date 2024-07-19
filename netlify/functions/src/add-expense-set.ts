import { Handler, HandlerEvent, HandlerResponse } from "@netlify/functions";
import admin from "firebase-admin";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize CORS middleware
const corsHandler = cors({ origin: true });

// Initialize Firebase admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}
const firestoreDb = admin.firestore();

const addExpenseSetHandler: Handler = async (
  event: HandlerEvent,
): Promise<HandlerResponse> => {
  return new Promise((resolve) => {
    const mockRequest = {
      method: event.httpMethod,
      headers: event.headers as Record<string, string>,
    };

    const mockResponse = {
      statusCode: 200,
      headers: {} as Record<string, string>,
      setHeader(key: string, value: string) {
        this.headers[key] = value;
      },
      end(message?: string) {
        resolve({
          statusCode: this.statusCode,
          headers: this.headers,
          body: message || "",
        });
      },
    };

    corsHandler(mockRequest, mockResponse, async () => {
      const { groupId, expenseName } = JSON.parse(event.body || "{}");

      if (!groupId || !expenseName) {
        mockResponse.statusCode = 400;
        mockResponse.end(JSON.stringify({ error: "Missing required fields" }));
        return;
      }

      try {
        await firestoreDb
          .collection("groups")
          .doc(groupId)
          .collection("expenses")
          .doc(expenseName)
          .set({});

        mockResponse.statusCode = 200;
        mockResponse.end(
          JSON.stringify({ message: "Expense set added successfully!" }),
        );
      } catch (error) {
        console.error("Error adding expense set:", error);
        mockResponse.statusCode = 500;
        mockResponse.end(JSON.stringify({ error: (error as Error).message }));
      }
    });
  });
};

export { addExpenseSetHandler as handler };

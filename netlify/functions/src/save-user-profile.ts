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

const saveUserProfileHandler: Handler = async (
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
      const { userId, formData } = JSON.parse(event.body || "{}");

      if (!userId || !formData) {
        mockResponse.statusCode = 400;
        mockResponse.end(JSON.stringify({ error: "Missing required fields" }));
        return;
      }

      try {
        await firestoreDb
          .collection("users")
          .doc(userId)
          .set(formData, { merge: true });

        mockResponse.statusCode = 200;
        mockResponse.end(
          JSON.stringify({ message: "User profile saved successfully!" }),
        );
      } catch (error) {
        console.error("Error saving user profile:", error);
        mockResponse.statusCode = 500;
        mockResponse.end(JSON.stringify({ error: (error as Error).message }));
      }
    });
  });
};

export { saveUserProfileHandler as handler };

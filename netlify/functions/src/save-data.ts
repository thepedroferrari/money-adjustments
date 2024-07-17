// save-data.ts
import { Handler, HandlerEvent, HandlerResponse } from "@netlify/functions";
import admin from "firebase-admin";
import cors, { CorsRequest } from "cors";
import dotenv from "dotenv";
import { IncomingHttpHeaders } from "http";

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

type Expense = {
  date: string;
  where: string;
  owner: string;
  price: number;
};

type SaveDataRequest = {
  groupId: string;
  expenseName: string;
  data: Expense[];
};

const saveDataHandler: Handler = async (
  event: HandlerEvent,
): Promise<HandlerResponse> => {
  return new Promise((resolve) => {
    const mockRequest: CorsRequest = {
      method: event.httpMethod,
      headers: event.headers as IncomingHttpHeaders,
    };

    const headers: Record<string, string> = {};

    const mockResponse = {
      statusCode: 200,
      setHeader: (key: string, value: string) => {
        headers[key] = value;
      },
      getHeader: (key: string) => headers[key],
      end: (message?: string) => {
        resolve({
          statusCode: 200,
          body: message || "",
        });
      },
    };

    corsHandler(mockRequest, mockResponse, async () => {
      const { groupId, expenseName, data } = JSON.parse(
        event.body || "{}",
      ) satisfies SaveDataRequest;
      try {
        console.log(
          `Saving data for group: ${groupId}, expense: ${expenseName}`,
          data,
        );
        await firestoreDb
          .collection("groups")
          .doc(groupId)
          .collection("expenses")
          .doc(expenseName)
          .set({ expenses: data });
        resolve({
          statusCode: 200,
          body: JSON.stringify({ message: "Data saved successfully!" }),
        });
      } catch (error) {
        console.error("Error saving data:", error);
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: (error as Error).message }),
        });
      }
    });
  });
};

export { saveDataHandler as handler };

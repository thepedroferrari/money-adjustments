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
const saveDataHandler = async (event) => {
    return new Promise((resolve) => {
        const mockRequest = {
            method: event.httpMethod,
            headers: event.headers,
        };
        const headers = {};
        const mockResponse = {
            statusCode: 200,
            setHeader: (key, value) => {
                headers[key] = value;
            },
            getHeader: (key) => headers[key],
            end: (message) => {
                resolve({
                    statusCode: 200,
                    body: message || "",
                });
            },
        };
        corsHandler(mockRequest, mockResponse, async () => {
            const { groupId, expenseName, data } = JSON.parse(event.body || "{}");
            try {
                console.log(`Saving data for group: ${groupId}, expense: ${expenseName}`, data);
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
            }
            catch (error) {
                console.error("Error saving data:", error);
                resolve({
                    statusCode: 500,
                    body: JSON.stringify({ error: error.message }),
                });
            }
        });
    });
};
export { saveDataHandler as handler };
//# sourceMappingURL=save-data.js.map
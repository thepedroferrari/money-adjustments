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
const syncDataHandler = async (event) => {
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
            const { groupId, expenseName } = JSON.parse(event.body || "{}");
            try {
                console.log(`Fetching data for group: ${groupId}, expense: ${expenseName}`);
                const docRef = firestoreDb
                    .collection("groups")
                    .doc(groupId)
                    .collection("expenses")
                    .doc(expenseName);
                const documentSnapshot = await docRef.get();
                if (!documentSnapshot.exists) {
                    resolve({
                        statusCode: 404,
                        body: JSON.stringify({ message: "No such document!" }),
                    });
                }
                else {
                    resolve({
                        statusCode: 200,
                        body: JSON.stringify(documentSnapshot.data()),
                    });
                }
            }
            catch (error) {
                console.error("Error fetching data:", error);
                resolve({
                    statusCode: 500,
                    body: JSON.stringify({ error: error.message }),
                });
            }
        });
    });
};
export { syncDataHandler as handler };
//# sourceMappingURL=sync-data.js.map
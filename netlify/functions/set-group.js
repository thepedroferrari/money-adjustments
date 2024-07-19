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
const setGroupHandler = async (event) => {
    return new Promise((resolve) => {
        const mockRequest = {
            method: event.httpMethod,
            headers: event.headers,
        };
        const mockResponse = {
            statusCode: 200,
            headers: {},
            setHeader(key, value) {
                this.headers[key] = value;
            },
            end(message) {
                resolve({
                    statusCode: this.statusCode,
                    headers: this.headers,
                    body: message || "",
                });
            },
        };
        corsHandler(mockRequest, mockResponse, async () => {
            const { groupId, userId } = JSON.parse(event.body || "{}");
            if (!groupId || !userId) {
                mockResponse.statusCode = 400;
                mockResponse.end(JSON.stringify({ error: "Missing required fields" }));
                return;
            }
            try {
                const groupRef = firestoreDb.collection("groups").doc(groupId);
                const groupDoc = await groupRef.get();
                if (!groupDoc.exists) {
                    await groupRef.set({
                        group_name: groupId,
                        members: [userId],
                    });
                    // Create the expenses sub-collection
                    const expensesRef = firestoreDb
                        .collection(`groups/${groupId}/expenses`)
                        .doc("init");
                    await expensesRef.set({});
                }
                else {
                    await groupRef.update({
                        members: admin.firestore.FieldValue.arrayUnion(userId),
                    });
                }
                // Add the group to the user's groups array
                await firestoreDb
                    .collection("users")
                    .doc(userId)
                    .update({
                    groups: admin.firestore.FieldValue.arrayUnion(groupId),
                });
                mockResponse.statusCode = 200;
                mockResponse.end(JSON.stringify({ message: "Group set successfully!" }));
            }
            catch (error) {
                console.error("Error setting group:", error);
                mockResponse.statusCode = 500;
                mockResponse.end(JSON.stringify({ error: error.message }));
            }
        });
    });
};
export { setGroupHandler as handler };
//# sourceMappingURL=set-group.js.map
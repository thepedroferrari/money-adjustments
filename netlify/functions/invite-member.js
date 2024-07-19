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
const inviteMemberHandler = async (event) => {
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
            const { groupId, email, invitedBy } = JSON.parse(event.body || "{}");
            if (!groupId || !email || !invitedBy) {
                mockResponse.statusCode = 400;
                mockResponse.end(JSON.stringify({ error: "Missing required fields" }));
                return;
            }
            try {
                await firestoreDb
                    .collection("invitations")
                    .doc(`${groupId}_${email}`)
                    .set({
                    groupId,
                    invitedBy,
                    email,
                    status: "pending",
                });
                mockResponse.statusCode = 200;
                mockResponse.end(JSON.stringify({ message: "Invitation sent successfully!" }));
            }
            catch (error) {
                console.error("Error inviting member:", error);
                mockResponse.statusCode = 500;
                mockResponse.end(JSON.stringify({ error: error.message }));
            }
        });
    });
};
export { inviteMemberHandler as handler };
//# sourceMappingURL=invite-member.js.map
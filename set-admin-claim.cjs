/*
  Run locally ONLY after downloading a Firebase Admin SDK service-account JSON.
  Never upload/share that JSON or commit it to Git.
*/
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

(async () => {
  const email = "pranshubatham0@gmail.com";
  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { admin: true });
  console.log(`Admin claim enabled for ${email}. Sign out and sign in again.`);
  process.exit(0);
})().catch(error => { console.error(error); process.exit(1); });

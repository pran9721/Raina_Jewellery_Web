# RAINA JEWELLERY Authentication Fix

The uploaded `login.js` was FRONTEND DEMO ONLY. It only validated form values and displayed:
"Signup details validated! Connect a secure backend..."
It did not call Firebase, create users, send verification emails, or sign users in. That is why no verification email was sent.

## Install
1. Back up your current `login.html` and `login.js`.
2. Replace them with the files in this ZIP.
3. Keep your existing `login.css` file; it is not included because the visual design can remain unchanged.
4. Run through the same Live Server origin (for example http://127.0.0.1:5500), not file://.

## Firebase Console checks
1. Authentication -> Sign-in method -> Email/Password: enable it.
2. Authentication -> Settings -> Authorized domains: add `localhost` and/or `127.0.0.1` depending on the URL used by Live Server. Add your production domain before deployment.
3. Authentication -> Templates -> Email address verification: ensure the template is enabled and sender/template settings are valid.
4. Test with a new email address. If the account already exists, use Login; the login handler will send a fresh verification link for an unverified account.
5. Check Inbox, Spam/Junk, and Promotions. Firebase may throttle repeated verification email sends.

## Firestore
The script attempts to save a profile to `users/{uid}`. If Firestore rules deny this, the auth account and verification email can still be created. Merge a safe rule for a user's own profile:
match /users/{uid} {
  allow create, read, update: if request.auth != null && request.auth.uid == uid;
}
Do not replace all your existing rules without reviewing them.

## Important
- Never put passwords in client-side JavaScript.
- The admin route requires a Firebase custom claim `admin: true`; a matching email alone does not grant admin privileges.
- If verification mail still fails, open browser DevTools -> Console and share the exact Firebase error code (do not share passwords or verification links).


## Google sign-in
Google sign-in buttons are included on both Login and Sign Up tabs. A first-time Google user is automatically created in Firebase Authentication; a returning user is signed in. Google accounts are verified by Google, so the email-verification step used for email/password accounts is not required.

In Firebase Console:
1. Authentication -> Sign-in method -> Google: enable it and choose a support email.
2. Authentication -> Settings -> Authorized domains: add `localhost` or `127.0.0.1` as used by your Live Server URL, plus your production domain.
3. Ensure the OAuth consent / support email configuration is complete. If using a custom domain, configure the authorized redirect domain as shown by Firebase.
4. Test both Login and Sign Up Google buttons in a browser that allows popups.

The profile document is written to `users/{uid}` on a best-effort basis. If Firestore rules reject it, Google Authentication can still succeed; review the console error and rules.

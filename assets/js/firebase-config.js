/* ============================================================================
   firebase-config.js — YOUR Firebase project credentials (EDIT THIS FILE)
   ----------------------------------------------------------------------------
   1. Go to https://console.firebase.google.com  ->  create a project.
   2. Build -> Firestore Database -> Create (start in *production mode*).
   3. Build -> Authentication -> Sign-in method -> enable *Email/Password*,
      then Users -> Add user (this is your admin login for admin.html).
   4. Project settings (gear) -> Your apps -> Web app  (</>)  -> register,
      then copy the `firebaseConfig` values into the object below.
   5. Firestore -> Rules -> paste the rules from FIREBASE_SETUP.md and Publish.

   Until apiKey + projectId are filled in, the site simply uses localStorage
   (exactly like before) — nothing breaks. Once filled in, the admin panel
   reads/writes Firestore and every visitor sees your latest catalogue live.
   ========================================================================== */

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyCrmlNhqMo2INJIJ9cqiDTDawrec-DVpiU",
  authDomain: "sasfood-1088f.firebaseapp.com",
  projectId: "sasfood-1088f",
  storageBucket: "sasfood-1088f.firebasestorage.app",
  messagingSenderId: "437943425629",
  appId: "1:437943425629:web:ac8c6fc16606f33e7d8bb4",
};

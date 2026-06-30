# Firebase setup — make admin edits live for everyone

The site now has an **optional** Firebase Firestore backend wired in. Until you
add credentials it keeps working exactly as before (localStorage + export-to-
GitHub). Once you complete the steps below, the admin panel reads & writes the
**cloud**, and every visitor instantly sees your latest catalogue — no more
"Export catalogue → commit to GitHub" step.

## How it works (architecture)

- `assets/js/firebase-config.js` — **you paste your project keys here.**
- `assets/js/firebase.js` — defines `window.SASCloud`:
  - `pull()` — public pages load published docs from Firestore into the local
    cache, then the site renders from it.
  - `mirror()` — every admin save/delete in `store.js` is pushed up to Firestore.
  - `signIn()/onAuth()` — admin login uses Firebase Auth.
  - `publishAll()` — first admin login pushes your existing catalogue to the cloud.
- `store.js` keeps its same API; it just mirrors each write to Firestore.

Collections used: `products`, `categories`, `countries`, `ads`, `inquiries`,
and `settings` (a single doc with id `site`).

## One-time setup (~15 minutes)

1. **Create a project** — <https://console.firebase.google.com> → *Add project*
   (e.g. `sas-food`). Google Analytics is optional.

2. **Firestore Database** — left menu → *Build → Firestore Database* →
   *Create database* → **Production mode** → pick a location (e.g.
   `eur3` or `asia-south1`) → Enable.

3. **Authentication** — *Build → Authentication* → *Get started* →
   *Sign-in method* → enable **Email/Password** → Save.
   Then *Users* tab → *Add user* → enter the email + password you'll use to log
   into `admin.html`. (This replaces the old demo password.)

4. **Register a web app & copy keys** — gear icon *Project settings* →
   *Your apps* → click the **`</>`** (Web) icon → give it a nickname → *Register*.
   Copy the values from the shown `firebaseConfig` into
   `assets/js/firebase-config.js`:

   ```js
   window.FIREBASE_CONFIG = {
     apiKey: "AIza…",
     authDomain: "sas-food.firebaseapp.com",
     projectId: "sas-food",
     storageBucket: "sas-food.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abc123",
   };
   ```

5. **Security rules** — Firestore → *Rules* tab → replace with the rules below →
   *Publish*. (Public can READ the catalogue; only your logged-in admin can
   WRITE. Inquiries can be CREATED by anyone — the contact form — but only read
   by the admin.)

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /products/{id}   { allow read: if true;  allow write: if request.auth != null; }
       match /categories/{id} { allow read: if true;  allow write: if request.auth != null; }
       match /countries/{id}  { allow read: if true;  allow write: if request.auth != null; }
       match /ads/{id}        { allow read: if true;  allow write: if request.auth != null; }
       match /settings/{id}   { allow read: if true;  allow write: if request.auth != null; }
       match /inquiries/{id}  {
         allow create: if true;                 // contact form (anonymous)
         allow read, update, delete: if request.auth != null;  // admin only
       }
     }
   }
   ```

6. **Authorize your domain** — Authentication → *Settings → Authorized domains* →
   add your live domain (e.g. `imran-me.github.io` and/or `saraalsalam.com`).
   `localhost` is already allowed for local testing.

## First run

1. Open `admin.html` and log in with the email/password from step 3.
2. On this **first** login the panel detects the cloud is empty and uploads your
   current catalogue (you'll see "Published your catalogue to Firebase"). Check
   Firestore → *Data* to confirm the `products` collection appeared.
3. Edit a product and Save → it writes to Firestore.
4. Open the public site (even in another browser / phone) → the change is there.

## Notes & costs

- **Free tier (Spark plan)** is generous (50k reads/day, 20k writes/day) — far
  more than this site needs.
- You can keep using **Google Drive links** for product photos (already
  supported) so you don't need Firebase Storage. If you'd rather upload images
  directly to Firebase Storage later, we can add that.
- The old **"⤓ Export catalogue"** button still works as a backup/offline path.
- To go back to localStorage-only, just blank out `apiKey` in
  `firebase-config.js`.

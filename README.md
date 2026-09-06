# Mandarmani Vacation Qualifier

Family registration page for the Oct 4–6 trip, with an admin panel.

## Files
- `index.html` — public registration form
- `admin.html` — admin panel (sign in, view/edit/delete, recycle bin, CSV export)
- `css/style.css` — shared styles
- `css/admin.css` — admin-only styles
- `js/firebase-config.js` — **your Firebase credentials go here**
- `js/register.js` — registration form logic
- `js/admin.js` — admin panel logic
- `firestore.rules` — security rules to paste into Firebase Console

## Setup (one time)

1. **Create a Firebase project**
   Go to [console.firebase.google.com](https://console.firebase.google.com) → Add project → give it a name (e.g. `mandarmani-vacation`).

2. **Add a Web App** inside that project (</> icon) and copy the config object it gives you.
   Paste those values into `js/firebase-config.js`, replacing the `PASTE_...` placeholders.

3. **Enable Firestore**
   Build → Firestore Database → Create database → start in production mode.
   Then go to the Rules tab and paste in the contents of `firestore.rules`, then Publish.

4. **Enable Authentication**
   Build → Authentication → Sign-in method → enable **Email/Password**.
   Then go to the Users tab → Add user → create your senior's login (email + password).
   That's the only login the admin panel needs — there's no self-signup.

5. **Deploy**
   Upload this whole folder to Netlify (drag-and-drop) or GitHub Pages, same as your other apps.
   `index.html` is the page you share with families; `admin.html` is the one only your senior uses.

## Notes
- Each family submits once, as one entry containing all its members.
- Married couples are entered as one block (husband + wife + phone) and are automatically counted as 2 adults — no age is asked for them.
- Unmarried members are entered individually with name, age, and phone, and are auto-categorized as Infant (below 6), Child (6–12), or Adult (above 12).
- Deleting a family in the admin panel moves it to the recycle bin, where it can be restored or permanently deleted (individually or all at once).

# Lutz Country Store and Cafe (redesign demo)

Static HTML/CSS/JS. Run `python3 -m http.server` in this folder and open `localhost:8000`.

- `index.html` home, `menu.html` order pickup, `checkout.html` demo checkout, `visit.html` hours and contact, `admin.html` owner admin (footer "Admin" link).
- Menu, prices and hours were copied from the public Toast ordering page. Items and add-on groups flagged "Confirm prices" in the admin were estimated and need the owner's check (sizes for lattes/tea, milk and flavor upcharges, bread swaps, extra egg, cheese, cafe con leche, chai).
- Add-ons: every item can have several option groups (pick one or pick several, required or optional, with per-choice upcharges). Edit them in Admin > Menu > Edit.
- **Everything is saved in the browser (localStorage).** Edits and orders only show on the browser where they were made. The admin password is stored as a salted hash (PBKDF2). Change it under Settings. It only guards the screen in this browser; real protection needs a server.
- Real online ordering needs a backend, payments and a kitchen display or printer. Checkout accepts only test card 4242 4242 4242 4242, or "pay at pickup".
- The contact form needs a Formspree URL in `ENDPOINTS` at the bottom of `js/main.js`.

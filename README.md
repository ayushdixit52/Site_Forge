# SiteForge AI Website Builder

SiteForge is a React + Express website builder. It has a searchable gallery of industry website designs, an interactive multi-page preview, AI-assisted content generation through a server-side Gemini API, and a private platform administration area.

## Requirements

- Node.js 20 or newer
- npm
- MongoDB for accounts, saved templates, and project persistence

## Local setup

1. Start a local MongoDB service, or create a MongoDB Atlas database.
2. In Terminal, open the SiteForge project folder and run:

   ```sh
   cp server/.env.example server/.env
   ```

3. Edit `server/.env`. Set `MONGO_URI` and replace `JWT_SECRET` and the initial `ADMIN_PASSWORD` with private values. Add `GEMINI_API_KEY` to enable real AI generation. Keep all secrets in this server file; never add them to the React app.
4. Install project dependencies if needed:

   ```sh
   npm install --prefix server
   npm install --prefix client
   ```

5. Start both API and React app with one command from the project root:

   ```sh
   npm start
   ```

6. Open [http://localhost:3000](http://localhost:3000). The API health endpoint is [http://localhost:5001/api/health](http://localhost:5001/api/health).

On its first successful MongoDB connection, SiteForge seeds the built-in templates and creates the administrator account using `ADMIN_USERNAME` and `ADMIN_PASSWORD`. The password is stored as a bcrypt hash. There is no public admin registration. Open **Admin** in the top bar to sign in and manage template visibility and details.

Inside a website preview, the **Admin** page is for that site's owner: sign in to your SiteForge account first, then manage the preview's UPI ID and products. Changes are saved with the website project. The separate top-bar **Admin** area is for platform-level template controls.

## AI generation

AI requests are sent by Express to Gemini using `GEMINI_API_KEY` and `GEMINI_MODEL`. The key is never sent to the client. The API requires a valid server key; without one, SiteForge still previews the selected template and displays the configuration requirement instead of claiming an AI response was generated. The server limits requests and validates the returned website content before using it. Generated content is treated as data; the app does not execute AI-generated server code.

## Run checks

```sh
npm run build --prefix client
npm test --prefix client -- --watchAll=false
```

## Exported websites

Use **Export Tailored Code (.ZIP)** in the website preview. Each archive contains the selected site's source, an `.env.example`, and a `README.md` with exact install, configuration, and run commands. A generated storefront's order confirmation email requires valid SMTP credentials; a UPI QR alone does not verify that the payment settled.

## Deployment notes

Deploy the React client and Express API over HTTPS. Configure `MONGO_URI`, `JWT_SECRET`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` in the hosting provider. Set `FRONTEND_URL` to the deployed client origin. Configure `GEMINI_API_KEY` only when AI generation is enabled. Configure SMTP variables for order emails. Set up database backups, rate limiting at the edge, and object storage for product uploads before accepting production traffic.

## Current boundaries

- The built-in gallery starts with 13 category templates. Template records and publication status are stored in MongoDB; template configurations are used as preview inputs.
- The in-editor storefront is a working design preview. The exported storefront has its own product/order server and private store admin setup.
- UPI QR generation opens a payment intent in a compatible UPI app, but payment settlement needs a verified provider webhook to be confirmed automatically.
# Site_Forge

# Valentino Business Technology

Responsive website and Express backend for Valentino Business Technology in Nairobi, Kenya.

## Project files

The frontend is first because it is the customer-facing website. The backend serves it and handles contact messages and admin access.

```text
frontend/
	index.html       Main website entry point (start here)
	styles.css       Responsive website styles
	app.js           Mobile navigation and contact form
	admin.html       Protected enquiry inbox page
	admin.css        Enquiry inbox styles
	admin.js         Enquiry inbox behavior
backend/
	package.json     Express dependencies and run scripts
	server.js        Website server, contact API and admin API
	.env.example     Admin settings template
```

## Run locally

Requirements: Node.js 20 or newer and npm.

1. Open a terminal in the project folder.
2. Install the backend packages:

	```sh
	cd backend
	npm install
	```

3. Create a local environment file and set a private admin password:

	```sh
	cp .env.example .env
	```

4. Edit `backend/.env` and replace the example `ADMIN_PASSWORD` value.
5. Start the website and API:

	```sh
	npm start
	```

6. Visit `http://localhost:3000`. The admin inbox is at `http://localhost:3000/admin` and uses the username and password from `backend/.env`.

Run the development server with automatic restarts using `npm run dev` from the `backend` folder.

## Website details

- Services: web development, IT support, computer sales and repair, networking and Wi-Fi, graphic design, and CCTV installation.
- Products: laptops, phones, routers, and other technology products.
- Customers: churches, schools, shops, and restaurants.
- Contact: 0714 775 636, Nairobi, Kenya.
- Prices shown: websites KSh 15,000–50,000; website maintenance KSh 2,000–3,000 per month; computer repair from KSh 4,000. The final repair price depends on the issue and parts required.
- Contact form messages are saved to `backend/data/messages.json` and can be viewed or deleted in the admin inbox.

## Before deploying

The local JSON message file is suitable for a small local demo. For a live business website, use a managed database with backups, deploy behind HTTPS, and set a strong `ADMIN_PASSWORD` in the hosting provider's environment settings. Never commit credentials or real customer messages.
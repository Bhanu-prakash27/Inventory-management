Mini Project - Inventory Management System
installation
***git clone link
npm intall dotenv express cors bcrypt mongoose
run node server.js***

This is a mini project developed using Node.js and HTML/CSS/JavaScript for managing inventory, authentication, and related operations.

📌 Project Overview

The project provides a simple Inventory Management System (IMS) with authentication. Users can log in, manage stock, and interact with the system via a web interface.

🚀 Features

User authentication (login system)

Manage inventory items (add/update/delete)

Store and fetch data from database

Basic UI with HTML/CSS/JavaScript

Environment variables support for secure configuration

🛠️ Tech Stack

Frontend: HTML, CSS, JavaScript

Backend: Node.js

Database: (Configured via db.js, e.g., MySQL or MongoDB)

Authentication: Custom auth via auth.js

⚙️ Project Structure
currentmp/
  ├── .env              # Environment variables (DB connection, secrets)
  ├── app.js            # Main application logic
  ├── auth.js           # Authentication logic
  ├── db.js             # Database connection setup
  ├── server.js         # Entry point for Node.js server
  ├── login.html        # Login page
  ├── dup.html          # Dashboard / main UI
  ├── login.css         # Styles for login page
  ├── dup.css           # Styles for main UI
  ├── script.js         # Client-side JavaScript
  └── download.png      # Logo / image asset
🔑 Environment Variables

Create a .env file in the currentmp/ directory:

PORT=5000
DB_URL=your_database_url
SECRET_KEY=your_secret_key
⚡ Installation & Setup

Clone the repository

git clone <repo-url>
cd currentmp

Install dependencies

npm install

Setup environment variables

Create .env file as shown above.

Start the server

node server.js

Access the app

Open browser and go to http://localhost:5000

📡 API Endpoints (Example)

POST /login → Authenticate user

GET /inventory → Fetch inventory list

POST /inventory → Add new item

PUT /inventory/:id → Update item

DELETE /inventory/:id → Delete item

📦 Deployment

Deploy backend to Heroku / Render / Railway

Database can be hosted on MongoDB Atlas / MySQL RDS

Static frontend can be served via Node.js or uploaded to Netlify/Vercel

👨‍💻 Authors

Developed by Panniru Bhanu prakash as part of a mini project.

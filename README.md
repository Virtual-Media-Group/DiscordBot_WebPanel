# DiscordBot WebPanel

Welcome to the **DiscordBot WebPanel**! This is a comprehensive, self-hosted web panel designed for developers and administrators to manage, host, and monitor Discord bots with ease. 

---

## 🌟 Features

- **Discord OAuth Authentication**: Secure login using Discord. Only authorized users and administrators can access the panel.
- **Bot Management**: Easily add, start, stop, and configure multiple Discord bots directly from the web interface.
- **Docker Integration**: Each bot is seamlessly containerized and managed via Docker, ensuring isolated, safe, and easily reproducible environments.
- **Built-in Update Checker**: Automatically checks this GitHub repository for the latest tagged releases. If an update is available, administrators will be notified directly inside the dashboard.
- **Admin Dashboard**: A clean, modern UI to manage users, view system health, and quickly access logs for your deployed bots.
- **Database Driven**: Uses Prisma with PostgreSQL for robust, fast, and scalable data storage.

---

## 🛠️ Architecture

The project is split into two main components:

1. **Frontend (`/frontend`)**
   - Built with Next.js (App Router) and React.
   - Provides a responsive, fast, and user-friendly dashboard.
   - Uses Tailwind CSS / Custom CSS for styling.

2. **Backend (`/backend`)**
   - Built with Node.js and Express.
   - Uses Prisma ORM to interact with the PostgreSQL database.
   - Utilizes Dockerode to spin up, manage, and monitor the Docker containers that host your bots.
   - Uses BullMQ and Redis for robust background job processing (e.g., handling bot deployments asynchronously).

---

## 🚀 How to Setup and Deploy

The easiest way to host this application is using **Docker Compose** or via a container management platform like **Portainer**.

### Prerequisites
- Docker & Docker Compose installed on your server.
- A Discord Application for OAuth2 Login (Create one at the [Discord Developer Portal](https://discord.com/developers/applications)).
- Git installed (if you are cloning directly).

### Method 1: Using Portainer (Recommended for ease of use)
1. Open Portainer and go to **Stacks** -> **Add stack**.
2. Name your stack (e.g., `discord-web-panel`).
3. Under **Build method**, select **Repository**.
4. Set the **Repository URL** to `https://github.com/Virtual-Media-Group/DiscordBot_WebPanel.git`.
5. Specify the branch as `main` and the compose path as `docker-compose.yml`.
6. Add your environment variables (see *Environment Variables* below).
7. Click **Deploy the stack**. 

### Method 2: Manual Docker Compose
1. Clone this repository to your server:
   ```bash
   git clone https://github.com/Virtual-Media-Group/DiscordBot_WebPanel.git
   cd DiscordBot_WebPanel
   ```
2. Copy the example `.env` file in the backend folder and fill in your details:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Run Docker Compose to build and start the containers:
   ```bash
   docker-compose up -d --build
   ```
4. Access the panel in your browser (default: `http://localhost:3000`).

---

## ⚙️ Environment Variables
In order for the application to function, you need to configure the following environment variables (which can be set in Portainer or via the `.env` file):

- `DATABASE_URL`: Connection string for PostgreSQL.
- `REDIS_HOST`: Hostname of your Redis instance.
- `JWT_SECRET`: A secure, random string for signing cookies/tokens.
- `FRONTEND_URL`: The public URL where your panel will be accessed (e.g., `https://panel.yourdomain.com`).
- `DISCORD_CLIENT_ID`: Your Discord OAuth2 Client ID.
- `DISCORD_CLIENT_SECRET`: Your Discord OAuth2 Client Secret.
- `DISCORD_CALLBACK_URL`: Must match your backend URL ending in `/api/auth/discord/callback`.
- `SUPERADMIN_DISCORD_ID`: The Discord User ID of the owner/main admin.
- `GITHUB_REPO_URL`: The URL of this repository (`https://github.com/Virtual-Media-Group/DiscordBot_WebPanel`) so the panel can check for updates.

---

## 🔄 Updating the Panel
When a new release is available, the panel's built-in update checker will notify you. 
If you are using Portainer, simply go to your Stack, click **Pull and redeploy**, and Portainer will automatically grab the latest code from GitHub and restart your panel!

# Balance manager
This is a balance manager application that allows users to track their income and expenses. It provides a user-friendly interface to add, view, and manage financial transactions with synchronization capabilities between devices.
---
# Table of Contents
- [Balance manager](#balance-manager)
<!-- ] -->
- [Table of Contents](#table-of-contents)
- [Installation](#installation)
---
# Installation
pre-requisites:
- Node.js (version 24 or higher)
- npm (Node Package Manager)
- PostgreSQL (version 15 or higher)

## Running with Docker (for Frontend/Flutter Integration)

You can spin up the entire backend server along with a PostgreSQL 18 database using Docker Compose. This automatically runs database migrations and seeds base currencies so that you can immediately start testing frontend API requests.

### 1. Set Up Environment Variables
Before launching Docker, create a `.env` file in the root of the project. You can copy the template from `.env.example`:

```bash
cp .env.example .env
```

Open the newly created `.env` file and verify or populate the variables (such as Google OAuth keys, or mailer credentials if testing registration verification).

### 2. Start the Backend
Build the image and launch the containers (backend server & database cluster):

```bash
docker compose up --build
```

If you prefer to run the containers in the background (detached mode):

```bash
docker compose up -d
```

### 3. Port Mappings
- **Backend API Server**: accessible at `http://localhost:3000` (API endpoint path `/api/v1/*`).
- **PostgreSQL Database**: mapped to host port **`5431`** (e.g. `localhost:5431`) to prevent conflicts with any local PostgreSQL instance you might have running on default port `5432`.
- **Swagger Documentation**: interactive Swagger API docs are available at `http://localhost:3000/api/v1/docs/` to explore and try out endpoint payloads directly in your browser.

To install the Balance Manager application, follow these steps:
1. Clone the repository:
   ```bash
   git clone https://github.com/OmarElprolosy66/balance-manager.git
   ```
2. Navigate to the project directory:
   ```bash
   cd balance-manager-api
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```
4. Start the application:
   ```bash
   npm start
   ```

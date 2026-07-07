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

To run with docker:
- build the docker image and start the application using Docker Compose (builds the image if it doesn't exist):
```bash
docker compose up --build
```
- run the application in detached mode:
```bash
docker compose up -d
```

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

# StraySense

**Project**: StraySense

A comprehensive web application dedicated to improving the lives of stray animals by connecting volunteers, shelters, and donation channels in a single platform.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Branch: `tuaha-new`](#branch-tuaha-new)
4. [Prerequisites](#prerequisites)
5. [Installation & Setup](#installation--setup)
6. [Database Configuration](#database-configuration)
7. [Backend Configuration](#backend-configuration)
8. [Running the Application](#running-the-application)
9. [Project Structure](#project-structure)
10. [Technologies](#technologies)
11. [Contributing](#contributing)
12. [License](#license)

---

## Overview

StraySense is a full-stack solution designed to streamline efforts in stray animal rescue, fostering collaboration among volunteers, shelters, and donors. The platform offers:

* User registration and authentication
* Shelter management dashboard
* Volunteer assignment and tracking
* Donation processing and reporting
* Real-time updates on stray sightings and rescues

## Features

* **Authentication & Authorization**: Secure user login and role-based access control using JWT.
* **Shelter Dashboard**: Manage animal profiles, occupancy, and resource allocation.
* **Volunteer Coordination**: Assign, track, and communicate with volunteers in the field.
* **Donation Management**: Integrated donation gateway with detailed reporting.
* **Real-Time Updates**: WebSocket support for instant notifications on new sightings.

## Branch: `tuaha-new`

All the latest development work is maintained in the `tuaha-new` branch. Ensure you check out this branch before running or contributing to the project.

```bash
git checkout tuaha-new
```

## Prerequisites

* **Node.js** (>= v14.x)
* **npm** (>= v6.x)
* **MySQL** (>= 8.0)
* **VS Code** or your preferred IDE

## Installation & Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/TUAHASHAIKH/StraySense.git
   cd StraySense
   git checkout tuaha-new
   ```

2. **Download & Extract**

   Alternatively, download the zip file from GitHub, extract it, and navigate into the project directory.

## Database Configuration

1. Navigate to the `Database/` folder.
2. Open **MySQL Workbench** (or your preferred MySQL client).
3. Run the script `StraySense.sql` to create the database schema and seed data.

## Backend Configuration

1. Open the file `Backend/merged-server.js`.

2. Update the database connection details:

   ```js
   const DB_URI = 'mongodb://localhost:27017/straysense'; // or your URI
   const DB_USER = 'your_username';
   const DB_PASS = 'your_password';
   ```

3. Ensure you have a `.env` file (create one in `Backend/` if missing) with the following variables:

   ```env
   PORT=5000
   JWT_SECRET=YourStrongSecretKey
   MONGODB_URI=mongodb://localhost:27017/straysense
   ```

## Running the Application

### Frontend

1. Open a terminal and navigate to the `Frontend/` folder:

   ```bash
   cd Frontend
   ```

2. Install dependencies and start the dev server:

   ```bash
   npm install
   npm start
   ```

3. The frontend should launch at `http://localhost:3000`.

### Backend

1. Open a separate terminal and navigate to the `Backend/` folder:

   ```bash
   cd Backend
   ```

2. Initialize npm (if not already initialized) and install dependencies:

   ```bash
   npm init -y
   npm install express bcryptjs jsonwebtoken dotenv mongoose cors
   ```

3. Launch the server:

   ```bash
   node merged-server.js
   ```

4. The backend API will be available at `http://localhost:5000/api`.

## Project Structure

```
StraySense/
├── Database/
│   └── StraySense.sql       # Database schema and seed data
├── Frontend/               # React application
│   ├── src/
│   ├── public/
│   └── package.json
├── Backend/                # Express.js server
│   ├── merged-server.js    # Main server file
│   ├── routes/
│   ├── models/
│   └── package.json
├── .gitignore
└── README.md               # Project README
```

## Technologies

* **Frontend**: React, Redux, Axios
* **Backend**: Node.js, Express.js, Mongoose, JWT
* **Database**: MySQL (schema), MongoDB (for real-time data storage)
* **Deployment**: Docker (optional), AWS / Heroku

## Contributing

Contributions are welcome! Follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.

Ensure your code follows the existing style and includes relevant tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Pictures
<img width="2255" height="1272" alt="Screenshot 2025-05-15 105813" src="https://github.com/user-attachments/assets/31b037c7-b84e-4010-9e0a-ed8695362e67" />
<img width="2249" height="1345" alt="Screenshot 2025-05-15 105923" src="https://github.com/user-attachments/assets/f4d4be48-65c7-46ca-8a4a-e3bfee5ece94" />
<img width="2255" height="1336" alt="Screenshot 2025-05-15 110015" src="https://github.com/user-attachments/assets/5f9cb3d2-c01d-4778-8605-1908e2d37cc3" />
<img width="2255" height="1375" alt="Screenshot 2025-05-15 110041" src="https://github.com/user-attachments/assets/4e75a9f9-1ceb-4d63-8632-a86f48933e0f" />
<img width="2255" height="1363" alt="Screenshot 2025-05-15 110153" src="https://github.com/user-attachments/assets/43ae93b1-2782-47f1-9b1d-2e8a3792b280" />
<img width="2255" height="1378" alt="Screenshot 2025-05-15 110239" src="https://github.com/user-attachments/assets/63b3a193-44cd-42a5-b4d6-df1b2354b5ba" />


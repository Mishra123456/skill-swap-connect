# Skill Swap Connect

Skill Swap Connect is a web application designed to connect users for skill exchange. It allows users to find mentors or learners, match based on skills offered and requested, and engage in real-time chat and video sessions.

## Features

-   **User Authentication**: Secure signup and login with JWT.
-   **Skill Matching**: Find matches based on skills you want to learn and skills you can teach.
-   **Real-time Chat**: Text, image, and video messaging.
-   **Video Calls**: Integrated video conferencing for skill exchange sessions.
-   **Session Management**: Track session progress, set timers, and manage tasks.
-   **Dashboard**: Overview of requests, active sessions, and ongoing matches.
-   **Trust Score**: Reputation system based on user ratings and activity.

## Tech Stack

-   **Frontend**: React (Vite), TypeScript, Tailwind CSS, Framer Motion
-   **Backend**: Node.js, Express
-   **Database**: MongoDB
-   **Real-time**: Socket.io (assumed based on chat functionality)

## Getting Started

### Prerequisites

-   Node.js (v16+)
-   MongoDB (Local or Atlas)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd skill-swap-connect
    ```

2.  **Install Dependencies:**

    *Frontend:*
    ```bash
    cd src
    npm install
    ```
    (Note: Adjust if `package.json` is in the root or a subdirectory. Based on the structure, run `npm install` in the root and `server` directory).

    *Root (Frontend):*
    ```bash
    npm install
    ```

    *Backend:*
    ```bash
    cd server
    npm install
    ```

3.  **Configuration:**

    *Backend:*
    Create a `.env` file in the `server` directory:
    ```env
    PORT=5001
    MONGO_URI=mongodb://localhost:27017/skillswap
    JWT_SECRET=your_jwt_secret
    ```

4.  **Running the Application:**

    *Backend:*
    ```bash
    cd server
    npm start
    ```
    (Runs on port 5001)

    *Frontend:*
    ```bash
    npm run dev
    ```
    (Runs on port 5173 or similar)

## Project Structure

-   `/src`: Frontend source code (pages, components, context, lib).
-   `/server`: Backend source code (controllers, models, routes).

## Contributing

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

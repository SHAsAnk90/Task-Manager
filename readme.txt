Team Task Manager
=================

This is a full-stack Team Task Manager application.

Project Structure
-----------------
- backend/: Spring Boot application
- frontend/: React application (using Vite)

Prerequisites
-------------
- Node.js & npm
- Java JDK 17 or higher
- Maven (or use the provided Maven wrapper in the backend folder)
- PostgreSQL

How to Run
----------
From the root directory of the project, you can start both the frontend and the backend simultaneously using:

    npm start

This command will:
1. Install frontend dependencies and build the frontend.
2. Start the Spring Boot backend server using the Maven wrapper.

Alternatively, you can run them separately:
- Frontend: Navigate to the `frontend` directory, run `npm install`, then `npm run dev`.
- Backend: Navigate to the `backend` directory and run `.\mvnw.cmd spring-boot:run`.

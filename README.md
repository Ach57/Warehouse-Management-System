# Warehouse-Management-System
## Link to the website:
   https://warehouse-management-system-ef0n.onrender.com

A Node.js-based web application designed to manage tasks, employees, and user roles efficiently. This system features task assignment, role management, user authentication, and dynamic dashboards for admins and employees.

## Features
- **User Authentication**: Register and log in with role-based redirection.
- **Role Management**: Promote users to admin and manage employees.
- **Task Assignment**: Assign tasks with detailed components and statuses.
- **Task Review**: Track and manage completed tasks.
- **Dynamic Dashboard**: Tailored views for admins and employees.

## Tech Stack
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose for ORM)
- **Templating**: EJS
- **Real-time Updates**: Socket.io
- **Encryption**: bcrypt
- **Environment Management**: dotenv
- **Middleware**: body-parser, cookie-parser

---

## Installation

### Prerequisites
1. Install [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/).
2. Set up a [MongoDB Atlas](https://www.mongodb.com/) cluster.
3. Create a `.env` file in the root directory with the following content:
   ```env
   MONGO_URI=your_mongodb_connection_string

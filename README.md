
# Overview
This backend is part of the trash pickup system for Brasília. It uses:

- Node.js and Express.js for the backend server.
- MongoDB Atlas as the database.
- JWT-based authentication for secure user access.

# MongoDB Setup
I have set up the MongoDB Atlas database for the project. The details are:
- Login Email: egalitarianbrasil@proton.me
- username: egalitarianbrasil
- The Free instance is hosted on GCP in Sao Paulo, Brasil.
- Password: Remi has the password and can share it with the team.
- Access: Currently, the database allows access from any IP location for easier development.

You can view the database cluster and data at MongoDB Atlas.
The database name is: egalitarian_db.

# Setting Up the Project Locally
Follow these steps to set up the backend on your local machine:

## Step 1: Clone the Repository
```bash
git clone <repository_url>
cd <project_folder>
```

## Step 2: Install Dependencies
Run the following command to install required Node.js packages:
```bash
npm install
```

## Step 3: Set Up Environment Variables
Create a `.env` file in the root of the project. Use the `.env.example` as a template:
```bash
cp .env.example .env
```
Edit the `.env` file with your credentials:
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/egalitarian_db?retryWrites=true&w=majority
JWT_SECRET=<your_random_secure_jwt_secret>
PORT=5000
```
To get the correct connection string contact backend developers (Not shared publicly in repository).

## Step 4: Start the Development Server
Start the server locally:
```bash
npx nodemon server.js
```
The backend will run on `http://192.168.0.168:5000`.

# Functionalities Implemented

## 1. Authentication System
We implemented user registration and login functionality with JWT authentication.

### Endpoints:
- POST `/api/auth/register`: Register a new user.
  Payload:
  ```json
  {
      "username": "testuser",
      "email": "test@example.com",
      "password": "password123",
      "phone": "9283372629",
      "cpf": "12466748982"
  }
  ```
  Expected Response:
  ```json
  {
      "message": "User registered successfully"
  }
  ```

- POST `/api/auth/login`: Authenticate an existing user.
  Payload:
  ```json
  {
      "email": "test@example.com",
      "password": "password123"
  }
  ```
  Expected Response:
  ```json
  {
      "token": "<jwt_token>"
  }
  ```

## 2. Protected Routes
We implemented middleware to secure protected routes using JWT authentication.

- Middleware: `authMiddleware.js` verifies tokens from the Authorization header.
- Example Protected Route: GET `/api/users/me`
  Requires Authorization: Bearer `<jwt_token>` header.
  Expected Response:
  ```json
  {
      "id": "user_id_here",
      "username": "testuser",
      "email": "test@example.com"
  }
  ```

## 3. Media Upload and Feed

### **GET** `/media`

Returns all uploaded media.
Optional query parameter `?category=example_category` can be used to filter by category.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Expected Response (example):**

```json
[
  {
    "_id": "abc123",
    "filename": "example.jpg",
    "path": "uploads\\example.jpg",
    "type": "image/jpg",
    "category": "Visit",
    "uploadedAt": "2025-05-30T14:12:00.000Z"
  }
]
```

---

### **POST** `/media/upload`

Uploads a new media file.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Payload (FormData):**

```
file: <file>
category: Education
```

**Expected Response:**

```json
{
  "message": "File uploaded successfully"
}
```

---

### **GET** `/media/categories`

Returns a list of unique categories from the media files.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Expected Response:**

```json
["Visit", "Collect", "Storage"]
```


# Testing
I tested the local endpoints with Postman:
- Successfully registered and logged in a test user.
- Verified the JWT token-based authentication for protected routes.
- Confirmed MongoDB Atlas stores the test user in the `users` collection.

# Next Steps
Continue developing the backend, including additional routes like waste pickup APIs.

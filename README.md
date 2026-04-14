# ⚡ NovaForge — Custom Version Control System & Developer Platform

> A full-stack developer platform built around a custom-built, Git-inspired version control system. NovaForge implements its own internal VCS architecture from scratch — including staging, commits, push/pull with cloud storage, and revert — all powered by a CLI interface and backed by a modern web platform.

---

## 📖 Table of Contents

- [Overview](#-overview)
- [The .nova Folder](#-the-nova-folder)
- [CLI Commands](#-cli-commands)
- [Architecture](#-architecture)
- [Backend](#-backend)
  - [Authentication](#-authentication)
  - [Controllers](#-controllers)
  - [Models](#-models)
  - [Routes](#-routes)
  - [Middleware](#-middleware)
  - [AWS Configuration](#-aws--s3-configuration)
  - [Socket.IO](#-socketio--real-time)
- [Frontend](#-frontend)
  - [Auth System](#-auth-system)
  - [Routing](#-routing)
  - [Components](#-components)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Author](#-author)

---

## Overview

NovaForge is two things in one:

1. **A custom-built Version Control System (VCS)** — A CLI tool that mirrors Git-like behavior using its own internal `.nova` folder structure. It supports staging files, creating commits, pushing to AWS S3, pulling from S3, and reverting to previous commits.

2. **A Web Developer Platform** — A full-stack web application where users can manage repositories, track issues, view profiles, and monitor contribution activity through a heatmap — all with a clean, modern UI.

The project is built on the MERN stack (MongoDB, Express, React, Node.js), with real-time capabilities via Socket.IO and cloud storage through AWS S3.

---

---

## 📸 Screenshots

### 🔐 Authentication

#### Signup
![Signup](./screenshots/signup.png)

#### Login
![Login](./screenshots/login.png)

---

### 📊 Dashboard
![Dashboard](./screenshots/dashboard.png)

---

### 👤 Profile
![Profile](./screenshots/profile.png)

---

### 📈 Contributions Heatmap
![HeatMap](./screenshots/heatmap.png)

---

## 📁 The `.nova` Folder

At the heart of NovaForge's VCS is the `.nova` directory — analogous to `.git` in traditional version control. When you initialize a repository with `nova init`, this folder is created in your project's working directory and serves as the local VCS store.

```
.nova/
├── commits/
│   └── <commit-uuid>/
│       ├── <your-files>
│       └── commit.json       ← stores commit ID, message, and timestamp
├── staging/
│   └── <staged-files>        ← files queued for the next commit
└── config.json               ← stores S3 bucket name for push/pull
```

### How It Works

| Layer | Purpose |
|---|---|
| `staging/` | Temporary area where files land after `nova add`. Acts as the index before a commit. |
| `commits/<uuid>/` | Each commit is stored as a uniquely identified folder (UUID v4) containing a snapshot of all staged files plus a `commit.json` metadata file. |
| `config.json` | Bootstrapped during `init` with the S3 bucket name, enabling the push/pull commands to know where to sync. |

This design means every commit is a self-contained, human-readable snapshot of your staged files at a point in time — no binary pack files, no delta compression — simple, transparent, and inspectable.

---

## 💻 CLI Commands

NovaForge's CLI is powered by **Yargs**, which parses command-line arguments and dispatches to the appropriate controller. All commands are run via Node:

```bash
node index.js <command> [args]
```

| Command | Description |
|---|---|
| `node index.js start` | Starts the Express + Socket.IO web server |
| `node index.js init` | Initializes a new `.nova` repository in the current directory |
| `node index.js add <file>` | Stages a file by copying it into `.nova/staging/` |
| `node index.js commit "<message>"` | Creates a new commit snapshot in `.nova/commits/<uuid>/` with a `commit.json` |
| `node index.js push` | Uploads all local commits from `.nova/commits/` to AWS S3 |
| `node index.js pull` | Downloads all commits from AWS S3 into the local `.nova/` directory |
| `node index.js revert <commitID>` | Reverts the working directory to a specified commit |

---

## 🏗️ Architecture

```
NovaForge
├── backend/                  ← Node.js + Express API + VCS CLI
│   ├── index.js              ← Entry point: Yargs CLI + Express server
│   ├── controllers/          ← Business logic
│   ├── models/               ← Mongoose schemas
│   ├── routes/               ← API route definitions
│   ├── middleware/           ← JWT auth & authorization guards
│   ├── config/               ← AWS S3 configuration
│   └── .nova/                ← Local VCS store (created on init)
│
└── frontend/                 ← React (Vite) web application
│   └── src/
│       ├── authContext.jsx   ← Global auth state provider
│       ├── Routes.jsx        ← Protected & public route definitions
│       └── components/
│           ├── auth/         ← Login, Signup
│           ├── dashboard/    ← Main dashboard
│           ├── user/         ← Profile, HeatMap
│           ├── issue/        ← Issue management
│           ├── repo/         ← Repository views
│           └── Navbar.jsx
└── screenshots/
    ├── Signup.png
    ├── Login.png
    ├── Dashboard.png
    ├── Profile.png
    ├── HeatMap.png
```

---

## 🔧 Backend

### 🔐 Authentication

Authentication uses **JWT** (`jsonwebtoken`) and **bcryptjs**.

- **Signup** — Password is salted and hashed with `bcrypt.genSalt(10)` + `bcrypt.hash()` before saving. A JWT signed with `JWT_SECRET_KEY` (expires in `1h`) is returned alongside the `userId`.
- **Login** — User is looked up by email; `bcrypt.compare()` validates the password. On success, a fresh JWT is issued.

Protected routes require the JWT in the `Authorization` header, verified by `authMiddleware.js` before reaching any controller.

---

### 🎮 Controllers

Controllers house the core business logic and are separated by domain:

#### `userController.js`
Handles all user-related operations:
- `signup` — Register a new user with hashed password + JWT response
- `login` — Authenticate with bcrypt + return JWT
- `getAllUsers` — Fetch all users from MongoDB
- `getUserProfile` — Get a user by their MongoDB `_id`
- `updateUserProfile` — Update email and/or password (re-hashes on change)
- `deleteUserProfile` — Delete a user document by ID

#### `repoController.js`
Manages repository CRUD:
- `createRepository` — Validates owner ObjectId, creates a new `Repository` document
- `getAllRepositories` — Returns all repos with `owner` and `issues` populated
- `getRepositoryById` — Fetch a single repo by ID (populated)
- `getRepositoryByName` — Fetch repos by name
- `getRepositoriesForCurrentUser` — All repos belonging to a specific user
- `updateRepositoryById` — Update description or content of a repo
- `toggleVisibilityById` — Flip a repo's `visibility` boolean (public/private)
- `deleteRepositoryById` — Remove a repo by ID

#### `issueController.js`
Manages issues within repositories:
- `createIssue` — Create an issue linked to a repository
- `getAllIssues` — Fetch all issues for a given `repoId`
- `getIssueById` — Fetch a single issue by ID
- `updateIssueById` — Update title, description, or status (`open`/`closed`)
- `deleteIssueById` — Delete an issue

#### VCS Controllers (CLI)
| File | Function | What It Does |
|---|---|---|
| `init.js` | `initRepo()` | Creates `.nova/`, `.nova/commits/`, and `.nova/config.json` |
| `add.js` | `addRepo(filePath)` | Copies a file into `.nova/staging/` |
| `commit.js` | `commitRepo(message)` | Generates a UUID, creates a commit folder, copies staged files, writes `commit.json` |
| `push.js` | `pushRepo()` | Iterates all commit directories and uploads each file to S3 via `s3.upload()` |
| `pull.js` | `pullRepo()` | Lists all objects under `commits/` prefix in S3, downloads and writes them locally |
| `revert.js` | `revertRepo(commitID)` | Reverts the working directory to the state of a specific commit |

---

### 📦 Models

All models are defined using **Mongoose** schemas and stored in MongoDB.

#### `User` (`userModel.js`)
```
username        String (required, unique)
email           String (required)
password        String (bcrypt hashed)
repositories    [ObjectId → Repository]
followedUsers   [ObjectId → User]
starRepos       [ObjectId → Repository]
```

#### `Repository` (`repoModel.js`)
```
name            String (required, unique)
description     String
content         [String]
visibility      Boolean (public/private toggle)
owner           ObjectId → User (required)
issues          [ObjectId → Issue]
```

#### `Issue` (`issueModel.js`)
```
title           String (required)
description     String (required)
status          String (enum: "open" | "closed", default: "open")
repository      ObjectId → Repository (required)
```

---

### 🛣️ Routes

| Router File | Base Path | Handles |
|---|---|---|
| `main.router.js` | `/` | Root routing, mounts all sub-routers |
| `user.router.js` | `/users` | User CRUD, signup, login |
| `repo.router.js` | `/repos` | Repository CRUD, visibility toggle |
| `issue.router.js` | `/issues` | Issue CRUD within repos |

---

### 🛡️ Middleware

- **`authMiddleware.js`** — Verifies the JWT from the `Authorization` header; rejects invalid or expired tokens before they reach any controller.
- **`authorizeMiddleware.js`** — Role/permission guard; restricts operations like deletion to the resource owner.

---

### ☁️ AWS / S3 Configuration

Configured in `config/aws-config.js` using `aws-sdk`, targeting the `ap-south-1` region. The S3 bucket acts as the remote storage backend for the VCS. `push` uploads commits under the key structure `commits/<commitID>/<filename>`, and `pull` lists and downloads all objects under the `commits/` prefix to reconstruct the local commit history.

---

### 🔌 Socket.IO — Real-Time

The Express server is wrapped in an HTTP server and a **Socket.IO** instance is attached to it for real-time capabilities:

```js
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.on("joinRoom", (userID) => {
    // User joins a room identified by their userID
  });
});
```

Users can join individual rooms (keyed by their `userID`) upon connection, enabling targeted real-time events such as notifications or live repository updates.

---

## 🎨 Frontend

Built with **React 19** + **Vite** and uses **React Router DOM v7** for navigation.

### 🔑 Auth System

Authentication state is managed globally via a **React Context** (`authContext.jsx`). On app load, a `useEffect` checks `localStorage` for a persisted `userId` (stored after login/signup) and restores the session automatically. The `useAuth()` hook exposes `currUser` and `setCurrUser` to any component in the tree.

---

### 🛤️ Routing

Defined in `Routes.jsx` using `useRoutes` from React Router DOM. Two wrapper components enforce access control:

- **`ProtectedRoute`** — Redirects to `/login` if no `currUser` is present. Guards dashboard and profile pages.
- **`PublicRoute`** — Redirects to `/` if the user is already logged in. Guards login and signup pages.

| Path | Component | Access |
|---|---|---|
| `/` | `Dashboard` | Protected |
| `/userProfile/:userId` | `Profile` | Protected |
| `/login` | `Login` | Public only |
| `/signup` | `Signup` | Public only |

---

### 🧩 Components

#### `auth/`
- **`Login.jsx`** — Login form that calls the `/users/login` API endpoint, stores the returned `token` and `userId` in `localStorage`, and updates `AuthContext`.
- **`Signup.jsx`** — Registration form that calls `/users/signup`, handles duplicate username/email errors, and auto-logs the user in on success.

#### `dashboard/`
- **`Dashboard.jsx`** — Main landing page after login. Displays the user's repositories, recent activity, and quick-access tools. Fetches repos via the `/repos` API.

#### `user/`
- **`Profile.jsx`** — User profile page accessible at `/userProfile/:userId`. Displays username, email, owned repositories, followed users, and starred repos. Fetches data from `/users/:userId`.
- **`HeatMap.jsx`** — Contribution heatmap built using `@uiw/react-heat-map`. Visualizes commit/activity frequency over time, similar to contribution graphs on developer platforms.

#### `Navbar.jsx`
- Top navigation bar with links to Dashboard, Profile, and logout functionality. Uses `useAuth()` to conditionally render auth-related actions.

#### `issue/` and `repo/`
- Component folders for issue management views and repository detail/listing views respectively.

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Web Framework | Express.js v5 |
| CLI Framework | Yargs |
| Database | MongoDB (via Mongoose) |
| Authentication | JWT (`jsonwebtoken`) + `bcryptjs` |
| Cloud Storage | AWS S3 (`aws-sdk`) |
| Real-time | Socket.IO |
| File System | `fs-extra` |
| ID Generation | `uuid` (v4) |
| Frontend | React 19 + Vite |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |
| UI Components | `@primer/react` |
| Heatmap | `@uiw/react-heat-map` |

---

## 📂 Project Structure

```
NovaForge/
│
├── backend/
│   ├── index.js                     ← Yargs CLI + Express server entry point
│   ├── .env                         ← Environment variables
│   ├── package.json
│   │
│   ├── config/
│   │   └── aws-config.js            ← AWS S3 client setup
│   │
│   ├── controllers/
│   │   ├── init.js                  ← nova init
│   │   ├── add.js                   ← nova add <file>
│   │   ├── commit.js                ← nova commit
│   │   ├── push.js                  ← nova push → S3
│   │   ├── pull.js                  ← nova pull ← S3
│   │   ├── revert.js                ← nova revert <commitID>
│   │   ├── userController.js        ← User CRUD + Auth
│   │   ├── repoController.js        ← Repository CRUD
│   │   └── issueController.js       ← Issue CRUD
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js        ← JWT verification
│   │   └── authorizeMiddleware.js   ← Permission/role guard
│   │
│   ├── models/
│   │   ├── userModel.js             ← User schema
│   │   ├── repoModel.js             ← Repository schema
│   │   └── issueModel.js            ← Issue schema
│   │
│   ├── routes/
│   │   ├── main.router.js           ← Root router
│   │   ├── user.router.js           ← /users routes
│   │   ├── repo.router.js           ← /repos routes
│   │   └── issue.router.js          ← /issues routes
│   │
│   └── .nova/                       ← Created on `nova init`
│       ├── commits/
│       ├── staging/
│       └── config.json
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    │
    └── src/
        ├── main.jsx                 ← App entry, wraps with AuthProvider + Router
        ├── App.jsx
        ├── authContext.jsx          ← Global auth state (Context API)
        ├── Routes.jsx               ← Route definitions with guards
        │
        └── components/
            ├── Navbar.jsx
            ├── auth/
            │   ├── Login.jsx
            │   └── Signup.jsx
            ├── dashboard/
            │   └── Dashboard.jsx
            ├── user/
            │   ├── Profile.jsx
            │   └── HeatMap.jsx
            ├── issue/
            └── repo/
```

---

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- AWS account with an S3 bucket

### Backend Setup

```bash
cd backend
npm install

# Create your .env file (see Environment Variables below)
# Then start the server:
node index.js start

# Or use CLI commands:
node index.js init
node index.js add <file>
node index.js commit "your message"
node index.js push
node index.js pull
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server will start on `http://localhost:5173` by default.

---

## 🔑 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=3000
MONGO_URL=mongodb://localhost:27017/novaforge
JWT_SECRET_KEY=your_jwt_secret_key_here
S3_BUCKET=your_s3_bucket_name
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

> ⚠️ Never commit your `.env` file or AWS credentials to version control.

---

## 👨‍💻 Author

**Suyesh Singh**  
IIT Bhilai

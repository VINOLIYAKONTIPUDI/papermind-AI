# PaperMind AI — React Frontend

This is the React frontend for the PaperMind AI platform, powered by Vite.

## Setup & Running the Frontend

Before running the frontend, make sure the backend server is running (default port `5000`).

### 1. Unified Setup (Recommended)
You can run both the frontend and backend concurrently from the project root using:
```bash
# Go to root directory
cd ..

# Install all dependencies (Frontend & Backend)
npm run install:all

# Run both servers concurrently
npm run dev
```

### 2. Standalone Frontend Development
If you want to run the client separately:
```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The client app will be accessible at: [http://localhost:5173](http://localhost:5173)

### 3. Production Build
To build and preview the production build of the frontend:
```bash
# Build the production files (output in dist/)
npm run build

# Preview the build locally
npm run preview
```

---

For full details on the vector database (Qdrant), MongoDB metadata storage, and configuration, please refer to the [Root README](../README.md).

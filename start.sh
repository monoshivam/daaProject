#!/bin/bash

# Navigate to backend and activate virtual environment
cd backend/ || exit
echo "Activating virtual environment..."
source aviate/bin/activate

# Start FastAPI backend server in background
echo "Starting backend server..."
uvicorn main:app --reload &
BACKEND_PID=$!
cd ..

# Navigate to frontend and start the React dev server
cd frontend/ || exit
echo "Starting frontend server..."
npm run dev

# Kill backend server when frontend stops
kill $BACKEND_PID

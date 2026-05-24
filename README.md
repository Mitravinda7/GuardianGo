# 🛡️ GuardianGo — Travel Safety Platform

A full-stack travel safety web app for India that combines real-time safety mapping, community reporting, SOS emergency alerts, eco-friendly route suggestions, and travel insights.

## Features
- 🗺️ Interactive safety map with real OpenStreetMap data
- 🚨 SOS emergency system with SMS + email alerts
- 👥 Community safety reports with voting
- 🔔 Real-time alerts via WebSocket
- 🌱 Eco Route Suggester with CO₂ savings
- 🌫️ Air Quality overlay
- 🧭 Travel Insights — tourist spots, heritage, food nearby
- 🌍 Google Translate — all Indian languages
- 📍 Auto location detection

## Tech Stack
**Frontend:** React, Vite, Leaflet.js, Socket.io-client  
**Backend:** Node.js, Express, MongoDB, Socket.io  
**APIs:** OpenStreetMap, Overpass, OSRM, WAQI  

## Setup

### Backend
```bash
cd backend
npm install
# Create .env with your MongoDB URI and other keys
node src/server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables
Create `backend/.env`:
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
EMAIL_USER=your_gmail
EMAIL_PASS=your_app_password
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE=your_twilio_number
CLIENT_URL=http://localhost:5174
```
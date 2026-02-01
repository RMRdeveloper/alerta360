# Alerta360 🚨

**Alerta360** is a comprehensive platform designed to assist in the search and recovery of missing persons. It leverages modern web technologies and geospatial data to connect communities and authorities in real-time.

## 🌟 Features

- **Missing Persons Registry**: Detailed profiles with photos, physical descriptions, and last seen information.
- **Sighting Reports**: Community members can report sightings with location (Google Maps), date, description, and photo evidence.
- **Risk Map**: Interactive heatmap visualization of high-risk areas based on historical data.
- **Child Registration**: Secure registration for minors to preemptively store vital information.
- **Glossary**: Search terms and definitions related to missing persons cases.
- **Share Profile**: Share missing person profiles via Web Share API or copy link.
- **Image Moderation**: Automatic validation of uploaded images (NSFW.js) before publication. A dedicated endpoint (`POST /image-moderation/check`) allows external services and apps to validate images before submitting content to the API.
- **Google OAuth**: Sign in with Google in addition to email/password.
- **Real-time Search**: Advanced filtering by name, age, gender, and status.
- **Internationalization**: Full support for English and Spanish (ES/EN).

## 🛠 Tech Stack

### Frontend
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: PrimeVue
- **Maps**: Google Maps JavaScript API (Places, Geocoding)
- **State/Routing**: Pinia, Vue Router, Vue I18n

### Backend
- **Framework**: NestJS
- **Database**: MongoDB (Mongoose)
- **API**: RESTful architecture, Swagger
- **File Storage**: Local storage (Multer) with support for expansion
- **Image Moderation**: NSFW.js

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Google Maps API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RMRdeveloper/alerta360.git
   cd alerta360
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install

   # Create .env file from template
   cp .env.example .env
   # Edit .env and set: MONGODB_URI, JWT_SECRET, and optionally GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, CORS_ORIGIN

   # Run server
   npm run start:dev
   ```
   *Server runs on http://localhost:3000*

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install

   # Create .env file
   cp .env.example .env
   # Edit .env and set: VITE_GOOGLE_MAPS_API_KEY, VITE_API_URL (optional, defaults to http://localhost:3000)

   # Run client
   npm run dev
   ```
   *Client runs on http://localhost:5173*

### Environment Variables

| Location | Variable | Required | Description |
|----------|----------|----------|-------------|
| Backend | `MONGODB_URI` | Yes | MongoDB connection string |
| Backend | `PORT` | No | Server port (default: 3000) |
| Backend | `JWT_SECRET` | Yes | Secret for JWT signing |
| Backend | `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| Backend | `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| Backend | `IMAGE_MODERATION_ENABLED` | No | Enable/disable image moderation (default: true) |
| Backend | `CORS_ORIGIN` | No | Allowed CORS origin (e.g. http://localhost:5173) |
| Frontend | `VITE_GOOGLE_MAPS_API_KEY` | Yes | Google Maps API key |
| Frontend | `VITE_API_URL` | No | Backend API URL (default: http://localhost:3000) |

See [backend/.env.example](backend/.env.example) and [frontend/.env.example](frontend/.env.example) for full templates.

## 📂 Project Structure

```
alerta360/
├── AGENTS.md             # Code conventions (developers and AI agents)
├── backend/              # NestJS API
│   ├── src/
│   │   ├── auth/
│   │   ├── children/
│   │   ├── glossary/
│   │   ├── image-moderation/
│   │   ├── missing-persons/
│   │   ├── sightings/
│   │   ├── statistics/
│   │   ├── storage/
│   │   ├── users/
│   │   └── ...
│   └── .env.example
├── frontend/             # Vue 3 Client
│   ├── src/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── constants/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── views/
│   │   └── ...
│   └── .env.example
└── README.md
```

## 📚 Documentation

- **[AGENTS.md](AGENTS.md)**: Code conventions, naming, and structure for developers and AI agents.
- **Swagger API Docs**: When the backend is running, visit [http://localhost:3000/api/docs](http://localhost:3000/api/docs).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

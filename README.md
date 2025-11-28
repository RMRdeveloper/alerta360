# Alerta360 🚨

**Alerta360** is a comprehensive platform designed to assist in the search and recovery of missing persons. It leverages modern web technologies and geospatial data to connect communities and authorities in real-time.

## 🌟 Features

- **Missing Persons Registry**: detailed profiles with photos, physical descriptions, and last seen information.
- **Sighting Reports**: Community members can report sightings with location (Google Maps), date, description, and photo evidence.
- **Risk Map**: Interactive heatmap visualization of high-risk areas based on historical data.
- **Child Registration**: Secure registration for minors to preemptively store vital information.
- **Real-time Search**: Advanced filtering by name, age, gender, and status.
- **Internationalization**: Full support for English and Spanish (ES/EN).

## 🛠 Tech Stack

### Frontend
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Maps**: Google Maps JavaScript API (Places, Visualization)
- **State/Routing**: Vue Router, Vue I18n

### Backend
- **Framework**: NestJS
- **Database**: MongoDB (Mongoose)
- **API**: RESTful architecture
- **File Storage**: Local storage (Multer) with support for expansion.

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
   
   # Create .env file
   cp .env.example .env
   # Update MONGODB_URI in .env
   
   # Run server
   npm run start:dev
   ```
   *Server runs on http://localhost:3000*

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Create .env file
   echo "VITE_GOOGLE_MAPS_API_KEY=your_api_key_here" > .env
   
   # Run client
   npm run dev
   ```
   *Client runs on http://localhost:5173*

## 📂 Project Structure

```
alerta360/
├── backend/            # NestJS API
│   ├── src/
│   │   ├── missing-persons/
│   │   ├── sightings/
│   │   ├── risk-map/
│   │   └── ...
├── frontend/           # Vue 3 Client
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── services/
│   │   └── ...
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

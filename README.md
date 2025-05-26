# Indian Flight Route Mapping System

A full-stack web application that helps users find optimal flight routes between Indian airports. The system visualizes flight paths on an interactive map of India and calculates the best routes based on either cost or distance.

## Features

- Interactive map visualization of Indian airports and flight routes
- Find shortest/cheapest paths between any two airports
- Optional layover airport selection
- Real-time path visualization on the map
- Cost and distance optimization options
- Detailed flight information including:
  - Total distance
  - Total cost
  - Estimated flight time
- Responsive web interface with modern design
- Interactive airport selection

## Tech Stack

### Frontend
- React.js
- D3.js for map visualization
- Tailwind CSS for styling

### Backend
- FastAPI (Python)
- Dijkstra's algorithm for path finding
- GeoJSON for map data

## Project Structure

```
.
├── backend/
│   ├── main.py           # FastAPI server implementation
│   ├── data/             # JSON data files
│   └── map_coordinates.py # Map coordinate processing
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Main React application
│   │   ├── components/   # React components
│   │   └── services/     # API services
│   └── index.html
└── start.sh             # Project startup script
```

## Setup and Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd indian-flight-route-mapping
```

2. Backend Setup:
```bash
cd backend
# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
# Install dependencies
pip install -r requirements.txt
```

3. Frontend Setup:
```bash
cd frontend
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Or use the provided start script:
```bash
./start.sh
```

The application will be available at `http://localhost:5173` with the API running on `http://localhost:8000`.

## How to Use

1. Select a source airport from the dropdown menu
2. Select a destination airport
3. (Optional) Select a layover airport
4. Choose optimization preference (cost or distance)
5. Click "Find Route" to calculate and display the optimal path
6. View the route details including total cost, distance, and estimated time

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Map data sourced from GeoJSON India map
- Flight route data compiled from various Indian airlines
- Built as part of the Design & Analysis of Algorithms course project 
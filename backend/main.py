from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, field_validator
import heapq
import logging
import json
import os
from typing import List, Optional
from functools import lru_cache

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Indian Flight Route Mapping API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "An unexpected error occurred. Please try again later."},
    )

# Load airport and route data from JSON files
DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "reduced_map_data.json")

try:
    logger.info(f"Attempting to load data from {DATA_FILE}")
    if not os.path.exists(DATA_FILE):
        logger.error(f"Data file not found: {DATA_FILE}")
        raise FileNotFoundError(f"Data file not found: {DATA_FILE}")
        
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    if 'airports' not in data or 'routes' not in data:
        logger.error(f"Invalid data format in {DATA_FILE}: missing 'airports' or 'routes' keys")
        raise ValueError(f"Invalid data format in {DATA_FILE}: missing required keys")
        
    airports = data['airports']
    routes = data['routes']
    
    logger.info(f"Loaded {len(airports)} airports and {len(routes)} routes from {DATA_FILE}")
    
    # Log a sample of the data to verify structure
    if airports and routes:
        logger.info(f"Sample airport: {airports[0]}")
        logger.info(f"Sample route: {routes[0]}")
except Exception as e:
    logger.error(f"Error loading data from {DATA_FILE}: {e}")
    # Fallback to empty data
    airports = []
    routes = []

class PathRequest(BaseModel):
    source: str
    destination: str
    layover: str | None = None  # Optional layover airport
    metric: str = "cost"
    
    @field_validator('metric')
    @classmethod
    def validate_metric(cls, v):
        if v not in ['cost', 'distance']:
            raise ValueError("Metric must be either 'cost' or 'distance'")
        return v

class PathResponse(BaseModel):
    path: List[str]
    total_cost: float
    total_distance: float
    total_time: float
    error: Optional[str] = None
    
# We'll return the GeoJSON directly as a Response instead of parsing it
# class GeoJsonResponse(BaseModel):
#     geojson: dict

@lru_cache(maxsize=1)
def build_graph():
    """Build the airport graph with caching for better performance."""
    graph = {}
    
    # Initialize the graph with all airports
    for airport in airports:
        graph[airport["id"]] = {}
    
    # Create connections for all routes
    for route in routes:
        source = route["source"]
        target = route["target"]
        distance = route["distance"]
        cost = route["cost"]
        
        # Calculate flight time in hours (assuming average speed of 800 km/h)
        flight_time = distance / 800  # Time in hours
        
        # Check for missing airports (should never happen, but just in case)
        if source not in graph or target not in graph:
            logger.warning(f"Invalid route: {source} -> {target}, skipping")
            continue
            
        # Add routes in both directions to ensure graph connectivity
        # We want to make sure all airports are reachable
        graph[source][target] = {"distance": distance, "cost": cost, "time": flight_time}
        graph[target][source] = {"distance": distance, "cost": cost, "time": flight_time}
    
    logger.info(f"Graph built with {len(graph)} airports and {len(routes)} routes (bidirectional)")
    return graph

def dijkstra(graph, start, end, metric):
    """Optimized Dijkstra's algorithm implementation."""
    if start not in graph or end not in graph:
        logger.error(f"Invalid airport IDs: start={start}, end={end}")
        return [], 0, 0, 0
        
    # Initialize data structures
    distances = {node: float('infinity') for node in graph}
    distances[start] = 0
    priority_queue = [(0, start)]
    previous = {node: None for node in graph}
    visited = set()
    
    # Early exit if start and end are the same
    if start == end:
        return [start], 0, 0, 0
    
    # Dijkstra's algorithm main loop
    while priority_queue:
        current_distance, current_node = heapq.heappop(priority_queue)

        if current_node == end:  # Found the destination
            break

        if current_node in visited:
            continue

        visited.add(current_node)

        for neighbor, edge_data in graph[current_node].items():
            if neighbor in visited:
                continue

            weight = edge_data[metric]
            distance = current_distance + weight

            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous[neighbor] = current_node
                heapq.heappush(priority_queue, (distance, neighbor))

    # If end node wasn't reached
    if distances[end] == float('infinity'):
        return [], 0, 0, 0

    # Reconstruct path
    path = []
    current = end

    while current:
        path.append(current)
        current = previous[current]

    path.reverse()

    # Calculate totals
    total_cost = 0
    total_distance = 0
    total_time = 0

    for i in range(len(path) - 1):
        current = path[i]
        next_node = path[i + 1]
        edge_data = graph[current][next_node]
        total_cost += edge_data["cost"]
        total_distance += edge_data["distance"]
        total_time += edge_data["time"]

    return path, total_cost, total_distance, total_time

@app.get("/airports")
def get_airports():
    logger.info(f"Returning {len(airports)} airports")
    if not airports:
        logger.warning("No airport data available!")
    return airports

@app.get("/routes")
def get_routes():
    logger.info(f"Returning {len(routes)} routes")
    if not routes:
        logger.warning("No route data available!")
    return routes
    
@app.get("/india-map")
def get_india_map():
    try:
        map_file = os.path.join(os.path.dirname(__file__), "data", "in.json")
        logger.info(f"Loading India map from: {map_file}")
        
        if not os.path.exists(map_file):
            logger.error(f"Map file not found: {map_file}")
            raise HTTPException(status_code=404, detail="India map file not found")
        
        logger.info(f"Map file exists, size: {os.path.getsize(map_file)} bytes")
            
        with open(map_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Instead of parsing, just return the raw JSON content
        return Response(content=content, media_type="application/json")
            
    except Exception as e:
        logger.error(f"Error loading India GeoJSON map: {e}")
        raise HTTPException(status_code=500, detail=f"Could not load India map data: {str(e)}")

@app.post("/find-path", response_model=PathResponse)
def find_path(request: PathRequest):
    source = request.source
    destination = request.destination
    layover = request.layover
    metric = request.metric
    
    logger.info(f"Finding path from {source} to {destination} via {layover} optimizing for {metric}")

    # Use the cached graph
    graph = build_graph()

    # Quick validation of airports
    if source not in graph:
        logger.warning(f"Source airport not found: {source}")
        raise HTTPException(status_code=404, detail=f"Source airport {source} not found")

    if destination not in graph:
        logger.warning(f"Destination airport not found: {destination}")
        raise HTTPException(status_code=404, detail=f"Destination airport {destination} not found")
        
    if layover and layover not in graph:
        logger.warning(f"Layover airport not found: {layover}")
        raise HTTPException(status_code=404, detail=f"Layover airport {layover} not found")

    # Early return for same source and destination
    if source == destination:
        logger.info(f"Source and destination are the same: {source}")
        return {
            "path": [source],
            "total_cost": 0,
            "total_distance": 0,
            "total_time": 0,
            "error": None
        }

    # Find the shortest path
    try:
        if layover:
            logger.info(f"Finding path with layover at {layover}")
            # First find path from source to layover
            path1, cost1, distance1, time1 = dijkstra(graph, source, layover, metric)
            if not path1 or path1[0] != source:
                logger.warning(f"No path found from {source} to layover {layover}")
                return {
                    "error": f"No valid path found between {source} and layover {layover}",
                    "path": [],
                    "total_cost": 0,
                    "total_distance": 0,
                    "total_time": 0
                }
            
            # Then find path from layover to destination
            path2, cost2, distance2, time2 = dijkstra(graph, layover, destination, metric)
            if not path2 or path2[0] != layover:
                logger.warning(f"No path found from layover {layover} to {destination}")
                return {
                    "error": f"No valid path found between layover {layover} and {destination}",
                    "path": [],
                    "total_cost": 0,
                    "total_distance": 0,
                    "total_time": 0
                }
            
            # Combine paths (remove duplicate layover)
            path = path1[:-1] + path2  # Remove layover from first path to avoid duplication
            total_cost = cost1 + cost2
            total_distance = distance1 + distance2
            total_time = time1 + time2
            
            logger.info(f"Found layover path: {' → '.join(path)}")
            logger.info(f"Path details: cost={total_cost}, distance={total_distance}, time={total_time}")
        else:
            path, total_cost, total_distance, total_time = dijkstra(graph, source, destination, metric)
        
        # Check if a valid path was found
        if not path or path[0] != source:
            logger.info(f"No path found between {source} and {destination}")
            return {
                "error": "No valid path found between these airports",
                "path": [],
                "total_cost": 0,
                "total_distance": 0,
                "total_time": 0
            }
            
        logger.info(f"Path found: {' → '.join(path)}, cost: {total_cost}, distance: {total_distance}, time: {total_time}")
        return {
            "path": path,
            "total_cost": total_cost,
            "total_distance": total_distance,
            "total_time": total_time,
            "error": None
        }
    except Exception as e:
        logger.error(f"Error finding path: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to calculate path: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Flight Route Mapping API server")
    uvicorn.run(app, host="0.0.0.0", port=8000)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import heapq
from typing import List, Dict, Any, Optional

app = FastAPI(title="Flight Route Mapping API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

airports = [
    {"id": "JFK", "name": "John F. Kennedy", "x": 300, "y": 200},
    {"id": "LAX", "name": "Los Angeles", "x": 100, "y": 250},
    {"id": "ORD", "name": "Chicago O'Hare", "x": 220, "y": 180},
    {"id": "ATL", "name": "Atlanta", "x": 280, "y": 300},
    {"id": "DFW", "name": "Dallas/Fort Worth", "x": 180, "y": 320},
    {"id": "LHR", "name": "London Heathrow", "x": 400, "y": 150},
    {"id": "CDG", "name": "Paris Charles de Gaulle", "x": 420, "y": 200},
    {"id": "DXB", "name": "Dubai", "x": 500, "y": 250},
    {"id": "HND", "name": "Tokyo Haneda", "x": 600, "y": 220},
    {"id": "SIN", "name": "Singapore Changi", "x": 550, "y": 350},
    {"id": "SYD", "name": "Sydney", "x": 650, "y": 400},
    {"id": "GRU", "name": "São Paulo", "x": 250, "y": 400},
    {"id": "MEX", "name": "Mexico City", "x": 150, "y": 350},
    {"id": "YYZ", "name": "Toronto Pearson", "x": 250, "y": 150},
    {"id": "FRA", "name": "Frankfurt", "x": 380, "y": 180},
    {"id": "AMS", "name": "Amsterdam", "x": 390, "y": 140},
]

routes = [
    {"source": "JFK", "target": "LAX", "distance": 2475, "cost": 350},
    {"source": "JFK", "target": "LHR", "distance": 3461, "cost": 450},
    {"source": "LAX", "target": "ORD", "distance": 1745, "cost": 250},
    {"source": "ORD", "target": "ATL", "distance": 606, "cost": 150},
    {"source": "ATL", "target": "DFW", "distance": 732, "cost": 180},
    {"source": "LHR", "target": "CDG", "distance": 214, "cost": 100},
    {"source": "CDG", "target": "DXB", "distance": 3250, "cost": 420},
    {"source": "DXB", "target": "HND", "distance": 4828, "cost": 580},
    {"source": "HND", "target": "SIN", "distance": 3319, "cost": 400},
    {"source": "SIN", "target": "SYD", "distance": 3907, "cost": 440},
    {"source": "JFK", "target": "ORD", "distance": 740, "cost": 180},
    {"source": "LAX", "target": "SYD", "distance": 7490, "cost": 700},
    {"source": "ATL", "target": "GRU", "distance": 4751, "cost": 530},
    {"source": "MEX", "target": "GRU", "distance": 4678, "cost": 520},
    {"source": "MEX", "target": "LAX", "distance": 1553, "cost": 230},
    {"source": "YYZ", "target": "ORD", "distance": 436, "cost": 130},
    {"source": "YYZ", "target": "JFK", "distance": 371, "cost": 120},
    {"source": "LHR", "target": "FRA", "distance": 398, "cost": 130},
    {"source": "FRA", "target": "AMS", "distance": 227, "cost": 110},
    {"source": "AMS", "target": "LHR", "distance": 229, "cost": 110},
    {"source": "DFW", "target": "MEX", "distance": 934, "cost": 200},
    {"source": "DFW", "target": "ORD", "distance": 802, "cost": 190},
    {"source": "ATL", "target": "JFK", "distance": 760, "cost": 185},
]

class PathRequest(BaseModel):
    source: str
    destination: str
    metric: str = "cost"

class PathResponse(BaseModel):
    path: List[str]
    total_cost: float
    total_distance: float
    error: Optional[str] = None

def build_graph():
    graph = {}

    for airport in airports:
        graph[airport["id"]] = {}

    for route in routes:
        source = route["source"]
        target = route["target"]
        distance = route["distance"]
        cost = route["cost"]

        graph[source][target] = {"distance": distance, "cost": cost}
        graph[target][source] = {"distance": distance, "cost": cost}

    return graph

def dijkstra(graph, start, end, metric):
    distances = {node: float('infinity') for node in graph}
    distances[start] = 0

    priority_queue = [(0, start)]
    previous = {node: None for node in graph}
    visited = set()

    while priority_queue:
        current_distance, current_node = heapq.heappop(priority_queue)

        if current_node == end:
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

    path = []
    current = end

    while current:
        path.append(current)
        current = previous[current]

    path.reverse()

    total_cost = 0
    total_distance = 0

    if len(path) <= 1:
        return path, total_cost, total_distance

    for i in range(len(path) - 1):
        current = path[i]
        next_node = path[i + 1]
        edge_data = graph[current][next_node]
        total_cost += edge_data["cost"]
        total_distance += edge_data["distance"]

    return path, total_cost, total_distance

@app.get("/airports")
def get_airports():
    return airports

@app.get("/routes")
def get_routes():
    return routes

@app.post("/find-path", response_model=PathResponse)
def find_path(request: PathRequest):
    source = request.source
    destination = request.destination
    metric = request.metric

    if metric not in ['cost', 'distance']:
        raise HTTPException(status_code=400, detail="Metric must be either 'cost' or 'distance'")

    graph = build_graph()

    if source not in graph:
        raise HTTPException(status_code=404, detail=f"Source airport {source} not found")

    if destination not in graph:
        raise HTTPException(status_code=404, detail=f"Destination airport {destination} not found")

    path, total_cost, total_distance = dijkstra(graph, source, destination, metric)

    if not path or path[0] != source:
        return {
            "error": "No valid path found between these airports",
            "path": [],
            "total_cost": 0,
            "total_distance": 0
        }

    return {
        "path": path,
        "total_cost": total_cost,
        "total_distance": total_distance,
        "error": None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

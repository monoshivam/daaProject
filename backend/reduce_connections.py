import json
import random
import os
import math

def calculate_distance(lat1, lng1, lat2, lng2):
    """Calculate the great circle distance between two points in kilometers."""
    # Convert to radians
    lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371  # Radius of Earth in kilometers
    return c * r

def main():
    # Load the current data
    try:
        with open('data/map_data.json', 'r') as f:
            data = json.load(f)
            airports = data['airports']
            routes = data['routes']
            
        print(f"Loaded {len(airports)} airports and {len(routes)} routes from map_data.json")
        
        # Create a list of all possible airport pairs
        all_airport_ids = [airport['id'] for airport in airports]
        
        # Create a mapping of airport IDs to their details
        airport_map = {airport['id']: airport for airport in airports}
        
        # Group routes by source airport
        routes_by_source = {}
        for route in routes:
            source = route['source']
            if source not in routes_by_source:
                routes_by_source[source] = []
            routes_by_source[source].append(route)
        
        # Create a new set of reduced routes
        new_routes = []
        
        # Track connections for each airport to ensure minimum connectivity
        connections_count = {airport_id: 0 for airport_id in all_airport_ids}
        
        # First pass: Create primary connections
        for airport_id, airport_routes in routes_by_source.items():
            # Calculate distances to all other airports
            distances = []
            for other_id in all_airport_ids:
                if other_id == airport_id:
                    continue
                    
                source_airport = airport_map[airport_id]
                target_airport = airport_map[other_id]
                
                # Skip if coordinates are not available
                if 'lat' not in source_airport or 'lng' not in source_airport or \
                   'lat' not in target_airport or 'lng' not in target_airport:
                    continue
                
                distance = calculate_distance(
                    source_airport['lat'], source_airport['lng'],
                    target_airport['lat'], target_airport['lng']
                )
                
                distances.append((other_id, distance))
            
            # Sort by distance
            distances.sort(key=lambda x: x[1])
            
            # Always keep at least 3 closest airports (increased from 2)
            kept_targets = set([dist[0] for dist in distances[:3]])
            
            # Add 1-2 medium distance connections
            mid_range = distances[3:8]
            if mid_range:
                num_mid = random.randint(1, 2)
                mid_choices = random.sample(mid_range, min(num_mid, len(mid_range)))
                kept_targets.update([dist[0] for dist in mid_choices])
            
            # Add 1 long distance connection with 80% probability (increased from 70%)
            long_range = distances[8:]
            if long_range and random.random() < 0.8:
                kept_targets.add(random.choice(long_range)[0])
            
            # Filter and add routes
            for route in airport_routes:
                if route['target'] in kept_targets:
                    route_copy = route.copy()
                    route_copy['direct'] = True
                    new_routes.append(route_copy)
                    connections_count[route['source']] += 1
                    connections_count[route['target']] += 1
        
        # Second pass: Add connections to poorly connected airports
        poorly_connected = [aid for aid, count in connections_count.items() if count < 3]
        while poorly_connected:
            for airport_id in poorly_connected:
                distances = []
                for other_id in all_airport_ids:
                    if other_id == airport_id:
                        continue
                    
                    source_airport = airport_map[airport_id]
                    target_airport = airport_map[other_id]
                    
                    if 'lat' in source_airport and 'lng' in source_airport and \
                       'lat' in target_airport and 'lng' in target_airport:
                        distance = calculate_distance(
                            source_airport['lat'], source_airport['lng'],
                            target_airport['lat'], target_airport['lng']
                        )
                        distances.append((other_id, distance))
                
                if distances:
                    distances.sort(key=lambda x: x[1])
                    # Add connections until minimum is met
                    for target_id, distance in distances:
                        if connections_count[airport_id] >= 3:
                            break
                        # Prefer connecting to well-connected airports
                        if connections_count[target_id] >= 3:
                            new_route = {
                                'source': airport_id,
                                'target': target_id,
                                'distance': distance,
                                'direct': True
                            }
                            new_routes.append(new_route)
                            connections_count[airport_id] += 1
                            connections_count[target_id] += 1
            
            # Update poorly connected list
            poorly_connected = [aid for aid, count in connections_count.items() if count < 3]
        
        print(f"Reduced routes from {len(routes)} to {len(new_routes)}")
        print("Airport connections:", connections_count)
        
        # Update costs and times with more extreme variations
        for route in new_routes:
            source = airport_map[route['source']]
            target = airport_map[route['target']]
            
            if 'lat' in source and 'lng' in source and 'lat' in target and 'lng' in target:
                distance = calculate_distance(
                    source['lat'], source['lng'],
                    target['lat'], target['lng']
                )
                
                # Categorize routes by distance with more extreme pricing
                if distance < 500:  # Short routes
                    base_cost = 1000
                    distance_cost = int(distance * 12)  # Even higher per-km cost
                    total_cost = base_cost + distance_cost
                    variation = random.uniform(0.6, 1.4)  # ±40% variation
                elif distance < 1000:  # Medium routes
                    base_cost = 3500
                    distance_cost = int(distance * 8)
                    total_cost = base_cost + distance_cost
                    variation = random.uniform(0.7, 1.3)  # ±30% variation
                else:  # Long routes
                    base_cost = 6000
                    distance_cost = int(distance * 6)
                    total_cost = base_cost + distance_cost
                    variation = random.uniform(0.8, 1.2)  # ±20% variation
                
                # Apply the variation
                route['cost'] = int(total_cost * variation)
                
                # More extreme express flight variations
                if random.random() < 0.5:  # 50% chance of being an express route
                    speed_factor = random.uniform(0.5, 0.65)  # 35-50% faster
                    cost_factor = random.uniform(1.8, 2.2)  # 80-120% more expensive
                    route['cost'] = int(route['cost'] * cost_factor)
                    route['distance'] = distance * speed_factor
                else:
                    route['distance'] = distance * random.uniform(1.1, 1.3)  # 10-30% slower
        
        # Save the new data
        data['routes'] = new_routes
        with open('data/reduced_map_data.json', 'w') as f:
            json.dump(data, f, indent=2)
        
        print(f"Saved reduced route network to data/reduced_map_data.json")
        print("To use the new data, edit main.py to load from reduced_map_data.json instead of map_data.json")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()
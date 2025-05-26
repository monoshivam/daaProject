import json
import os

# Load the data from the JSON file
with open('data/data.json', 'r') as f:
    data = json.load(f)

# Extract unique airports
airports = {}
for route in data:
    # Extract origin airport
    airport_code = route['origin_airport']
    if airport_code not in airports:
        airports[airport_code] = {
            'id': airport_code,
            'name': f"{airport_code} ({route['origin_state']})",
            'state': route['origin_state']
        }
    
    # Extract destination airport
    airport_code = route['destination_airport']
    if airport_code not in airports:
        airports[airport_code] = {
            'id': airport_code,
            'name': f"{airport_code} ({route['destination_state']})",
            'state': route['destination_state']
        }

# Print the unique airports
print(f"Found {len(airports)} unique airports:")
for code, info in sorted(airports.items()):
    print(f"{code}: {info['name']}")

# Extract routes
routes = []
for route in data:
    routes.append({
        'source': route['origin_airport'],
        'target': route['destination_airport'],
        'distance': route['distance_km'],
        'cost': route['flight_price_inr'],
        'direct': route['direct_flight'] == 'Yes'
    })

print(f"\nFound {len(routes)} routes")

# Optional: Save the extracted data to a new file
with open('data/processed_data.json', 'w') as f:
    json.dump({
        'airports': list(airports.values()),
        'routes': routes
    }, f, indent=2)

print("\nData saved to 'data/processed_data.json'")
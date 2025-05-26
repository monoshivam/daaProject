import json
import random
import math

# Define approximate geographic coordinates for each airport in India
# These are rough estimates based on the general locations of major airports in India
AIRPORT_COORDINATES = {
    "AMD": {"lat": 23.0216, "lng": 72.5722, "name": "Ahmedabad Airport"},  # Ahmedabad
    "BBI": {"lat": 20.2475, "lng": 85.8167, "name": "Bhubaneswar Airport"},  # Bhubaneswar
    "BLR": {"lat": 13.1986, "lng": 77.7066, "name": "Bengaluru Airport"},  # Bengaluru
    "BOM": {"lat": 19.0895, "lng": 72.8656, "name": "Mumbai Airport"},  # Mumbai
    "CCU": {"lat": 22.6547, "lng": 88.4467, "name": "Kolkata Airport"},  # Kolkata
    "COK": {"lat": 9.9978, "lng": 76.2714, "name": "Kochi Airport"},  # Kochi
    "GAU": {"lat": 26.1060, "lng": 91.5864, "name": "Guwahati Airport"},  # Guwahati
    "GOX": {"lat": 15.3808, "lng": 73.8314, "name": "Goa Airport"},  # Goa
    "HYD": {"lat": 17.2403, "lng": 78.4294, "name": "Hyderabad Airport"},  # Hyderabad
    "IDR": {"lat": 22.7220, "lng": 75.8011, "name": "Indore Airport"},  # Indore
    "IMF": {"lat": 24.7641, "lng": 93.8977, "name": "Imphal Airport"},  # Imphal
    "IXA": {"lat": 23.8877, "lng": 91.2404, "name": "Agartala Airport"},  # Agartala
    "IXR": {"lat": 23.3148, "lng": 85.3213, "name": "Ranchi Airport"},  # Ranchi
    "JAI": {"lat": 26.8240, "lng": 75.8120, "name": "Jaipur Airport"},  # Jaipur
    "LKO": {"lat": 26.7606, "lng": 80.8893, "name": "Lucknow Airport"},  # Lucknow
    "MAA": {"lat": 12.9941, "lng": 80.1709, "name": "Chennai Airport"},  # Chennai
    "NAG": {"lat": 21.0920, "lng": 79.0493, "name": "Nagpur Airport"},  # Nagpur
    "PAT": {"lat": 25.5941, "lng": 85.0880, "name": "Patna Airport"},  # Patna
    "PNQ": {"lat": 18.5813, "lng": 73.9091, "name": "Pune Airport"},  # Pune
    "RPR": {"lat": 21.1795, "lng": 81.7386, "name": "Raipur Airport"},  # Raipur
    "SHL": {"lat": 25.5690, "lng": 91.9549, "name": "Shillong Airport"},  # Shillong
    "TRV": {"lat": 8.4855, "lng": 76.9200, "name": "Trivandrum Airport"},  # Trivandrum
    "VTZ": {"lat": 17.7266, "lng": 83.2248, "name": "Visakhapatnam Airport"}  # Visakhapatnam
}

# Convert geographic coordinates to map positions (scaling to fit our visualization)
def geo_to_map_coordinates(airports, map_width=800, map_height=600, padding=50):
    # Find the bounds of our coordinates
    min_lat = min(airport["lat"] for airport in airports.values())
    max_lat = max(airport["lat"] for airport in airports.values())
    min_lng = min(airport["lng"] for airport in airports.values())
    max_lng = max(airport["lng"] for airport in airports.values())
    
    # Calculate scaling factors
    lat_range = max_lat - min_lat
    lng_range = max_lng - min_lng
    
    width_scaling = (map_width - 2 * padding) / lng_range
    height_scaling = (map_height - 2 * padding) / lat_range
    
    # Convert geographic coordinates to map positions
    map_positions = {}
    for code, airport in airports.items():
        x = padding + (airport["lng"] - min_lng) * width_scaling
        # Invert y-axis because map coordinates increase from top to bottom
        y = map_height - (padding + (airport["lat"] - min_lat) * height_scaling)
        map_positions[code] = {
            "id": code,
            "name": airport["name"],
            "x": int(x),
            "y": int(y),
            "lat": airport["lat"],
            "lng": airport["lng"]
        }
    
    return map_positions

def main():
    # Generate map positions for each airport
    map_positions = geo_to_map_coordinates(AIRPORT_COORDINATES)
    
    # Load routes data
    try:
        with open('data/processed_data.json', 'r') as f:
            data = json.load(f)
            
        # Update the airports with the map positions
        for i, airport in enumerate(data['airports']):
            airport_code = airport['id']
            if airport_code in map_positions:
                data['airports'][i].update({
                    "x": map_positions[airport_code]["x"],
                    "y": map_positions[airport_code]["y"],
                    "lat": map_positions[airport_code]["lat"],
                    "lng": map_positions[airport_code]["lng"],
                    "name": map_positions[airport_code]["name"]
                })
            else:
                print(f"Warning: No coordinates found for airport {airport_code}")
        
        # Save the updated data back to a file
        with open('data/map_data.json', 'w') as f:
            json.dump(data, f, indent=2)
            
        print("Map coordinates added to airports and saved to 'data/map_data.json'")
    
    except Exception as e:
        print(f"Error processing data: {e}")
        
if __name__ == "__main__":
    main()
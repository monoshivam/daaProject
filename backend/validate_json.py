import json
import os
import sys

def validate_json_file(file_path):
    """
    Validates a JSON file to ensure it is properly formatted.
    Prints information about the file's structure.
    """
    print(f"Validating JSON file: {file_path}")
    
    # Check if file exists
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} does not exist.")
        return False
    
    # Check file size
    file_size = os.path.getsize(file_path)
    print(f"File size: {file_size} bytes")
    
    try:
        # Read the file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Parse the JSON
        data = json.loads(content)
        
        # Check structure
        if isinstance(data, dict):
            print(f"JSON is a dictionary with {len(data)} top-level keys")
            for key in data:
                print(f"  - {key}: {type(data[key]).__name__}")
                
            # Check for GeoJSON structure
            if "type" in data and data["type"] == "FeatureCollection" and "features" in data:
                features = data["features"]
                print(f"GeoJSON FeatureCollection with {len(features)} features")
                
                if features:
                    sample_feature = features[0]
                    if "geometry" in sample_feature:
                        geom_type = sample_feature["geometry"].get("type", "Unknown")
                        print(f"  - Sample feature has geometry type: {geom_type}")
                    else:
                        print("  - Warning: Sample feature has no geometry")
        elif isinstance(data, list):
            print(f"JSON is a list with {len(data)} items")
            if data:
                print(f"  - First item type: {type(data[0]).__name__}")
        else:
            print(f"JSON is a {type(data).__name__}")
        
        print("JSON validation successful!")
        return True
        
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format at line {e.lineno}, column {e.colno}: {e.msg}")
        print(f"Context: {content[max(0, e.pos-30):min(len(content), e.pos+30)]}")
        return False
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    # Use command line argument if provided, otherwise use default path
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        file_path = os.path.join(os.path.dirname(__file__), "data", "in.json")
    
    validate_json_file(file_path)
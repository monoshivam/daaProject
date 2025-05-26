import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

export default function FlightMap({
  airports,
  routes,
  path,
  sourceAirport,
  destAirport,
  layoverAirport,
  handleAirportClick,
  width = "100%",
  height = "100%",
}) {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [mapData, setMapData] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const svgRef = useRef(null);

  // Get map dimensions
  useEffect(() => {
    if (!svgRef.current) return;
    const containerBox = svgRef.current.getBoundingClientRect();
    setDimensions({ 
      width: containerBox.width || 800, 
      height: containerBox.height || 600 
    });
  }, []);

  // Load India map data
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setMapLoading(true);
        const response = await fetch('http://localhost:8000/india-map');
        if (!response.ok) {
          throw new Error("Failed to fetch India map data");
        }
        const geojson = await response.json();
        setMapData(geojson);
        setMapLoading(false);
      } catch (err) {
        console.error("Error fetching India map:", err);
        setMapError(err.message);
        setMapLoading(false);
      }
    };

    fetchMapData();
  }, []);

  // Render the map and airports
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const zoomGroup = svg.append("g")
      .attr("id", "map-container");
      
    const mapGroup = zoomGroup.append("g")
      .attr("class", "map-group");
    
    const g = zoomGroup.append("g")
      .attr("class", "content-group");
    
    // Create projection for all geographic elements
    const projection = d3.geoMercator()
      .center([82, 23]) // Centered on India's approximate center
      .scale(dimensions.width * 1.3)
      .translate([dimensions.width / 2, dimensions.height / 2]);
    
    // Draw the India map if data is available
    if (mapData && mapData.features) {
      // Create a path generator
      const path = d3.geoPath().projection(projection);
      
      // Draw the map
      mapGroup.selectAll("path.india-map")
        .data(mapData.features)
        .enter()
        .append("path")
        .attr("class", "india-map")
        .attr("d", path)
        .attr("fill", "#e0e0e0")
        .attr("stroke", "#999")
        .attr("stroke-width", 0.5);
    }
    
    if (airports.length === 0 || routes.length === 0) return;

    // Map airports' geographic coordinates to screen coordinates
    const mappedAirports = airports.map(airport => {
      if (airport.lat && airport.lng) {
        const [x, y] = projection([airport.lng, airport.lat]);
        return {
          ...airport,
          projectedX: x,
          projectedY: y
        };
      }
      return airport;
    });

    // Draw routes using the projected coordinates
    g.selectAll("line.route")
      .data(routes)
      .enter()
      .append("line")
      .attr("class", "route")
      .attr("x1", (d) => {
        const source = mappedAirports.find((a) => a.id === d.source);
        return source.projectedX || source.x || 0;
      })
      .attr("y1", (d) => {
        const source = mappedAirports.find((a) => a.id === d.source);
        return source.projectedY || source.y || 0;
      })
      .attr("x2", (d) => {
        const target = mappedAirports.find((a) => a.id === d.target);
        return target.projectedX || target.x || 0;
      })
      .attr("y2", (d) => {
        const target = mappedAirports.find((a) => a.id === d.target);
        return target.projectedY || target.y || 0;
      })
      .attr("stroke", "#aaa")
      .attr("stroke-width", 1);

    // Draw the path if it exists
    if (path.length > 1) {
      for (let i = 0; i < path.length - 1; i++) {
        const currentAirportId = path[i];
        const nextAirportId = path[i + 1];

        const sourceAirport = mappedAirports.find((a) => a.id === currentAirportId);
        const targetAirport = mappedAirports.find((a) => a.id === nextAirportId);

        if (sourceAirport && targetAirport) {
          g.append("line")
            .attr("class", "path-highlight")
            .attr("x1", sourceAirport.projectedX || sourceAirport.x)
            .attr("y1", sourceAirport.projectedY || sourceAirport.y)
            .attr("x2", targetAirport.projectedX || targetAirport.x)
            .attr("y2", targetAirport.projectedY || targetAirport.y)
            .attr("stroke", "#ff6b6b")
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", "5,5");
        }
      }
    }

    // Draw airport nodes
    const airportNodes = g
      .selectAll("g.airport")
      .data(mappedAirports)
      .enter()
      .append("g")
      .attr("class", "airport")
      .attr("transform", (d) => `translate(${d.projectedX || d.x}, ${d.projectedY || d.y})`)
      .on("click", (event, d) => handleAirportClick(d));

    airportNodes
      .append("circle")
      .attr("r", (d) => {
        if (sourceAirport && d.id === sourceAirport.id) return 8;
        if (destAirport && d.id === destAirport.id) return 8;
        if (layoverAirport && d.id === layoverAirport.id) return 8;
        return 5;
      })
      .attr("fill", (d) => {
        if (sourceAirport && d.id === sourceAirport.id) return "#4caf50";
        if (destAirport && d.id === destAirport.id) return "#f44336";
        if (layoverAirport && d.id === layoverAirport.id) return "#eab308";
        return "#3498db";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    airportNodes
      .append("text")
      .attr("dy", 14)
      .attr("text-anchor", "middle")
      .text((d) => d.id)
      .attr("font-size", "9px")
      .attr("font-weight", (d) => {
        if (sourceAirport && d.id === sourceAirport.id) return "bold";
        if (destAirport && d.id === destAirport.id) return "bold";
        if (layoverAirport && d.id === layoverAirport.id) return "bold";
        return "normal";
      })
      .attr("fill", "#333");

    // Set up zoom behavior and initial fit
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 5])
      .on("zoom", ({ transform }) => {
        zoomGroup.attr("transform", transform);
      });

    svg.call(zoom);
    
    // Fit map to screen immediately
    const bounds = mapGroup.node().getBBox();
    const parent = svg.node().parentElement;
    const fullWidth = parent.clientWidth;
    const fullHeight = parent.clientHeight;
    
    const scale = Math.min(
      0.9 * fullWidth / bounds.width,
      0.9 * fullHeight / bounds.height
    );
    
    const translateX = fullWidth / 2 - (bounds.x + bounds.width / 2) * scale;
    const translateY = fullHeight / 2 - (bounds.y + bounds.height / 2) * scale;
    
    svg.call(
      zoom.transform,
      d3.zoomIdentity
        .translate(translateX, translateY)
        .scale(scale)
    );
  }, [airports, routes, sourceAirport, destAirport, layoverAirport, path, handleAirportClick, dimensions, mapData]);

  if (mapLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-orange-500 border-r-green-500 border-b-orange-500 border-l-green-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading India map...</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center bg-white p-4 rounded-lg shadow-md">
          <div className="text-red-500 mb-2">Error loading map:</div>
          <p className="text-gray-700">{mapError}</p>
          <p className="text-sm text-gray-500 mt-2">Please check the backend server connection.</p>
        </div>
      </div>
    );
  }

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="border border-gray-300 bg-gray-50"
    />
  );
}
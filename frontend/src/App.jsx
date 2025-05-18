import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

export default function FlightRouteMap() {
  const svgRef = useRef(null);
  const [sourceAirport, setSourceAirport] = useState(null);
  const [destAirport, setDestAirport] = useState(null);
  const [preferredOption, setPreferredOption] = useState("cost");
  const [path, setPath] = useState([]);
  const [airports, setAirports] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);

  const API_URL = "http://localhost:8000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const airportsResponse = await fetch(`${API_URL}/airports`);
        if (!airportsResponse.ok) throw new Error("Failed to fetch airports");
        const airportsData = await airportsResponse.json();
        setAirports(airportsData);

        const routesResponse = await fetch(`${API_URL}/routes`);
        if (!routesResponse.ok) throw new Error("Failed to fetch routes");
        const routesData = await routesResponse.json();
        setRoutes(routesData);

        setLoading(false);
      } catch (err) {
        setError("Failed to load data from server. Please try again later.");
        setLoading(false);
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!svgRef.current || airports.length === 0 || routes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const zoomGroup = svg.append("g");
    const g = zoomGroup.append("g");

    const routeLines = g
      .selectAll("line.route")
      .data(routes)
      .enter()
      .append("line")
      .attr("class", "route")
      .attr("x1", (d) => {
        const source = airports.find((a) => a.id === d.source);
        return source ? source.x : 0;
      })
      .attr("y1", (d) => {
        const source = airports.find((a) => a.id === d.source);
        return source ? source.y : 0;
      })
      .attr("x2", (d) => {
        const target = airports.find((a) => a.id === d.target);
        return target ? target.x : 0;
      })
      .attr("y2", (d) => {
        const target = airports.find((a) => a.id === d.target);
        return target ? target.y : 0;
      })
      .attr("stroke", "#aaa")
      .attr("stroke-width", 1);

    if (path.length > 1) {
      for (let i = 0; i < path.length - 1; i++) {
        const currentAirportId = path[i];
        const nextAirportId = path[i + 1];

        const sourceAirport = airports.find((a) => a.id === currentAirportId);
        const targetAirport = airports.find((a) => a.id === nextAirportId);

        if (sourceAirport && targetAirport) {
          g.append("line")
            .attr("class", "path-highlight")
            .attr("x1", sourceAirport.x)
            .attr("y1", sourceAirport.y)
            .attr("x2", targetAirport.x)
            .attr("y2", targetAirport.y)
            .attr("stroke", "#ff6b6b")
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", "5,5");
        }
      }
    }

    const airportNodes = g
      .selectAll("g.airport")
      .data(airports)
      .enter()
      .append("g")
      .attr("class", "airport")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
      .on("click", (event, d) => handleAirportClick(d));

    airportNodes
      .append("circle")
      .attr("r", (d) => {
        if (sourceAirport && d.id === sourceAirport.id) return 12;
        if (destAirport && d.id === destAirport.id) return 12;
        return 10;
      })
      .attr("fill", (d) => {
        if (sourceAirport && d.id === sourceAirport.id) return "#4caf50";
        if (destAirport && d.id === destAirport.id) return "#f44336";
        return "#ffffff";
      })
      .attr("stroke", "#000")
      .attr("stroke-width", 1);

    airportNodes
      .append("text")
      .attr("dy", 25)
      .attr("text-anchor", "middle")
      .text((d) => d.id)
      .attr("font-size", "10px");

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 5])
      .on("zoom", ({ transform }) => {
        zoomGroup.attr("transform", transform);
      });

    svg.call(zoom);
  }, [airports, routes, sourceAirport, destAirport, path]);

  const handleAirportClick = (airport) => {
    if (!sourceAirport) {
      setSourceAirport(airport);
    } else if (!destAirport) {
      if (airport.id === sourceAirport.id) {
        return;
      }
      setDestAirport(airport);
      findShortestPath(sourceAirport.id, airport.id);
    } else {
      setSourceAirport(airport);
      setDestAirport(null);
      setPath([]);
      setTotalCost(0);
      setTotalDistance(0);
    }
  };

  const handleReset = () => {
    setSourceAirport(null);
    setDestAirport(null);
    setPath([]);
    setTotalCost(0);
    setTotalDistance(0);
    setError(null);
  };

  const togglePreference = () => {
    const newPreference = preferredOption === "cost" ? "distance" : "cost";
    setPreferredOption(newPreference);

    if (sourceAirport && destAirport) {
      console.log(`Recalculating path with preference: ${newPreference}`);
      findShortestPath(sourceAirport.id, destAirport.id, newPreference);
    }
  };

  const findShortestPath = async (
    sourceId,
    destId,
    metric = preferredOption,
  ) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        source: sourceId,
        destination: destId,
        metric: metric,
      };
      console.log("Sending request with payload:", payload);

      const response = await fetch(`${API_URL}/find-path`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to find path");
      }

      if (data.error) {
        setError(data.error);
      }

      setPath(data.path);
      setTotalCost(data.total_cost);
      setTotalDistance(data.total_distance);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      console.error("Error finding path:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Flight Route Mapping System</h1>
      </header>

      <div className="flex flex-1">
        <div className="flex-1 bg-gray-100 relative">
          {loading && (
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-10">
              <div className="bg-white p-4 rounded shadow">
                <div className="text-blue-600 font-semibold">Loading...</div>
              </div>
            </div>
          )}

          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            className="border border-gray-300 bg-gray-50"
          ></svg>

          <div className="absolute top-4 left-4 bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">Controls:</h2>
            <div className="mb-2">
              <button
                onClick={handleReset}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Reset Selection
              </button>
            </div>

            <div className="mb-2">
              <span className="mr-2">Optimization Preference:</span>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  name="toggle"
                  id="preference-toggle"
                  className="sr-only"
                  checked={preferredOption === "distance"}
                  onChange={togglePreference}
                />
                <label
                  htmlFor="preference-toggle"
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                    preferredOption === "distance"
                      ? "bg-blue-500"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                      preferredOption === "distance"
                        ? "translate-x-6"
                        : "translate-x-0"
                    }`}
                  ></span>
                </label>
              </div>
              <span>
                {preferredOption === "cost" ? "Cost" : "Time (Distance)"}
              </span>
            </div>

            <div className="mt-4">
              <div className="mb-1">
                <span className="font-semibold">Source:</span>{" "}
                {sourceAirport ? sourceAirport.name : "Not selected"}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Destination:</span>{" "}
                {destAirport ? destAirport.name : "Not selected"}
              </div>

              {path.length > 1 && (
                <div className="mt-2 border-t pt-2">
                  <div className="mb-1">
                    <span className="font-semibold">Route:</span>{" "}
                    {path.join(" → ")}
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold">Total Cost:</span> $
                    {totalCost}
                  </div>
                  <div className="mb-1">
                    <span className="font-semibold">Total Distance:</span>{" "}
                    {totalDistance} miles
                  </div>
                </div>
              )}

              {error && <div className="text-red-500 mt-2">{error}</div>}
            </div>
          </div>

          <div className="absolute bottom-4 right-4 bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Legend</h3>
            <div className="flex items-center mb-1">
              <div className="w-4 h-4 rounded-full bg-white border border-black mr-2"></div>
              <span>Airport</span>
            </div>
            <div className="flex items-center mb-1">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span>Source Airport</span>
            </div>
            <div className="flex items-center mb-1">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
              <span>Destination Airport</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-1 bg-red-400 mr-2 border-dashed"></div>
              <span>Optimal Route</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-200 p-2 text-center text-sm">
        <p>Flight Route Mapping System - Data Algorithms Project</p>
      </footer>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import FlightMap from "./components/FlightMap";
import LoadingOverlay from "./components/LoadingOverlay";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import MapLegend from "./components/MapLegend";
import HowToUse from "./components/HowToUse";
import { getAirports, getRoutes, findShortestPath as apiGetPath } from "./services/apiService";

export default function FlightRouteMap() {
  // Set the document title
  useEffect(() => {
    document.title = "Indian Flight Route Mapping System";
  }, []);
  const [sourceAirport, setSourceAirport] = useState(null);
  const [destAirport, setDestAirport] = useState(null);
  const [layoverAirport, setLayoverAirport] = useState(null);
  const [preferredOption, setPreferredOption] = useState("cost");
  const [path, setPath] = useState([]);
  const [airports, setAirports] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [dataReady, setDataReady] = useState(false);

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Make sure backend server is running
        console.log("Fetching airport and route data...");
        
        const [airportsData, routesData] = await Promise.all([
          getAirports(),
          getRoutes()
        ]);

        console.log(`Received ${airportsData.length} airports and ${routesData.length} routes`);
        
        if (airportsData.length === 0 || routesData.length === 0) {
          setError("No airports or routes data available. Please check the backend server.");
          setLoading(false);
          return;
        }

        setAirports(airportsData);
        setRoutes(routesData);
        setDataReady(true);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data from server. Please make sure the backend is running at http://localhost:8000");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Find the shortest path between airports
  const findShortestPath = useCallback(async (
    sourceId,
    destId,
    metric = preferredOption,
    layoverId = null,
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Finding path from ${sourceId} to ${destId} via ${layoverId} with metric: ${metric}`);
      
      const data = await apiGetPath(sourceId, destId, metric, layoverId);
      
      if (data.error) {
        setError(data.error);
        setPath([]);
        setTotalCost(0);
        setTotalDistance(0);
        setTotalTime(0);
      } else {
        setPath(data.path);
        setTotalCost(data.total_cost);
        setTotalDistance(data.total_distance);
        setTotalTime(data.total_time);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setPath([]);
      setTotalCost(0);
      setTotalDistance(0);
      setTotalTime(0);
      setLoading(false);
      console.error("Error finding path:", err);
    }
  }, [preferredOption]);

  // Handle airport click
  const handleAirportClick = useCallback((airport) => {
    if (!sourceAirport) {
      setSourceAirport(airport);
    } else if (!destAirport) {
      if (airport.id === sourceAirport.id) {
        return; // Can't select same airport as source and destination
      }
      setDestAirport(airport);
      findShortestPath(sourceAirport.id, airport.id);
    } else {
      // Reset and start new selection
      setSourceAirport(airport);
      setDestAirport(null);
      setPath([]);
      setTotalCost(0);
      setTotalDistance(0);
      setTotalTime(0);
    }
  }, [sourceAirport, destAirport, findShortestPath]);

  // Reset all selections
  const handleReset = useCallback(() => {
    setSourceAirport(null);
    setDestAirport(null);
    setLayoverAirport(null);
    setPath([]);
    setTotalCost(0);
    setTotalDistance(0);
    setTotalTime(0);
    setError(null);
  }, []);

  // Toggle between cost and distance preference
  const togglePreference = useCallback(() => {
    const newPreference = preferredOption === "cost" ? "distance" : "cost";
    setPreferredOption(newPreference);

    if (sourceAirport && destAirport) {
      console.log(`Recalculating path with preference: ${newPreference}`);
      findShortestPath(sourceAirport.id, destAirport.id, newPreference, layoverAirport?.id);
    }
  }, [preferredOption, sourceAirport, destAirport, layoverAirport, findShortestPath]);

  // Update path when layover changes
  useEffect(() => {
    if (sourceAirport && destAirport && layoverAirport) {
      console.log(`Recalculating path with layover: ${layoverAirport.id}`);
      findShortestPath(sourceAirport.id, destAirport.id, preferredOption, layoverAirport.id);
    }
  }, [layoverAirport, sourceAirport, destAirport, preferredOption, findShortestPath]);

  // Handle critical errors that prevent the app from working
  if (error && !dataReady) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <Header title="Indian Flight Route Mapping System" />
        
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h2>
            <p className="text-gray-700 mb-4">{error}</p>
            <ul className="text-sm text-gray-600 list-disc pl-5 mb-4">
              <li>Make sure the backend server is running</li>
              <li>Check that the backend is accessible at http://localhost:8000</li>
              <li>Verify that the data files exist in the backend/data directory</li>
            </ul>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            >
              Retry
            </button>
          </div>
        </div>
        
        <Footer text="Indian Flight Route Mapping System - Design & Analysis of Algorithms Project" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header title="Indian Flight Route Mapping System" />

      <div className="flex flex-1">
        <div className="w-80 h-full shadow-lg z-10">
          <Sidebar 
            handleReset={handleReset}
            preferredOption={preferredOption}
            togglePreference={togglePreference}
            sourceAirport={sourceAirport}
            destAirport={destAirport}
            layoverAirport={layoverAirport}
            setSourceAirport={setSourceAirport}
            setDestAirport={setDestAirport}
            setLayoverAirport={setLayoverAirport}
            path={path}
            totalCost={totalCost}
            totalDistance={totalDistance}
            totalTime={totalTime}
            error={error}
            airports={airports}
            findShortestPath={findShortestPath}
          />
        </div>
        <div className="flex-1 bg-gray-50 relative">
          <LoadingOverlay isLoading={loading} />

          {dataReady && (
            <FlightMap
              airports={airports}
              routes={routes}
              path={path}
              sourceAirport={sourceAirport}
              destAirport={destAirport}
              layoverAirport={layoverAirport}
              handleAirportClick={handleAirportClick}
            />
          )}
          
          <div className="absolute top-4 right-4">
            <HowToUse />
          </div>
          <div className="absolute bottom-4 right-4">
            <MapLegend />
          </div>
        </div>
      </div>

      <Footer text="Indian Flight Route Mapping System - Design & Analysis of Algorithms Project" />
    </div>
  );
}
import React from "react";
import ControlPanel from "./ControlPanel";
import AirportSelector from "./AirportSelector";

const Sidebar = ({
  handleReset,
  preferredOption,
  togglePreference,
  sourceAirport,
  destAirport,
  layoverAirport,
  setSourceAirport,
  setDestAirport,
  setLayoverAirport,
  path,
  totalCost,
  totalDistance,
  totalTime,
  error,
  airports,
  findShortestPath
}) => {
  const handleFindPath = () => {
    if (sourceAirport && destAirport) {
      console.log(`Finding path from ${sourceAirport.id} to ${destAirport.id} via ${layoverAirport?.id || 'direct'}`);
      findShortestPath(
        sourceAirport.id,
        destAirport.id,
        preferredOption,
        layoverAirport?.id || null
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-72 h-full overflow-y-auto transition-all duration-300 ease-in-out">
      <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-green-50">
        <h2 className="text-xl font-semibold text-gray-800">Indian Flights</h2>
        <p className="text-sm text-gray-500">Select airports to find optimal routes</p>
      </div>

      <div className="p-5">
        <div className="mb-5">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Airport Selection</h3>
          
          <div className="space-y-4">
            <div className="mb-3">
              <AirportSelector
                label="Source Airport"
                value={sourceAirport}
                onChange={setSourceAirport}
                airports={airports}
                excludeAirports={[destAirport?.id, layoverAirport?.id]}
              />
            </div>

            <div className="mb-3">
              <AirportSelector
                label="Middle / Layover Airport"
                value={layoverAirport}
                onChange={setLayoverAirport}
                airports={airports}
                excludeAirports={[sourceAirport?.id, destAirport?.id]}
                optional={true}
              />
            </div>

            <div className="mb-4">
              <AirportSelector
                label="Destination Airport"
                value={destAirport}
                onChange={setDestAirport}
                airports={airports}
                excludeAirports={[sourceAirport?.id, layoverAirport?.id]}
              />
            </div>
          </div>
        </div>

        <div className="mb-5 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Optimization Preference</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Optimize for:</span>
            <div className="flex items-center">
              <span className={`mr-2 text-sm ${preferredOption === "cost" ? "font-medium text-orange-600" : "text-gray-500"}`}>Cost</span>
              <button
                onClick={togglePreference}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                  preferredOption === "distance" ? "bg-green-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    preferredOption === "distance" ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className={`ml-2 text-sm ${preferredOption === "distance" ? "font-medium text-green-600" : "text-gray-500"}`}>Time</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex space-x-2 mb-4">
            <button
              onClick={handleFindPath}
              disabled={!sourceAirport || !destAirport}
              className={`flex-1 py-2 px-4 text-white rounded-md text-sm ${
                sourceAirport && destAirport 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Find Route
            </button>
            
            <button
              onClick={handleReset}
              className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Reset
            </button>
          </div>

          {error && (
            <div className="text-red-600 text-sm mb-4 p-2 bg-red-50 border border-red-100 rounded">
              {error}
            </div>
          )}

          {path.length > 0 && !error && (
            <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Route</div>
                <div className="text-sm font-medium text-gray-800 break-words">
                  {path.join(" → ")}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Total Cost</div>
                  <div className="text-orange-600 font-medium">₹{Math.round(totalCost)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Flight Time</div>
                  <div className="text-green-600 font-medium">
                    {totalTime < 1 
                      ? `${Math.round(totalTime * 60)} mins` 
                      : `${Math.floor(totalTime)}h ${Math.round((totalTime % 1) * 60)}m`}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
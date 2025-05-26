import { memo } from "react";

const ControlPanel = ({
  handleReset,
  preferredOption,
  togglePreference,
  sourceAirport,
  destAirport,
  layoverAirport,
  path,
  totalCost,
  totalDistance,
  totalTime,
  error,
  findShortestPath
}) => {
  const handleFindPath = () => {
    if (sourceAirport && destAirport) {
      findShortestPath(sourceAirport.id, destAirport.id, preferredOption, layoverAirport?.id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={togglePreference}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          Optimize for: {preferredOption === "cost" ? "Cost" : "Time"}
        </button>

        <button
          onClick={handleReset}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          Reset
        </button>
      </div>

      <button
        onClick={handleFindPath}
        disabled={!sourceAirport || !destAirport}
        className={`w-full py-2 px-4 text-white rounded-md text-sm ${
          sourceAirport && destAirport 
            ? 'bg-orange-600 hover:bg-orange-700' 
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        Find Optimal Route
      </button>

      {error && (
        <div className="text-red-600 text-sm mt-2">{error}</div>
      )}

      {path.length > 0 && !error && (
        <div className="mt-4 space-y-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Route</div>
            <div className="text-sm font-medium">
              {path.join(" → ")}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">Total Cost</div>
              <div className="text-orange-600 font-medium">₹{totalCost}</div>
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
  );
};

export default memo(ControlPanel);
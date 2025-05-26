import { memo } from "react";

const MapLegend = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h3 className="font-semibold mb-3 text-gray-800">Legend</h3>
      <div className="flex items-center mb-2">
        <div className="w-4 h-4 rounded-full bg-blue-500 border border-white mr-2"></div>
        <span className="text-sm">Indian Airport</span>
      </div>
      <div className="flex items-center mb-2">
        <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
        <span className="text-sm">Middle/Layover Airport</span>
      </div>
      <div className="flex items-center mb-2">
        <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
        <span className="text-sm">Source Airport</span>
      </div>
      <div className="flex items-center mb-2">
        <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
        <span className="text-sm">Destination Airport</span>
      </div>
      <div className="flex items-center mb-2">
        <div className="w-8 h-1 bg-red-400 mr-2" style={{ borderTop: '2px dashed #f87171' }}></div>
        <span className="text-sm">Optimal Route</span>
      </div>
      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500">Map showing Indian airports and flight routes</div>
      </div>
    </div>
  );
};

export default memo(MapLegend);
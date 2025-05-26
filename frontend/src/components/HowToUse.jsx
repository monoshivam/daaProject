import { memo, useState } from "react";

const HowToUse = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300">
      <div 
        className="p-3 bg-gradient-to-r from-orange-50 to-green-50 border-b border-orange-100 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-sm font-medium text-orange-700">How to Use</h3>
        <span className="text-green-500 text-sm">
          {isExpanded ? "▲" : "▼"}
        </span>
      </div>
      
      {isExpanded && (
        <div className="p-3">
          <ol className="text-xs text-gray-600 list-decimal pl-4 space-y-1">
            <li>Click on an Indian airport to select it as your source</li>
            <li>Click on another airport to select it as your destination</li>
            <li>The optimal route will be calculated automatically</li>
            <li>Toggle between cost (₹) and distance (km) optimization</li>
            <li>Click "Reset Selection" to start over</li>
            <li>Or use the search boxes to find airports by code (e.g., BOM for Mumbai)</li>
          </ol>
          <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-orange-600">
            <p>This map shows major airports across India connected by flight routes.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(HowToUse);
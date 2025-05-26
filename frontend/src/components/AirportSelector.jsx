import { useState, useEffect } from "react";

const AirportSelector = ({
  label,
  value,
  onChange,
  airports,
  excludeAirports = [],
  optional = false
}) => {
  const filteredAirports = airports.filter(airport => !excludeAirports.includes(airport.id));

  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">
        {label}
        {optional && <span className="text-gray-400 ml-1">(Optional)</span>}
      </label>
      <div className="relative">
        <select
          value={value?.id || ""}
          onChange={(e) => {
            const selectedAirport = airports.find(a => a.id === e.target.value);
            onChange(selectedAirport || null);
          }}
          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:outline-none"
        >
          <option value="">{optional ? "Select if needed" : "Select an airport"}</option>
          {filteredAirports.map((airport) => (
            <option key={airport.id} value={airport.id}>
              {airport.name} ({airport.id})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AirportSelector;
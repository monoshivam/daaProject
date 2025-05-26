import { useState } from "react";

// Airport code to full name mapping
const airportCodes = {
  "AMD": "Ahmedabad Airport (Sardar Vallabhbhai Patel International Airport)",
  "BBI": "Bhubaneswar Airport (Biju Patnaik International Airport)",
  "BLR": "Bengaluru Airport (Kempegowda International Airport)",
  "BOM": "Mumbai Airport (Chhatrapati Shivaji Maharaj International Airport)",
  "CCU": "Kolkata Airport (Netaji Subhas Chandra Bose International Airport)",
  "COK": "Kochi Airport (Cochin International Airport)",
  "GAU": "Guwahati Airport (Lokpriya Gopinath Bordoloi International Airport)",
  "GOX": "Goa Airport (Dabolim Airport/Manohar International Airport)",
  "HYD": "Hyderabad Airport (Rajiv Gandhi International Airport)",
  "IDR": "Indore Airport (Devi Ahilyabai Holkar Airport)",
  "IMF": "Imphal Airport (Bir Tikendrajit International Airport)",
  "IXA": "Agartala Airport (Maharaja Bir Bikram Airport)",
  "IXR": "Ranchi Airport (Birsa Munda Airport)",
  "JAI": "Jaipur Airport (Jaipur International Airport)",
  "LKO": "Lucknow Airport (Chaudhary Charan Singh International Airport)",
  "MAA": "Chennai Airport (Chennai International Airport)",
  "NAG": "Nagpur Airport (Dr. Babasaheb Ambedkar International Airport)",
  "PAT": "Patna Airport (Jay Prakash Narayan International Airport)",
  "PNQ": "Pune Airport (Pune International Airport)",
  "RPR": "Raipur Airport (Swami Vivekananda Airport)",
  "SHL": "Shillong Airport (Shillong Airport)",
  "TRV": "Trivandrum Airport (Thiruvananthapuram International Airport)",
  "VTZ": "Visakhapatnam Airport (Visakhapatnam Airport)"
};

// States where the airports are located
const airportStates = {
  "AMD": "Gujarat",
  "BBI": "Odisha",
  "BLR": "Karnataka",
  "BOM": "Maharashtra",
  "CCU": "West Bengal",
  "COK": "Kerala",
  "GAU": "Assam",
  "GOX": "Goa",
  "HYD": "Telangana",
  "IDR": "Madhya Pradesh",
  "IMF": "Manipur",
  "IXA": "Tripura",
  "IXR": "Jharkhand",
  "JAI": "Rajasthan",
  "LKO": "Uttar Pradesh",
  "MAA": "Tamil Nadu",
  "NAG": "Maharashtra",
  "PAT": "Bihar",
  "PNQ": "Maharashtra",
  "RPR": "Chhattisgarh",
  "SHL": "Meghalaya",
  "TRV": "Kerala",
  "VTZ": "Andhra Pradesh"
};

const AirportInfoTooltip = ({ airportCode }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  if (!airportCode) return null;
  
  const fullName = airportCodes[airportCode] || `${airportCode} Airport`;
  const state = airportStates[airportCode] || "";
  
  return (
    <div className="relative inline-block">
      <span 
        className="cursor-help underline dotted text-orange-600"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {airportCode}
      </span>
      
      {isVisible && (
        <div className="absolute z-50 w-64 p-2 bg-white rounded-md shadow-lg border border-gray-200 text-sm left-0 top-full mt-1">
          <div className="font-medium">{fullName}</div>
          {state && <div className="text-gray-500 text-xs mt-1">Located in {state}</div>}
        </div>
      )}
    </div>
  );
};

export default AirportInfoTooltip;
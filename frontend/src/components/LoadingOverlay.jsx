import { memo } from "react";

const LoadingOverlay = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-orange-500 border-r-green-500 border-b-orange-500 border-l-green-500 rounded-full animate-spin mb-4"></div>
          <div className="text-orange-600 font-semibold text-lg">Loading Indian Flight Data...</div>
          <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the latest information</p>
        </div>
      </div>
    </div>
  );
};

export default memo(LoadingOverlay);
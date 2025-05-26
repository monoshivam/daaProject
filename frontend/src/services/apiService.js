const API_URL = "http://localhost:8000";

/**
 * Fetches data from the API
 * @param {string} endpoint - The API endpoint to fetch from
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} - The response data
 */
async function fetchData(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'An error occurred');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Gets all airports
 * @returns {Promise<Array>} List of airports
 */
export const getAirports = () => {
  return fetchData('/airports');
};

/**
 * Gets all routes
 * @returns {Promise<Array>} List of routes
 */
export const getRoutes = () => {
  return fetchData('/routes');
};

/**
 * Finds the shortest path between two airports
 * @param {string} sourceId - Source airport ID
 * @param {string} destId - Destination airport ID
 * @param {string} metric - Optimization metric (cost or distance)
 * @param {string|null} layoverId - Optional layover airport ID
 * @returns {Promise<Object>} Path result including path, total_cost, and total_distance
 */
export const findShortestPath = (sourceId, destId, metric = "cost", layoverId = null) => {
  return fetchData('/find-path', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: sourceId,
      destination: destId,
      metric,
      layover: layoverId,
    }),
  });
};

export default {
  getAirports,
  getRoutes,
  findShortestPath,
};
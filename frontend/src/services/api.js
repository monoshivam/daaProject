const API_BASE_URL = "http://localhost:8000";

export const getAirports = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/airports`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching airports:", error);
    throw error;
  }
};

export const getRoutes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/routes`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching routes:", error);
    throw error;
  }
};

export const apiGetPath = async (source, destination, metric = "cost", layover = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/find-path`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source,
        destination,
        metric,
        layover,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching path:", error);
    throw error;
  }
}; 
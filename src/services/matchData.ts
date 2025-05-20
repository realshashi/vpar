const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const matchDataService = {
  async getMatchStatus(eventId: string) {
    try {
      const response = await fetch(`${API_URL}/matches/${eventId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching match status:", error);
      throw error;
    }
  },

  async subscribeToMatchUpdates(eventId: string) {
    try {
      const response = await fetch(`${API_URL}/matches/${eventId}/subscribe`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error("Error subscribing to match updates:", error);
      throw error;
    }
  },
};

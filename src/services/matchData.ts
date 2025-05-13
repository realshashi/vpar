const API_URL = import.meta.env.VITE_API_URL;

export const matchDataService = {
  async getMatchStatus(eventId: string) {
    const response = await fetch(`${API_URL}/matches/${eventId}`);
    return response.json();
  },

  async subscribeToMatchUpdates(eventId: string) {
    const response = await fetch(`${API_URL}/matches/${eventId}/subscribe`, {
      method: 'POST',
    });
    return response.json();
  },
};
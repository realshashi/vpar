import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { Calendar, Clock } from "lucide-react";
import { SportEvent } from "../types";

const EventList = () => {
  const { events } = useStore();

  useEffect(() => {
    // TODO: Fetch events from API
    // For now, we'll use mock data
    const mockEvents: SportEvent[] = [
      {
        id: "1",
        name: "Premier League: Arsenal vs Chelsea",
        teamA: "Arsenal",
        teamB: "Chelsea",
        startTime: new Date("2025-03-20T15:00:00"),
        status: "upcoming",
        odds: { teamA: 1.95, teamB: 2.05 },
        tokenAddresses: {
          teamA: "token_address_1",
          teamB: "token_address_2",
        },
        description: "Premier League match between Arsenal and Chelsea",
        category: "sports",
      },
      // Add more mock events as needed
    ];
    useStore.getState().setEvents(mockEvents);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Upcoming Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Link
            key={event.id}
            to={`/event/${event.id}`}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">{event.name}</h2>
              <div className="flex items-center space-x-2 text-gray-600 mb-4">
                <Calendar className="h-4 w-4" />
                <span>{new Date(event.startTime).toLocaleDateString()}</span>
                <Clock className="h-4 w-4 ml-2" />
                <span>{new Date(event.startTime).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <p className="font-medium">{event.teamA}</p>
                  <p className="text-indigo-600">Odds: {event.odds.teamA}</p>
                </div>
                <div className="text-sm text-right">
                  <p className="font-medium">{event.teamB}</p>
                  <p className="text-indigo-600">Odds: {event.odds.teamB}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default EventList;

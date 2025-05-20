import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Shield, Plus, Pencil, Trash2, Clock } from "lucide-react";
import { useStore } from "../store/useStore";
import { SportEvent, EventStatus } from "../types";
import { useBettingService } from "../services/betting";

interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: number;
}

interface FormData {
  teamA: string;
  teamB: string;
  startTime: string;
  endTime: string;
  description: string;
  category: "sports" | "esports" | "other";
}

const AdminPanel = () => {
  const { publicKey } = useWallet();
  const { events, setEvents } = useStore();
  const [activeTab, setActiveTab] = useState<"create" | "manage">("create");
  const [formData, setFormData] = useState<FormData>({
    teamA: "",
    teamB: "",
    startTime: "",
    endTime: "",
    description: "",
    category: "sports" as const,
  });
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadata>({
    name: "",
    symbol: "",
    decimals: 9,
    initialSupply: 1000000,
  });
  const [selectedEvent, setSelectedEvent] = useState<SportEvent | null>(null);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;

    try {
      const bettingService = useBettingService();
      const eventAddress = await bettingService.createEvent(
        formData.teamA,
        formData.teamB,
        new Date(formData.startTime),
        formData.description,
        formData.category
      );

      // Create tokens for both teams
      const teamAToken = await createToken({
        ...tokenMetadata,
        name: `${formData.teamA} Token`,
        symbol: `${formData.teamA.slice(0, 3).toUpperCase()}`,
      });

      const teamBToken = await createToken({
        ...tokenMetadata,
        name: `${formData.teamB} Token`,
        symbol: `${formData.teamB.slice(0, 3).toUpperCase()}`,
      });

      // Create the event
      const newEvent: SportEvent = {
        id: eventAddress,
        name: `${formData.teamA} vs ${formData.teamB}`,
        teamA: formData.teamA,
        teamB: formData.teamB,
        startTime: new Date(formData.startTime),
        endTime: formData.endTime ? new Date(formData.endTime) : undefined,
        status: "upcoming" as EventStatus,
        odds: {
          teamA: 1.5,
          teamB: 1.5,
        },
        tokenAddresses: {
          teamA: teamAToken,
          teamB: teamBToken,
        },
        description: formData.description,
        category: formData.category as "sports" | "esports" | "other",
      };

      // Update store and reset form
      setEvents([...events, newEvent]);
      setFormData({
        teamA: "",
        teamB: "",
        startTime: "",
        endTime: "",
        description: "",
        category: "sports" as const,
      });
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleUpdateEvent = async (
    eventId: string,
    updates: Partial<SportEvent>
  ) => {
    try {
      const bettingService = useBettingService();
      await bettingService.updateEvent(eventId, {
        name: updates.name,
        description: updates.description,
        startTime: updates.startTime,
        status: updates.status,
      });

      const updatedEvents = events.map((event) =>
        event.id === eventId ? { ...event, ...updates } : event
      );
      setEvents(updatedEvents);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleCancelEvent = async (eventId: string) => {
    try {
      const bettingService = useBettingService();
      await bettingService.updateEvent(eventId, {
        status: "cancelled",
      });

      const updatedEvents = events.map((event) =>
        event.id === eventId
          ? { ...event, status: "cancelled" as EventStatus }
          : event
      );
      setEvents(updatedEvents);
    } catch (error) {
      console.error("Error cancelling event:", error);
    }
  };

  const handlePostponeEvent = async (eventId: string, newStartTime: Date) => {
    try {
      const bettingService = useBettingService();
      await bettingService.updateEvent(eventId, {
        startTime: newStartTime,
      });

      const updatedEvents = events.map((event) =>
        event.id === eventId ? { ...event, startTime: newStartTime } : event
      );
      setEvents(updatedEvents);
    } catch (error) {
      console.error("Error postponing event:", error);
    }
  };

  const createToken = async (metadata: TokenMetadata): Promise<string> => {
    // TODO: Implement actual token creation on Solana
    // This is a placeholder that returns a mock address
    console.log("Creating token with metadata:", metadata);
    return `mock_token_${Date.now()}`;
  };

  if (!publicKey) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">
            Admin Access Required
          </h2>
          <p className="text-gray-500 mt-2">
            Please connect your admin wallet to access this panel
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Shield className="w-4 h-4" />
          <span>
            Admin: {publicKey.toString().slice(0, 4)}...
            {publicKey.toString().slice(-4)}
          </span>
        </div>
      </div>

      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab("create")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "create"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Create Event
        </button>
        <button
          onClick={() => setActiveTab("manage")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "manage"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Manage Events
        </button>
      </div>

      {activeTab === "create" ? (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Plus className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold">Create New Event</h2>
          </div>

          <form onSubmit={handleCreateEvent} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="teamA"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Team A
                </label>
                <input
                  type="text"
                  id="teamA"
                  value={formData.teamA}
                  onChange={(e) =>
                    setFormData({ ...formData, teamA: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="teamB"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Team B
                </label>
                <input
                  type="text"
                  id="teamB"
                  value={formData.teamB}
                  onChange={(e) =>
                    setFormData({ ...formData, teamB: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="endTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  End Time
                </label>
                <input
                  type="datetime-local"
                  id="endTime"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as
                        | "sports"
                        | "esports"
                        | "other",
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="sports">Sports</option>
                  <option value="esports">Esports</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">
                Token Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="tokenName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Token Name
                  </label>
                  <input
                    type="text"
                    id="tokenName"
                    value={tokenMetadata.name}
                    onChange={(e) =>
                      setTokenMetadata({
                        ...tokenMetadata,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="tokenSymbol"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Token Symbol
                  </label>
                  <input
                    type="text"
                    id="tokenSymbol"
                    value={tokenMetadata.symbol}
                    onChange={(e) =>
                      setTokenMetadata({
                        ...tokenMetadata,
                        symbol: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="decimals"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Decimals
                  </label>
                  <input
                    type="number"
                    id="decimals"
                    value={tokenMetadata.decimals}
                    onChange={(e) =>
                      setTokenMetadata({
                        ...tokenMetadata,
                        decimals: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    min="0"
                    max="9"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="initialSupply"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Initial Supply
                  </label>
                  <input
                    type="number"
                    id="initialSupply"
                    value={tokenMetadata.initialSupply}
                    onChange={(e) =>
                      setTokenMetadata({
                        ...tokenMetadata,
                        initialSupply: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md font-semibold
              hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
              transition-colors"
            >
              Create Event
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold mb-6">Manage Events</h2>
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{event.name}</h3>
                    <p className="text-gray-600">{event.description}</p>
                    <div className="mt-2 space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {event.status}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="p-2 text-gray-600 hover:text-indigo-600"
                      title="Edit event"
                      aria-label="Edit event"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleCancelEvent(event.id)}
                      className="p-2 text-gray-600 hover:text-red-600"
                      title="Cancel event"
                      aria-label="Cancel event"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handlePostponeEvent(event.id, new Date())}
                      className="p-2 text-gray-600 hover:text-yellow-600"
                      title="Postpone event"
                      aria-label="Postpone event"
                    >
                      <Clock className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">Edit Event</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const nameInput = form.elements.namedItem(
                  "name"
                ) as HTMLInputElement;
                const descriptionInput = form.elements.namedItem(
                  "description"
                ) as HTMLTextAreaElement;
                handleUpdateEvent(selectedEvent.id, {
                  ...selectedEvent,
                  name: nameInput.value,
                  description: descriptionInput.value,
                });
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedEvent.name}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    aria-label="Event name"
                    placeholder="Enter event name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={selectedEvent.description}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    aria-label="Event description"
                    placeholder="Enter event description"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

import { useState } from "react";
import { useParams } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { useStore } from "../store/useStore";
import { Calendar, Clock, AlertCircle, Wallet } from "lucide-react";

const ADMIN_PUBLIC_KEY = import.meta.env.VITE_ADMIN_PUBLIC_KEY;

const EventDetails = () => {
  const { id } = useParams();
  const { publicKey } = useWallet();
  const { events, addBet } = useStore();
  const [betAmount, setBetAmount] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<"teamA" | "teamB" | null>(
    null
  );

  const event = events.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">Event Not Found</h2>
          <p className="text-gray-500 mt-2">
            The event you're looking for doesn't exist
          </p>
        </div>
      </div>
    );
  }

  const handlePlaceBet = async () => {
    if (!publicKey || !selectedTeam || !betAmount) return;

    try {
      // TODO: Implement actual contract interaction
      const newBet = {
        id: Math.random().toString(),
        eventId: event.id,
        amount: parseFloat(betAmount),
        selectedTeam,
        odds: selectedTeam === "teamA" ? event.odds.teamA : event.odds.teamB,
        timestamp: new Date(),
        status: "pending" as const,
      };

      addBet(newBet);
      setBetAmount("");
      setSelectedTeam(null);
    } catch (error) {
      console.error("Error placing bet:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6">{event.name}</h1>

        <div className="flex items-center space-x-4 text-gray-600 mb-6">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            <span>{new Date(event.startTime).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            <span>{new Date(event.startTime).toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedTeam === "teamA"
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-200 hover:border-indigo-300"
            }`}
            onClick={() => setSelectedTeam("teamA")}
          >
            <h3 className="text-xl font-semibold mb-2">{event.teamA}</h3>
            <p className="text-indigo-600 font-bold">
              Odds: {event.odds.teamA}
            </p>
          </div>

          <div
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedTeam === "teamB"
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-200 hover:border-indigo-300"
            }`}
            onClick={() => setSelectedTeam("teamB")}
          >
            <h3 className="text-xl font-semibold mb-2">{event.teamB}</h3>
            <p className="text-indigo-600 font-bold">
              Odds: {event.odds.teamB}
            </p>
          </div>
        </div>

        {publicKey ? (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Bet Amount (SOL)
              </label>
              <input
                type="number"
                id="amount"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter amount"
                min="0"
                step="0.1"
              />
            </div>

            <button
              onClick={handlePlaceBet}
              disabled={!selectedTeam || !betAmount}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md font-semibold
                hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Place Bet
            </button>
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Connect your wallet to place bets</p>
          </div>
        )}
      </div>

      {/* Close Orderbook Button (Admin Only) */}
      {/* TODO: Replace with real admin check */}
      {publicKey && publicKey.toString() === ADMIN_PUBLIC_KEY && (
        <div className="flex justify-end mb-4">
          <button
            className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 transition-colors"
            onClick={() => {
              // TODO: Implement backend call to close orderbook
              alert("Orderbook closed!");
            }}
          >
            Close Orderbook
          </button>
        </div>
      )}

      {/* Orderbook Section */}
      <div className="bg-white rounded-lg shadow-md p-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Orderbook</h2>
        <p className="text-gray-500">Orderbook data will appear here.</p>
      </div>
    </div>
  );
};

export default EventDetails;

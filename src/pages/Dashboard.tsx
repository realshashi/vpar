import { useWallet } from "@solana/wallet-adapter-react";
import { useStore } from "../store/useStore";
import { Wallet, Timer, Award } from "lucide-react";

const Dashboard = () => {
  const { publicKey } = useWallet();
  const { userBets } = useStore();

  const stats = {
    totalBets: userBets.length,
    activeBets: userBets.filter((bet) => bet.status === "pending").length,
    wonBets: userBets.filter((bet) => bet.status === "won").length,
  };

  if (!publicKey) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">
            Connect Your Wallet
          </h2>
          <p className="text-gray-500 mt-2">
            Please connect your wallet to view your dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">My Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Bets</p>
              <p className="text-2xl font-bold">{stats.totalBets}</p>
            </div>
            <Wallet className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Active Bets</p>
              <p className="text-2xl font-bold">{stats.activeBets}</p>
            </div>
            <Timer className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Won Bets</p>
              <p className="text-2xl font-bold">{stats.wonBets}</p>
            </div>
            <Award className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Bets</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3">Event</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Odds</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {userBets.map((bet) => (
                  <tr key={bet.id} className="border-b last:border-0">
                    <td className="py-4">{bet.eventId}</td>
                    <td className="py-4">{bet.amount} SOL</td>
                    <td className="py-4">{bet.odds}</td>
                    <td className="py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          bet.status === "won"
                            ? "bg-green-100 text-green-800"
                            : bet.status === "lost"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {bet.status.charAt(0).toUpperCase() +
                          bet.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

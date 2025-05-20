import { useWallet } from "@solana/wallet-adapter-react";
import { Award } from "lucide-react";

const ClaimRewards = ({ betId }: { betId: string }) => {
  const { publicKey } = useWallet();

  const handleClaim = async () => {
    if (!publicKey) return;

    try {
      // TODO: Implement claim_reward contract call
      console.log("Claiming rewards for bet:", betId);
    } catch (error) {
      console.error("Error claiming rewards:", error);
    }
  };

  return (
    <button
      onClick={handleClaim}
      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md
        hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
        transition-colors"
    >
      <Award className="w-5 h-5" />
      <span>Claim Rewards</span>
    </button>
  );
};

export default ClaimRewards;

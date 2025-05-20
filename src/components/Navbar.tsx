import { Link } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Trophy } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold">vpar</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-indigo-600"
            >
              Dashboard
            </Link>
            <WalletMultiButton className="!bg-indigo-600" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

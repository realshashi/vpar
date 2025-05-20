import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./components/WalletProvider";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import EventList from "./pages/EventList";
import EventDetails from "./pages/EventDetails";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<EventList />} />
              <Route path="/event/:id" element={<EventDetails />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </main>
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;

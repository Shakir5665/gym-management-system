import Members from "./pages/Members";
import Dashboard from "./pages/Dashboard";
import { useState } from "react";

function App() {
  const [selectedMember, setSelectedMember] = useState(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex align-center">

      {/* 🔥 MAIN CONTENT */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">
          Gym Management System
        </h1>

      {/* 🔥 SIDEBAR */}
      <div className="w-80 bg-gray-800 p-4 border-r border-gray-700 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Members</h2>
        <Members setSelectedMember={setSelectedMember} />
      </div>

        {selectedMember ? (
          <Dashboard memberId={selectedMember} />
        ) : (
          <p className="text-gray-400">
            Select a member to view dashboard
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
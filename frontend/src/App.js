import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import "./App.css"; 
import Login from "./login";
import HouseholdSelection from "./HouseholdSelection";

// Modern UI Components
import SidebarNavigation from "./components/dashboard/SidebarNavigation";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import StatCard from "./components/dashboard/StatCard";
import MedicineInventoryTable from "./components/dashboard/MedicineInventoryTable";
import LowStockAlerts from "./components/dashboard/LowStockAlerts";
import RecentActivityPanel from "./components/dashboard/RecentActivityPanel";
import { Package, AlertTriangle, Building2, Plus, X } from 'lucide-react';

// Import the ChatBot Component
import GeminiChat from './components/dashboard/GeminiChat';

function App() {
  // Check if API Key is loaded in console
  console.log("Gemini API Key Status:", process.env.REACT_APP_GEMINI_API_KEY ? "Loaded" : "Missing");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newStock, setNewStock] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchMedicines = async () => {
    if (!selectedMember) return;
    setLoading(true);
    try {
      const q = query(collection(db, "medicines"), where("category", "==", selectedMember.name));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMedicines(data);
    } catch (error) {
      console.error("Error fetching: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMember) {
      fetchMedicines();
    }
  }, [selectedMember]);

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    if (!newName || !newStock) return alert("Please fill all fields");
    if (!selectedMember) return alert("Please select a household member first");

    try {
      await addDoc(collection(db, "medicines"), {
        name: newName,
        stock: Number(newStock),
        category: selectedMember.name,
        timestamp: new Date(),
      });

      setNewName("");
      setNewStock("");
      setShowAddForm(false);
      fetchMedicines();
    } catch (error) {
      alert("Error adding medicine: " + error.message);
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  if (!selectedMember) {
    return <HouseholdSelection onSelectMember={setSelectedMember} onLogout={() => setIsLoggedIn(false)} />;
  }

  const lowStockCount = medicines.filter((m) => m.stock < 10 && m.stock > 0).length;
  const criticalCount = medicines.filter((m) => m.stock === 0).length;
  const totalAlerts = lowStockCount + criticalCount;

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Fixed Sidebar */}
      <SidebarNavigation activeTab="Dashboard" />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <DashboardHeader 
          selectedMember={selectedMember} 
          onSwitchProfile={() => setSelectedMember(null)} 
        />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Top Toolbar */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Overview</h2>
                <p className="text-slate-500 mt-1 text-sm">Monitor your family's healthcare inventory</p>
              </div>
              
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-blue-200 flex items-center space-x-2"
              >
                {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <span>{showAddForm ? 'Cancel' : 'Add Medicine'}</span>
              </button>
            </div>

            {/* Expandable Add Form */}
            {showAddForm && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Add New Medicine</h3>
                <form onSubmit={handleAddMedicine} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Medicine Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Paracetamol 500mg"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>
                  <div className="w-48">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock Amount</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>
                  <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors h-[46px]">
                    Save to Inventory
                  </button>
                </form>
              </div>
            )}

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Inventory" value={medicines.length} icon={Package} colorClass="bg-blue-500" highlightClass="bg-blue-500" />
              <StatCard title="Alerts (Low/Empty)" value={totalAlerts} icon={AlertTriangle} colorClass="bg-amber-500" highlightClass="bg-amber-500" />
              <StatCard title="Active Hospitals" value={12} icon={Building2} colorClass="bg-emerald-500" highlightClass="bg-emerald-500" />
            </div>

            {/* Main Content Grid: Table and Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <MedicineInventoryTable medicines={medicines} loading={loading} />
              </div>
              <div className="space-y-8">
                <LowStockAlerts medicines={medicines} />
                <RecentActivityPanel />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Renders ChatBot */}
      <GeminiChat />

    </div>
  );
}

export default App;
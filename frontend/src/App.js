import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, addDoc, updateDoc, doc, query, where, Timestamp } from "firebase/firestore";
import "./App.css";
import Login from "./login";
import HouseholdSelection from "./HouseholdSelection";

// Dashboard Components
import SidebarNavigation from "./components/dashboard/SidebarNavigation";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import StatCard from "./components/dashboard/StatCard";
import MedicineInventoryTable from "./components/dashboard/MedicineInventoryTable";
import LowStockAlerts from "./components/dashboard/LowStockAlerts";
import RecentActivityPanel from "./components/dashboard/RecentActivityPanel";
import ExpiryAlerts from "./components/dashboard/ExpiryAlerts";

// New Feature Components
import MedicineCalendar from "./components/dashboard/MedicineCalendar";
import MedicalReports from "./components/dashboard/MedicalReports";
import MedicineInsights from "./components/dashboard/MedicineInsights";
import MedicineStore from "./components/dashboard/MedicineStore";

import { Package, AlertTriangle, Building2, Plus, X, Clock, ShieldAlert, CalendarDays, AlertCircle } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import GeminiChat from './components/dashboard/GeminiChat';

const initAuth = () => {
  const authDataStr = localStorage.getItem('codecure_auth');
  if (authDataStr) {
    try {
      const authData = JSON.parse(authDataStr);
      const now = new Date().getTime();
      const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
      if (now - authData.timestamp < EXPIRY_MS && authData.isLoggedIn) {
        return true;
      } else {
        localStorage.removeItem('codecure_auth');
        localStorage.removeItem('codecure_profile');
      }
    } catch(e) {
      localStorage.removeItem('codecure_auth');
      localStorage.removeItem('codecure_profile');
    }
  }
  return false;
};

const initProfile = () => {
  const profileStr = localStorage.getItem('codecure_profile');
  if (profileStr) {
    try {
      return JSON.parse(profileStr);
    } catch(e) {
      return null;
    }
  }
  return null;
};

function App() {
  // Check if API Key is loaded in console
  console.log("Gemini API Key Status:", process.env.REACT_APP_GEMINI_API_KEY ? "Loaded" : "Missing");

  const [isLoggedIn, setIsLoggedIn] = useState(initAuth);
  const [selectedMember, setSelectedMember] = useState(initProfile);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showMedicineWarning, setShowMedicineWarning] = useState(false);
  const [warningMeds, setWarningMeds] = useState([]);

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Add medicine form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newInstructions, setNewInstructions] = useState("");
  const [newTimesPerDay, setNewTimesPerDay] = useState(1);
  const [newScheduleTimes, setNewScheduleTimes] = useState(["Morning"]);
  const [newDurationDays, setNewDurationDays] = useState("");
  const [newExpiryDate, setNewExpiryDate] = useState("");

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

      const mergedMedsMap = new Map();
      data.forEach(med => {
        const lowerName = med.name.toLowerCase();
        if (mergedMedsMap.has(lowerName)) {
          const existing = mergedMedsMap.get(lowerName);
          existing.stock += Number(med.stock || 0);
          existing.entriesCount = (existing.entriesCount || 1) + 1;
        } else {
          mergedMedsMap.set(lowerName, { ...med, stock: Number(med.stock || 0), entriesCount: 1 });
        }
      });
      setMedicines(Array.from(mergedMedsMap.values()));
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

  // Show global warning popup after medicines load
  useEffect(() => {
    if (medicines.length > 0) {
      const today = new Date();
      const criticalMeds = medicines.filter(m => {
        const isLowStock = m.stock !== undefined && m.stock < 2;
        
        let isExpiring = false;
        if (m.expiryDate) {
          const expiry = m.expiryDate.toDate ? m.expiryDate.toDate() : new Date(m.expiryDate);
          const daysLeft = differenceInDays(expiry, today);
          isExpiring = daysLeft <= 7;
        }
        
        if (isLowStock || isExpiring) {
          m.warningReason = isLowStock && isExpiring 
            ? "Low stock & expiring soon" 
            : isLowStock 
              ? "Low stock" 
              : "Expiring soon";
          return true;
        }
        return false;
      });

      if (criticalMeds.length > 0) {
        setWarningMeds(criticalMeds);
        setShowMedicineWarning(true);
      }
    }
  }, [medicines]);

  const toggleScheduleTime = (time) => {
    setNewScheduleTimes(prev => {
      if (prev.includes(time)) {
        return prev.filter(t => t !== time);
      }
      if (prev.length < newTimesPerDay) {
        return [...prev, time];
      }
      return [...prev.slice(1), time];
    });
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    if (!newName || !newStock) return alert("Please fill all required fields");
    if (!selectedMember) return alert("Please select a household member first");

    try {
      const existingMed = medicines.find(m => m.name.toLowerCase() === newName.toLowerCase());
      
      const medicineData = {
        name: existingMed ? existingMed.name : newName,
        stock: existingMed ? Number(existingMed.stock || 0) + Number(newStock) : Number(newStock),
        dosage: newDosage || "1 tablet",
        instructions: newInstructions || "with water",
        category: selectedMember.name,
        timestamp: new Date(),
        timesPerDay: Number(newTimesPerDay),
        scheduleTimes: newScheduleTimes,
        durationDays: newDurationDays ? Number(newDurationDays) : 0,
        startDate: Timestamp.now(),
        // Keep existing taken status if updating
        taken: existingMed ? existingMed.taken || {} : {},
      };

      if (newExpiryDate) {
        medicineData.expiryDate = Timestamp.fromDate(new Date(newExpiryDate));
      }

      if (existingMed) {
        // Update existing medicine
        await updateDoc(doc(db, "medicines", existingMed.id), medicineData);
      } else {
        // Add new medicine
        await addDoc(collection(db, "medicines"), medicineData);
      }

      // Reset form
      setNewName("");
      setNewStock("");
      setNewDosage("");
      setNewInstructions("");
      setNewTimesPerDay(1);
      setNewScheduleTimes(["Morning"]);
      setNewDurationDays("");
      setNewExpiryDate("");
      setShowAddForm(false);
      fetchMedicines();
    } catch (error) {
      alert("Error saving medicine: " + error.message);
    }
  };

  const handleToggleTaken = async (medicineId, dateKey, timeSlot) => {
    try {
      const med = medicines.find(m => m.id === medicineId);
      if (!med) return;

      const taken = med.taken || {};
      const dayTaken = taken[dateKey] || [];
      
      let updatedDayTaken;
      let stockChange = 0;

      if (dayTaken.includes(timeSlot)) {
        // Unmarking as taken → restore stock +1
        updatedDayTaken = dayTaken.filter(t => t !== timeSlot);
        stockChange = 1;
      } else {
        // Marking as taken → reduce stock -1
        if (med.stock <= 0) {
          alert(`${med.name} is out of stock! Please refill before taking.`);
          return;
        }
        updatedDayTaken = [...dayTaken, timeSlot];
        stockChange = -1;
      }

      const updatedTaken = { ...taken, [dateKey]: updatedDayTaken };
      const updatedStock = Math.max(0, (med.stock || 0) + stockChange);

      await updateDoc(doc(db, "medicines", medicineId), { 
        taken: updatedTaken,
        stock: updatedStock 
      });

      setMedicines(prev => prev.map(m => 
        m.id === medicineId ? { ...m, taken: updatedTaken, stock: updatedStock } : m
      ));
    } catch (error) {
      console.error("Error toggling taken:", error);
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => {
      setIsLoggedIn(true);
      localStorage.setItem('codecure_auth', JSON.stringify({ isLoggedIn: true, timestamp: new Date().getTime() }));
    }} />;
  }

  if (!selectedMember) {
    return <HouseholdSelection 
      onSelectMember={(member) => {
        setSelectedMember(member);
        localStorage.setItem('codecure_profile', JSON.stringify(member));
      }} 
      onLogout={() => {
        setIsLoggedIn(false);
        setSelectedMember(null);
        localStorage.removeItem('codecure_auth');
        localStorage.removeItem('codecure_profile');
      }} 
    />;
  }

  // Computed stats
  const lowStockCount = medicines.filter((m) => m.stock < 10 && m.stock > 0).length;
  const criticalCount = medicines.filter((m) => m.stock === 0).length;
  const totalAlerts = lowStockCount + criticalCount;
  
  const today = new Date();
  const expiringCount = medicines.filter(m => {
    if (!m.expiryDate) return false;
    const expiry = m.expiryDate.toDate ? m.expiryDate.toDate() : new Date(m.expiryDate);
    const daysLeft = differenceInDays(expiry, today);
    return daysLeft >= 0 && daysLeft <= 30;
  }).length;
  const expiredCount = medicines.filter(m => {
    if (!m.expiryDate) return false;
    const expiry = m.expiryDate.toDate ? m.expiryDate.toDate() : new Date(m.expiryDate);
    return differenceInDays(expiry, today) < 0;
  }).length;

  const scheduledToday = medicines.filter(m => {
    if (!m.startDate || !m.durationDays || !m.scheduleTimes) return false;
    const start = m.startDate.toDate ? m.startDate.toDate() : new Date(m.startDate);
    const daysElapsed = differenceInDays(today, start);
    return daysElapsed >= 0 && daysElapsed < m.durationDays;
  }).reduce((sum, m) => sum + (m.scheduleTimes?.length || 0), 0);

  const TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Night'];

  // Render page content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'Calendar':
        return (
          <MedicineCalendar 
            medicines={medicines} 
            selectedMember={selectedMember}
            onToggleTaken={handleToggleTaken}
          />
        );
      case 'Medical Reports':
        return (
          <MedicalReports selectedMember={selectedMember} />
        );
      case 'Insights':
        return (
          <MedicineInsights medicines={medicines} />
        );
      case 'Medicine Store':
        return (
          <MedicineStore />
        );
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <>
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-5">Add New Medicine</h3>
          <form onSubmit={handleAddMedicine} className="space-y-5">
            {/* Row 1: Name & Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  list="medicineNames"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    const selected = medicines.find(m => m.name.toLowerCase() === e.target.value.toLowerCase());
                    if (selected) {
                      setNewDosage(selected.dosage || '');
                      setNewInstructions(selected.instructions || '');
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                  placeholder="Enter medicine name"
                  required
                />
                <datalist id="medicineNames">
                  {medicines.map(med => (
                    <option key={med.id} value={med.name} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stock *</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dosage</label>
                <input
                  type="text"
                  placeholder="e.g. 1 tablet"
                  value={newDosage}
                  onChange={(e) => setNewDosage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Row 2: Instructions & Expiry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. with meal, with water"
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Scheduling Section */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
              <h4 className="text-sm font-semibold text-slate-800 mb-4 flex items-center space-x-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <span>Medicine Schedule</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Times Per Day</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => {
                          setNewTimesPerDay(n);
                          setNewScheduleTimes(prev => prev.slice(0, n));
                        }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          newTimesPerDay === n
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {n}x
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    placeholder="e.g. 7"
                    value={newDurationDays}
                    onChange={(e) => setNewDurationDays(e.target.value)}
                    min="1"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Time Checkboxes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Schedule Times (select {newTimesPerDay})</label>
                <div className="flex flex-wrap gap-2">
                  {TIME_OPTIONS.map(time => {
                    const isSelected = newScheduleTimes.includes(time);
                    const icons = { Morning: '🌅', Afternoon: '☀️', Evening: '🌇', Night: '🌙' };
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => toggleScheduleTime(time)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {icons[time]} {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              {newDurationDays && Number(newDurationDays) > 7 && (
                <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 text-sm text-blue-700">
                  📅 Range schedule: Starting today for <strong>{newDurationDays} days</strong>
                </div>
              )}
            </div>

            <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
              Save to Inventory
            </button>
          </form>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard 
          title="Total Inventory" 
          value={medicines.length} 
          icon={Package} 
          colorClass="bg-blue-500" 
          highlightClass="bg-blue-500" 
        />
        <StatCard 
          title="Stock Alerts" 
          value={totalAlerts} 
          icon={AlertTriangle} 
          colorClass="bg-amber-500" 
          highlightClass="bg-amber-500" 
        />
        <StatCard 
          title="Scheduled Today" 
          value={scheduledToday} 
          icon={Clock} 
          colorClass="bg-indigo-500" 
          highlightClass="bg-indigo-500" 
        />
        <StatCard 
          title="Expiry Warnings" 
          value={expiringCount + expiredCount} 
          icon={ShieldAlert} 
          colorClass="bg-red-500" 
          highlightClass="bg-red-500" 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <MedicineInventoryTable medicines={medicines} loading={loading} />
        </div>
        <div className="space-y-6">
          <ExpiryAlerts medicines={medicines} />
          <LowStockAlerts medicines={medicines} />
          <RecentActivityPanel />
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Fixed Sidebar */}
      {isSidebarOpen && (
        <SidebarNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <DashboardHeader 
          selectedMember={selectedMember} 
          onSwitchProfile={() => {
            setSelectedMember(null);
            localStorage.removeItem('codecure_profile');
          }} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <div className="w-full space-y-8">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Global Medicine Warning Popup */}
      {showMedicineWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-red-500 p-6 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="p-8 text-center">
              <h3 className="text-2xl font-black text-slate-800 mb-2">⚠ Medicine Warning</h3>
              <p className="text-slate-500 mb-6 font-medium">
                The following medicines require your attention.
              </p>
              
              <div className="space-y-3 mb-8 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {warningMeds.map(med => (
                  <div key={med.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                    <span className="font-bold text-red-700 text-left">{med.name}</span>
                    <span className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded-lg font-black whitespace-nowrap ml-2">
                      {med.warningReason}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMedicineWarning(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-2xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowMedicineWarning(false);
                    setActiveTab('Medicine Store');
                  }}
                  className="flex-1 bg-slate-900 hover:bg-black text-white py-3 rounded-2xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-200"
                >
                  Restock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <GeminiChat />
    </div>
  );
}

export default App;
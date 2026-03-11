import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import "./App.css";
import Login from "./login";
import HouseholdSelection from "./HouseholdSelection";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newStock, setNewStock] = useState("");

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

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">IIT-BHU Care</div>
        <nav className="nav-links">
          <div className="nav-item active">🏠 Dashboard</div>
          <div className="nav-item">💊 Medicine Stock</div>
          <div className="nav-item">🏥 Hospitals</div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-top">
            <div className="profile-info">
              {selectedMember.avatar === "neutral-placeholder" ? (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#0284c7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {selectedMember.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <img src={selectedMember.avatar} alt="Avatar" className="header-avatar" />
              )}
              <h2>{selectedMember.name}'s Health Dashboard</h2>
            </div>
            <button className="switch-profile-btn" onClick={() => setSelectedMember(null)}>
              Switch Profile
            </button>
          </div>

          <form onSubmit={handleAddMedicine} className="add-med-form">
            <input
              type="text"
              placeholder="Med Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <input
              type="number"
              placeholder="Stock"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
            />

            <button type="submit" className="add-btn">
              Add to Stock
            </button>
          </form>
        </header>

        <section className="stats-grid">
          <div className="card">
            <h3>Total Inventory</h3>
            <p>{medicines.length}</p>
          </div>

          <div className="card critical">
            <h3>Low Stock Alerts</h3>
            <p>{medicines.filter((m) => m.stock < 10).length}</p>
          </div>

          <div className="card pulse">
            <h3>Active Hospitals</h3>
            <p>12</p>
          </div>
        </section>

        <section className="table-container">
          <h3>Medicine Inventory</h3>

          {loading ? (
            <p className="loading-text">Fetching data...</p>
          ) : (
            <table className="med-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {medicines.map((med) => (
                  <tr key={med.id}>
                    <td>{med.name}</td>
                    <td>{med.stock}</td>
                    <td>
                      <span
                        className={`status-tag ${
                          med.stock < 10 ? "low" : "ok"
                        }`}
                      >
                        {med.stock < 10 ? "Low" : "Available"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

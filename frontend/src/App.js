import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import "./App.css";
import Login from "./login";

function App() {

const [isLoggedIn, setIsLoggedIn] = useState(false);

const [medicines, setMedicines] = useState([]);
const [loading, setLoading] = useState(true);
const [newName, setNewName] = useState("");
const [newStock, setNewStock] = useState("");

// 1. Fetch data from Firestore
const fetchMedicines = async () => {
setLoading(true);
try {
const querySnapshot = await getDocs(collection(db, "medicines"));
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
fetchMedicines();
}, []);

// 2. Add new medicine
const handleAddMedicine = async (e) => {
e.preventDefault();
if (!newName || !newStock) return alert("Please fill all fields");

```
try {
  await addDoc(collection(db, "medicines"), {
    name: newName,
    stock: Number(newStock),
    category: "General",
    timestamp: new Date(),
  });

  setNewName("");
  setNewStock("");
  fetchMedicines();
} catch (error) {
  alert("Error adding medicine: " + error.message);
}
```

};

// Login screen first
if (!isLoggedIn) {
return <Login onLogin={() => setIsLoggedIn(true)} />;
}

return ( <div className="dashboard-container"> <aside className="sidebar"> <div className="sidebar-header">IIT-BHU Care</div> <nav className="nav-links"> <div className="nav-item active">🏠 Dashboard</div> <div className="nav-item">💊 Medicine Stock</div> <div className="nav-item">🏥 Hospitals</div> </nav> </aside>

```
  <main className="main-content">
    <header className="header">
      <h2>Healthcare Dashboard</h2>

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

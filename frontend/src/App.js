import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

function App() {
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    const fetchMedicines = async () => {
      const querySnapshot = await getDocs(collection(db, "medicines"));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMedicines(data);
    };

    fetchMedicines();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Medicines List</h1>
      {medicines.length === 0 ? (
        <p>No medicines found</p>
      ) : (
        medicines.map(med => (
          <p key={med.id}>{med.name}</p>
        ))
      )}
    </div>
  );
}

export default App;
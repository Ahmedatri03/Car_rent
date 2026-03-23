import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { carApi } from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [activeSection, setActiveSection] = useState("create");
  const [form, setForm] = useState({
    type: "SEDAN",
    rentalPricePerDay: 50,
    carPrice: 12000,
    brand: "",
    model: "",
    purchaseDate: "",
    maxPassengers: 5,
    maxSpeed: 180,
    airConditioner: false,
    automaticTransmission: false,
    available: true
  });

  const loadCars = async () => {
    const res = await carApi.get("/cars");
    setCars(res.data);
  };

  useEffect(() => {
    loadCars();
  }, []);

  const createCar = async (e) => {
    e.preventDefault();
    await carApi.post("/cars", {
      ...form,
      pricePerDay: Number(form.rentalPricePerDay)
    });
    setForm({
      type: "SEDAN",
      rentalPricePerDay: 50,
      carPrice: 12000,
      brand: "",
      model: "",
      purchaseDate: "",
      maxPassengers: 5,
      maxSpeed: 180,
      airConditioner: false,
      automaticTransmission: false,
      available: true
    });
    loadCars();
  };

  const logout = () => {
    localStorage.removeItem("carrent_role");
    localStorage.removeItem("carrent_username");
    localStorage.removeItem("carrent_userId");
    navigate("/");
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <h2>Car Rent</h2>
          <p>Admin</p>
        </div>

        <div className="sidebar-nav">
          <button type="button" className={`nav-btn ${activeSection === "profile" ? "active" : ""}`} onClick={() => setActiveSection("profile")}>
            Mon profil
          </button>
          <button type="button" className={`nav-btn ${activeSection === "create" ? "active" : ""}`} onClick={() => setActiveSection("create")}>
            Créer une voiture
          </button>
          <button type="button" className={`nav-btn ${activeSection === "list" ? "active" : ""}`} onClick={() => setActiveSection("list")}>
            Liste des voitures
          </button>
        </div>

        <div className="sidebar-spacer" />

        <button className="btn-secondary nav-btn" type="button" onClick={logout}>
          Déconnexion
        </button>
      </aside>

      <main className="app-main">
        <div className="topbar">
          <h2>Admin Dashboard</h2>
          <button className="btn-secondary" type="button" onClick={() => navigate("/")}>
            Index
          </button>
        </div>

        <div className="content-stack">
          {activeSection === "create" ? (
            <form onSubmit={createCar} className="card admin-car-form">
              <h3 style={{ marginBottom: 4 }}>Créer une voiture</h3>

              <div className="form-row">
                <label htmlFor="type">Type:</label>
                <select id="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="SEDAN">SEDAN</option>
                  <option value="SUV">SUV</option>
                  <option value="HATCHBACK">HATCHBACK</option>
                  <option value="COUPE">COUPE</option>
                  <option value="VAN">VAN</option>
                </select>
              </div>

              <div className="form-row">
                <label htmlFor="rentalPricePerDay">Rental price for day (€)</label>
                <input
                  id="rentalPricePerDay"
                  type="number"
                  min="0"
                  step="1"
                  value={form.rentalPricePerDay}
                  onChange={(e) => setForm({ ...form, rentalPricePerDay: Number(e.target.value) })}
                />
              </div>

              <div className="form-row">
                <label htmlFor="carPrice">Car price (€)</label>
                <input
                  id="carPrice"
                  type="number"
                  min="0"
                  step="1"
                  value={form.carPrice}
                  onChange={(e) => setForm({ ...form, carPrice: Number(e.target.value) })}
                />
              </div>

              <div className="form-row">
                <label htmlFor="brand">Brand:</label>
                <input id="brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </div>

              <div className="form-row">
                <label htmlFor="model">Model:</label>
                <input id="model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
              </div>

              <div className="form-row">
                <label htmlFor="purchaseDate">PurchaseDate:</label>
                <input id="purchaseDate" type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
              </div>

              <div className="form-row">
                <label htmlFor="maxPassengers">MaxPassengers:</label>
                <input
                  id="maxPassengers"
                  type="number"
                  min="1"
                  step="1"
                  value={form.maxPassengers}
                  onChange={(e) => setForm({ ...form, maxPassengers: Number(e.target.value) })}
                />
              </div>

              <div className="form-row">
                <label htmlFor="maxSpeed">MaxSpeed:</label>
                <input
                  id="maxSpeed"
                  type="number"
                  min="1"
                  step="1"
                  value={form.maxSpeed}
                  onChange={(e) => setForm({ ...form, maxSpeed: Number(e.target.value) })}
                />
              </div>

              <div className="form-row checkbox-row">
                <label htmlFor="airConditioner">Air Conditioner</label>
                <input id="airConditioner" type="checkbox" checked={form.airConditioner} onChange={(e) => setForm({ ...form, airConditioner: e.target.checked })} />
              </div>

              <div className="form-row checkbox-row">
                <label htmlFor="automaticTransmission">Automatic Transmission</label>
                <input
                  id="automaticTransmission"
                  type="checkbox"
                  checked={form.automaticTransmission}
                  onChange={(e) => setForm({ ...form, automaticTransmission: e.target.checked })}
                />
              </div>

              <button type="submit" className="save-btn">
                Save
              </button>
            </form>
          ) : null}

          {activeSection === "profile" ? (
            <div className="card">
              <h3>Mon profil</h3>
              <p>Admin demo account.</p>
              <p>Username: admin</p>
              <p>Role: ADMIN</p>
            </div>
          ) : null}

          {activeSection === "list" ? (
            <div className="card">
              <h3>Voitures enregistrees</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Brand</th>
                    <th>Model</th>
                    <th>Prix €/jour</th>
                    <th>Disponibilité</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car.id}>
                      <td>#{car.id}</td>
                      <td>{car.type || "N/A"}</td>
                      <td>{car.brand}</td>
                      <td>{car.model}</td>
                      <td>{car.rentalPricePerDay ?? car.pricePerDay}</td>
                      <td>
                        <span className={`pill ${car.available ? "pill-available" : "pill-unavailable"}`}>{car.available ? "Disponible" : "Occupee"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;

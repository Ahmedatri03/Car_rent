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

  return (
    <div className="container">
      <h2>Create New Car</h2>

      <div className="admin-layout">
        <aside className="admin-sidebar card">
          <p>Hello USERNAME</p>
          <button
            type="button"
            className={activeSection === "profile" ? "active-menu-btn" : ""}
            onClick={() => setActiveSection("profile")}
          >
            My Profile
          </button>
          <button
            type="button"
            className={activeSection === "create" ? "active-menu-btn" : ""}
            onClick={() => setActiveSection("create")}
          >
            Create New Car
          </button>
          <button
            type="button"
            className={activeSection === "list" ? "active-menu-btn" : ""}
            onClick={() => setActiveSection("list")}
          >
            Show All Car Items
          </button>
          <button type="button" onClick={() => navigate("/")}>
            Index
          </button>
          <button type="button" onClick={() => navigate("/")}>
            Log Out
          </button>
        </aside>

        {activeSection === "create" ? (
          <form onSubmit={createCar} className="card admin-car-form">
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
              <input
                id="purchaseDate"
                type="date"
                value={form.purchaseDate}
                onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
              />
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
              <input
                id="airConditioner"
                type="checkbox"
                checked={form.airConditioner}
                onChange={(e) => setForm({ ...form, airConditioner: e.target.checked })}
              />
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
            <h3>My Profile</h3>
            <p>Admin demo account.</p>
            <p>Username: admin</p>
            <p>Role: ADMIN</p>
          </div>
        ) : null}

        {activeSection === "list" ? (
          <div className="card">
            <h3>Voitures enregistrees</h3>
            {cars.map((car) => (
              <p key={car.id}>
                #{car.id} [{car.type || "N/A"}] {car.brand} {car.model} - {car.rentalPricePerDay ?? car.pricePerDay} €/jour -{" "}
                {car.available ? "Disponible" : "Occupee"}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AdminDashboard;

import { useEffect, useState } from "react";
import { carApi } from "../services/api";
import { useNavigate } from "react-router-dom";

function ClientDashboard() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const sessionUsername = localStorage.getItem("carrent_username") || "";
  const sessionUserId = Number(localStorage.getItem("carrent_userId") || 0);
  const [bookingForm, setBookingForm] = useState({ carId: "", days: 1 });
  const [isValidating, setIsValidating] = useState(false);
  const [validationInfo, setValidationInfo] = useState("");
  const [activeSection, setActiveSection] = useState("reservation"); // UI only

  const getStatusClass = (status) => {
    if (status === "APPROVED") return "status-approved";
    if (status === "REFUSED") return "status-refused";
    return "status-pending";
  };

  const logout = () => {
    localStorage.removeItem("carrent_role");
    localStorage.removeItem("carrent_username");
    localStorage.removeItem("carrent_userId");
    navigate("/");
  };

  const loadCars = async () => {
    const res = await carApi.get("/cars");
    setCars(res.data);
  };

  const loadBookings = async () => {
    const res = await carApi.get("/bookings");
    setBookings(res.data);
    return res.data;
  };

  const loadData = async () => {
    await Promise.all([loadCars(), loadBookings()]);
  };

  useEffect(() => {
    if (!sessionUserId) {
      logout();
      return;
    }
    loadData();
  }, []);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const createBooking = async (e) => {
    e.preventDefault();
    if (!bookingForm.carId) return;

    setIsValidating(true);
    setValidationInfo("Vérification de crédit en cours...");

    try {
      const created = await carApi.post("/bookings", {
        userId: sessionUserId,
        carId: Number(bookingForm.carId),
        days: Number(bookingForm.days)
      });

      const createdBookingId = created.data?.id;

      // Polling simple: on attend la réponse RabbitMQ qui met à jour le booking.
      const start = Date.now();
      let finalStatus = null;
      while (Date.now() - start < 10000) {
        const allBookings = await loadBookings();
        const b = allBookings.find((x) => x.id === createdBookingId);
        if (b && b.status !== "PENDING") {
          finalStatus = b.status;
          break;
        }
        await sleep(1000);
      }

      // Refresh des voitures pour refléter la dispo après APPROVED
      await loadCars();
      if (finalStatus) {
        setValidationInfo(`Statut mis à jour : ${finalStatus}`);
      } else {
        setValidationInfo("Statut mis à jour (délai atteint). Rafraîchis manuellement si besoin.");
      }
    } catch (err) {
      setValidationInfo("Erreur lors de la création de la réservation.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <h2>Car Rent</h2>
          <p>Client</p>
        </div>

        <div className="sidebar-nav">
          <button type="button" className={`nav-btn ${activeSection === "reservation" ? "active" : ""}`} onClick={() => setActiveSection("reservation")}>
            Réservation
          </button>
          <button type="button" className={`nav-btn ${activeSection === "bookings" ? "active" : ""}`} onClick={() => setActiveSection("bookings")}>
            Mes réservations
          </button>
        </div>

        <div className="sidebar-spacer" />

        <button className="btn-secondary nav-btn" onClick={logout} type="button">
          Déconnexion
        </button>
      </aside>

      <main className="app-main">
        <div className="topbar">
          <h2>Client Dashboard</h2>
          <div style={{ color: "var(--muted)", fontWeight: 900 }}>
            Connecte : <span style={{ color: "var(--text)" }}>{sessionUsername}</span>
          </div>
        </div>

        <div className="content-stack">
          {activeSection === "reservation" ? (
            <form onSubmit={createBooking} className="card">
              <h3>Reservation</h3>
              <div className="content-stack">
                <div>
                  <h3 style={{ fontSize: "1rem", marginBottom: 10 }}>Liste des voitures</h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Brand</th>
                        <th>Model</th>
                        <th>Prix €/jour</th>
                        <th>Disponibilité</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cars.map((car) => (
                        <tr key={car.id} style={bookingForm.carId === car.id ? { background: "rgba(255,107,53,0.06)" } : undefined}>
                          <td>#{car.id}</td>
                          <td>{car.type || "N/A"}</td>
                          <td>{car.brand}</td>
                          <td>{car.model}</td>
                          <td>{car.rentalPricePerDay ?? car.pricePerDay}</td>
                          <td>
                            <span className={`pill ${car.available ? "pill-available" : "pill-unavailable"}`}>
                              {car.available ? "Disponible" : "Occupee"}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-secondary"
                              disabled={!car.available}
                              onClick={() => setBookingForm({ ...bookingForm, carId: car.id })}
                            >
                              Réserver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <label>
                Nombre de jours
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Ex: 3"
                  value={bookingForm.days}
                  onChange={(e) => setBookingForm({ ...bookingForm, days: e.target.value })}
                />
              </label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <button disabled={isValidating || !bookingForm.carId} type="submit">
                  {isValidating ? "Vérification..." : "Louer"}
                </button>
                {validationInfo ? <span className="error">{validationInfo}</span> : null}
              </div>
            </form>
          ) : null}

          {activeSection === "bookings" ? (
            <div className="card">
              <h3>Mes réservations</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Car</th>
                    <th>Days</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td>#{b.id}</td>
                      <td>#{b.carId}</td>
                      <td>{b.days}</td>
                      <td>{b.totalPrice}</td>
                      <td>
                        <span className={`status ${getStatusClass(b.status)}`}>{b.status}</span>
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

export default ClientDashboard;

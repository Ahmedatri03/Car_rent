import { useEffect, useState } from "react";
import { carApi } from "../services/api";

function ClientDashboard() {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingForm, setBookingForm] = useState({ userId: 1, carId: "", days: 1 });

  const loadData = async () => {
    const [carsRes, bookingsRes] = await Promise.all([
      carApi.get("/cars"),
      carApi.get("/bookings")
    ]);
    setCars(carsRes.data);
    setBookings(bookingsRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const createBooking = async (e) => {
    e.preventDefault();
    await carApi.post("/bookings", {
      ...bookingForm,
      carId: Number(bookingForm.carId),
      days: Number(bookingForm.days)
    });
    await loadData();
  };

  return (
    <div className="container">
      <h2>Client Dashboard</h2>

      <form onSubmit={createBooking} className="card">
        <h3>Reservation</h3>
        <label>
          ID client (userId)
          <input
            type="number"
            min="1"
            step="1"
            placeholder="Ex: 1"
            value={bookingForm.userId}
            onChange={(e) => setBookingForm({ ...bookingForm, userId: Number(e.target.value) })}
          />
        </label>
        <label>
          Voiture
          <select value={bookingForm.carId} onChange={(e) => setBookingForm({ ...bookingForm, carId: e.target.value })}>
            <option value="">Choisir une voiture</option>
            {cars
              .filter((c) => c.available)
              .map((car) => (
                <option key={car.id} value={car.id}>
                  #{car.id} [{car.type || "N/A"}] {car.brand} {car.model} ({car.rentalPricePerDay ?? car.pricePerDay} €/jour)
                </option>
              ))}
          </select>
        </label>
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
        <button type="submit">Louer</button>
      </form>

      <div className="card">
        <h3>Reservations</h3>
        {bookings.map((b) => (
          <p key={b.id}>
            #{b.id} - user {b.userId} - car {b.carId} - {b.totalPrice} - <strong>{b.status}</strong>
          </p>
        ))}
      </div>
    </div>
  );
}

export default ClientDashboard;

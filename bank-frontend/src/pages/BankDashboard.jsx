import { useState } from "react";
import { bankApi } from "../services/api";

function BankDashboard() {
  const [form, setForm] = useState({ userId: 1, ownerName: "Client Demo", balance: 1000 });
  const [account, setAccount] = useState(null);
  const [message, setMessage] = useState("");

  const createAccount = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await bankApi.post("/accounts", form);
      setAccount(res.data);
      setMessage("Compte cree avec succes.");
    } catch (error) {
      setMessage("Erreur lors de la creation du compte.");
    }
  };

  const loadByUserId = async () => {
    setMessage("");
    try {
      const res = await bankApi.get(`/accounts/user/${form.userId}`);
      setAccount(res.data);
      setMessage("Compte charge.");
    } catch (error) {
      setAccount(null);
      setMessage("Aucun compte trouve pour ce userId.");
    }
  };

  const updateBalance = async () => {
    if (!account) {
      setMessage("Charge d'abord un compte.");
      return;
    }
    setMessage("");
    try {
      const payload = {
        userId: account.userId,
        ownerName: account.ownerName,
        balance: Number(form.balance)
      };
      const res = await bankApi.put(`/accounts/${account.id}`, payload);
      setAccount(res.data);
      setForm((prev) => ({ ...prev, balance: res.data.balance, ownerName: res.data.ownerName }));
      setMessage("Solde mis a jour.");
    } catch (error) {
      setMessage("Erreur lors de la mise a jour.");
    }
  };

  return (
    <div className="container">
      <h2>Bank Dashboard (Client)</h2>
      <p>Interface bancaire independante de l'application Car Rent.</p>

      <form onSubmit={createAccount} className="card">
        <h3>Creer un compte bancaire</h3>
        <label>
          ID client (userId)
          <input
            type="number"
            min="1"
            step="1"
            value={form.userId}
            onChange={(e) => setForm({ ...form, userId: Number(e.target.value) })}
            placeholder="Ex: 1"
          />
        </label>
        <label>
          Nom du proprietaire
          <input
            value={form.ownerName}
            onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
            placeholder="Ex: Client Demo"
          />
        </label>
        <label>
          Solde (€)
          <input
            type="number"
            min="0"
            step="1"
            value={form.balance}
            onChange={(e) => setForm({ ...form, balance: Number(e.target.value) })}
            placeholder="Ex: 1000"
          />
        </label>
        <button type="submit">Creer compte</button>
      </form>

      <div className="card">
        <h3>Consulter / Mettre a jour</h3>
        <button onClick={loadByUserId} type="button">
          Charger mon compte (par userId)
        </button>
        <button onClick={updateBalance} type="button">
          Mettre a jour le solde
        </button>
        {account ? (
          <p>
            Compte #{account.id} | user {account.userId} | {account.ownerName} | solde: {account.balance}
          </p>
        ) : null}
        {message ? <p>{message}</p> : null}
      </div>
    </div>
  );
}

export default BankDashboard;

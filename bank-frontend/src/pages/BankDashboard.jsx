import { useEffect, useState } from "react";
import { bankApi } from "../services/api";
import { useNavigate } from "react-router-dom";

function BankDashboard() {
  const navigate = useNavigate();
  const sessionUsername = localStorage.getItem("bank_username") || "";
  const sessionUserId = Number(localStorage.getItem("bank_userId") || 0);

  const [balance, setBalance] = useState(1000);
  const [account, setAccount] = useState(null);
  const [message, setMessage] = useState("");

  const getMessageVariant = (msg) => {
    const m = (msg || "").toLowerCase();
    if (m.includes("erreur")) return "message-error";
    if (m.includes("aucun")) return "message-warning";
    return "message-success";
  };

  const logout = () => {
    localStorage.removeItem("bank_username");
    localStorage.removeItem("bank_userId");
    navigate("/");
  };

  const createAccount = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await bankApi.post("/accounts", {
        userId: sessionUserId,
        ownerName: sessionUsername,
        balance: Number(balance)
      });
      setAccount(res.data);
      setMessage("Compte cree avec succes.");
    } catch (error) {
      setMessage("Erreur lors de la creation du compte.");
    }
  };

  const loadAccount = async () => {
    setMessage("");
    try {
      const res = await bankApi.get(`/accounts/user/${sessionUserId}`);
      setAccount(res.data);
      setMessage("Compte charge.");
    } catch (error) {
      setAccount(null);
      setMessage("Aucun compte trouve pour ce username.");
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
        balance: Number(balance)
      };
      const res = await bankApi.put(`/accounts/${account.id}`, payload);
      setAccount(res.data);
      setBalance(res.data.balance);
      setMessage("Solde mis a jour.");
    } catch (error) {
      setMessage("Erreur lors de la mise a jour.");
    }
  };

  useEffect(() => {
    if (!sessionUserId) {
      logout();
      return;
    }
    loadAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <h2>Bank App</h2>
          <p>Client</p>
        </div>

        <div className="sidebar-nav">
          <div className="nav-btn active" style={{ cursor: "default" }}>
            Compte
          </div>
        </div>

        <div className="sidebar-spacer" />

        <button className="btn-secondary nav-btn" onClick={logout} type="button">
          Déconnexion
        </button>
      </aside>

      <main className="app-main">
        <div className="topbar">
          <h2>Bank Dashboard</h2>
          <div style={{ color: "var(--muted)", fontWeight: 900 }}>
            Connecte : <span style={{ color: "var(--text)" }}>{sessionUsername}</span>
          </div>
        </div>

        <div className="content-stack">
          <div className="card">
            <h3>Compte</h3>
            {account ? (
              <p>
                Compte #{account.id} | {account.ownerName} | solde: {account.balance}
              </p>
            ) : (
              <p>Aucun compte pour ce username.</p>
            )}
          </div>

          <form onSubmit={createAccount} className="card">
            <h3>Créer un compte bancaire</h3>
            <label>
              Solde (€)
              <input
                type="number"
                min="0"
                step="1"
                value={balance}
                onChange={(e) => setBalance(Number(e.target.value))}
                placeholder="Ex: 1000"
              />
            </label>
            <button type="submit">Créer un compte</button>
          </form>

          <div className="card">
            <h3>Mettre à jour</h3>
            <button disabled={!account} onClick={updateBalance} type="button">
              Mettre à jour le solde
            </button>
            {message ? <p className={`message ${getMessageVariant(message)}`}>{message}</p> : null}
          </div>
        </div>
      </main>
    </div>
  );
}

export default BankDashboard;

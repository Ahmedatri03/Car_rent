import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (username === "admin" && password === "admin") {
      navigate("/admin");
      return;
    }
    if (username === "client" && password === "client") {
      navigate("/client");
      return;
    }
    setError("Identifiants invalides (simulation)");
  };

  return (
    <div className="container">
      <h1>Car Rent Demo</h1>
      <p>Login simule : admin/admin ou client/client</p>
      <form onSubmit={onSubmit} className="card">
        <input
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Se connecter</button>
        {error ? <p className="error">{error}</p> : null}
      </form>
    </div>
  );
}

export default LoginPage;

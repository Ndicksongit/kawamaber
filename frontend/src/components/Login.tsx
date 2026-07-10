import React, { useState } from "react";

export default function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur de connexion");
      } else {
        localStorage.setItem("kawa_token", data.token);
        onLogin(data.token);
      }
    } catch (err) {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h2>Connexion KAWA MABER</h2>
      <div>
        <label>Nom d'utilisateur</label>
        <input value={username} onChange={(e)=>setUsername(e.target.value)} required />
      </div>
      <div>
        <label>Mot de passe</label>
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
      </div>
      {error && <div style={{color:"red"}}>{error}</div>}
      <button type="submit" disabled={loading}>{loading ? "Connexion..." : "Se connecter"}</button>
    </form>
  );
}

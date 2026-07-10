import React, { useEffect, useState } from "react";

export default function StockDashboard() {
  const [summary, setSummary] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/stock/summary", { headers: { Authorization: `Bearer ${localStorage.getItem('kawa_token')}` } })
      .then(r => r.json())
      .then(setSummary);
  }, []);

  return (
    <div>
      <h3>Inventaire par lot</h3>
      <table>
        <thead><tr><th>Lot</th><th>Entrée</th><th>Sortie</th><th>Solde</th></tr></thead>
        <tbody>
          {summary.map(s => <tr key={s.lotId}><td>{s.lotId || "NoLot"}</td><td>{s.in}</td><td>{s.out}</td><td>{s.balance}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}

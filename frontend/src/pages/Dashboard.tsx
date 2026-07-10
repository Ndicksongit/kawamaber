import React from "react";
export default function Dashboard() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Tableau de bord KAWA MABER</h1>
      <section>
        <h2>KPIs</h2>
        <ul>
          <li>Nombre de planteurs</li>
          <li>Superficie plantée (ha)</li>
          <li>Kilos disponibles en stock</li>
          <li>Prêts ouverts</li>
        </ul>
      </section>
      <section>
        <h2>Accès rapide</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button>Enregistrer planteur</button>
          <button>Nouvelle parcelle</button>
          <button>Enregistrement plantation</button>
          <button>Gestion prêts</button>
        </div>
      </section>
    </div>
  );
}

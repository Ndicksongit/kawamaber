import React, { useState } from "react";

export default function PlantingForm() {
  const [fieldId, setFieldId] = useState("");
  const [date, setDate] = useState("");
  const [species, setSpecies] = useState("");
  const [density, setDensity] = useState<number | "">("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/plantings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem('kawa_token')}` },
      body: JSON.stringify({ fieldId, date, species, densityPerHa: density }),
    });
    alert("Plantation enregistrée");
  }

  return (
    <form onSubmit={submit}>
      <h3>Nouvelle plantation</h3>
      <div><label>FieldId</label><input value={fieldId} onChange={e=>setFieldId(e.target.value)} required /></div>
      <div><label>Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} /></div>
      <div><label>Espece</label><input value={species} onChange={e=>setSpecies(e.target.value)} /></div>
      <div><label>Density /ha</label><input value={density as any} onChange={e=>setDensity(Number(e.target.value)||"")} /></div>
      <button type="submit">Enregistrer</button>
    </form>
  );
}

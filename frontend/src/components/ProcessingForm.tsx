import React, { useState } from "react";

export default function ProcessingForm() {
  const [batchCode, setBatchCode] = useState("");
  const [lotCode, setLotCode] = useState("");
  const [kilosIn, setKilosIn] = useState("");
  const [kilosOut, setKilosOut] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/processings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem('kawa_token')}` },
      body: JSON.stringify({ batchCode, lotCode, kilosIn: Number(kilosIn), kilosOut: Number(kilosOut) }),
    });
    alert("Processing enregistré");
  }

  return (
    <form onSubmit={submit}>
      <h3>Enregistrer transformation</h3>
      <div><label>Batch</label><input value={batchCode} onChange={e=>setBatchCode(e.target.value)} /></div>
      <div><label>Lot code</label><input value={lotCode} onChange={e=>setLotCode(e.target.value)} /></div>
      <div><label>Kilos in</label><input value={kilosIn} onChange={e=>setKilosIn(e.target.value)} /></div>
      <div><label>Kilos out</label><input value={kilosOut} onChange={e=>setKilosOut(e.target.value)} /></div>
      <button type="submit">Enregistrer</button>
    </form>
  );
}

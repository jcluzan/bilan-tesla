'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Trash2, Plus, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SECTIONS = [
  { id: 'profil', label: 'Profil & configuration', status: 'active' },
  { id: 'maison', label: 'Énergie maison', status: 'active' },
  { id: 'superchargeurs', label: 'Superchargeurs', status: 'active' },
  { id: 'entretien', label: 'Entretien', status: 'active' },
  { id: 'bilan', label: 'Bilan comparatif', status: 'active' },
];

function formatEUR(n) {
  if (!isFinite(n)) return '0,00 €';
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function Gauge({ value, max, accent }) {
  const ticks = 24;
  const filled = Math.round((Math.min(value, max) / max) * ticks);
  return (
    <div className="flex gap-[3px] mt-3">
      {Array.from({ length: ticks }).map((_, i) => (
        <div
          key={i}
          className="h-3 flex-1 rounded-sm"
          style={{
            background: i < filled ? accent : 'rgba(255,255,255,0.07)',
            transition: 'background 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}

function CompareBar({ label, teslaValue, audiValue }) {
  const total = teslaValue + audiValue;
  const teslaPct = total > 0 ? (teslaValue / total) * 100 : 50;
  return (
    <div>
      <div className="flex items-center justify-between text-[13px] mb-1.5">
        <span className="text-[#8B96A3]">{label}</span>
        <span className="font-mono text-[12px]">
          <span className="text-[#5EEAD4]">{formatEUR(teslaValue)}</span>
          <span className="text-[#5A6672] mx-1.5">vs</span>
          <span className="text-[#F4A261]">{formatEUR(audiValue)}</span>
        </span>
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden bg-[rgba(255,255,255,0.07)]">
        <div className="h-full bg-[#5EEAD4]" style={{ width: `${teslaPct}%`, transition: 'width 0.3s ease' }} />
        <div className="h-full bg-[#F4A261]" style={{ width: `${100 - teslaPct}%`, transition: 'width 0.3s ease' }} />
      </div>
    </div>
  );
}

function Field({ label, suffix, value, onChange, step = '0.01', placeholder }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] text-[#8B96A3] font-medium tracking-wide">{label}</span>
      <div className="flex items-center bg-[#0E1318] border border-[#262E37] rounded-lg px-3 focus-within:border-[#5EEAD4] transition-colors">
        <input
          type="number"
          inputMode="decimal"
          step={step}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
          className="w-full bg-transparent py-2.5 text-[15px] font-mono text-[#F4F2ED] placeholder-[#4A5560] outline-none"
        />
        <span className="text-[13px] text-[#5A6672] font-mono pl-2 whitespace-nowrap">{suffix}</span>
      </div>
    </label>
  );
}

function Cell({ type = 'text', value, onChange, step, placeholder, align = 'left' }) {
  return (
    <input
      type={type}
      step={step}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-[#0E1318] border border-[#262E37] rounded-md px-2 py-2 text-[13px] font-mono text-[#F4F2ED] placeholder-[#4A5560] outline-none focus:border-[#5EEAD4] transition-colors text-${align}`}
    />
  );
}

export default function BilanTesla() {
  const [profile, setProfile] = useState({
    dieselPrice: 1.85,
    audiConso: 6.5,
    teslaKm: 18000,
    vidangeCost: 180,
    vidangeFreqKm: 15000,
  });

  const [homeEnergy, setHomeEnergy] = useState({
    kwh: 2400,
    pricePerKwh: 0.2016,
  });

  const setHome = (key) => (v) => setHomeEnergy((h) => ({ ...h, [key]: v }));

  const homeCost = useMemo(() => {
    const { kwh, pricePerKwh } = homeEnergy;
    if (!kwh || !pricePerKwh) return 0;
    return kwh * pricePerKwh;
  }, [homeEnergy]);

  const [superRows, setSuperRows] = useState([
    { id: 1, date: '', kwh: '', price: '' },
    { id: 2, date: '', kwh: '', price: '' },
  ]);

  const addSuperRow = () => {
    setSuperRows((rows) => [...rows, { id: Date.now(), date: '', kwh: '', price: '' }]);
  };

  const removeSuperRow = (id) => {
    setSuperRows((rows) => (rows.length > 1 ? rows.filter((r) => r.id !== id) : rows));
  };

  const updateSuperRow = (id, field, value) => {
    setSuperRows((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const superTotals = useMemo(() => {
    return superRows.reduce(
      (acc, r) => {
        const kwh = parseFloat(r.kwh) || 0;
        const price = parseFloat(r.price) || 0;
        return { kwh: acc.kwh + kwh, cost: acc.cost + kwh * price };
      },
      { kwh: 0, cost: 0 }
    );
  }, [superRows]);

  const [maintenanceRows, setMaintenanceRows] = useState([
    { id: 1, date: '', label: '', amount: '' },
  ]);

  const addMaintenanceRow = () => {
    setMaintenanceRows((rows) => [...rows, { id: Date.now(), date: '', label: '', amount: '' }]);
  };

  const removeMaintenanceRow = (id) => {
    setMaintenanceRows((rows) => (rows.length > 1 ? rows.filter((r) => r.id !== id) : rows));
  };

  const updateMaintenanceRow = (id, field, value) => {
    setMaintenanceRows((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const maintenanceTotal = useMemo(() => {
    return maintenanceRows.reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);
  }, [maintenanceRows]);

  const set = (key) => (v) => setProfile((p) => ({ ...p, [key]: v }));

  const dieselCost = useMemo(() => {
    const { teslaKm, audiConso, dieselPrice } = profile;
    if (!teslaKm || !audiConso || !dieselPrice) return 0;
    return (teslaKm / 100) * audiConso * dieselPrice;
  }, [profile]);

  const vidangeCostTotal = useMemo(() => {
    const { teslaKm, vidangeFreqKm, vidangeCost } = profile;
    if (!teslaKm || !vidangeFreqKm || !vidangeCost) return 0;
    return (teslaKm / vidangeFreqKm) * vidangeCost;
  }, [profile]);

  const teslaEnergyCost = homeCost + superTotals.cost;
  const teslaTotalCost = teslaEnergyCost + maintenanceTotal;
  const audiTotalCost = dieselCost + vidangeCostTotal;
  const totalSavings = audiTotalCost - teslaTotalCost;
  const savingsPct = audiTotalCost > 0 ? (totalSavings / audiTotalCost) * 100 : 0;

  const chartData = [
    { name: 'Énergie', Tesla: Math.round(teslaEnergyCost), 'Audi A3': Math.round(dieselCost) },
    { name: 'Entretien', Tesla: Math.round(maintenanceTotal), 'Audi A3': Math.round(vidangeCostTotal) },
    { name: 'Total', Tesla: Math.round(teslaTotalCost), 'Audi A3': Math.round(audiTotalCost) },
  ];

  const bilanText = `Cette année, sur ${profile.teslaKm || 0} km parcourus, ta Tesla t'a coûté ${formatEUR(teslaTotalCost)} au total : ${formatEUR(teslaEnergyCost)} en énergie (maison + superchargeurs) et ${formatEUR(maintenanceTotal)} en entretien. Avec ton ancienne Audi A3 (${profile.audiConso || 0} L/100 km à ${(profile.dieselPrice || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €/L), le même trajet aurait coûté ${formatEUR(audiTotalCost)} : ${formatEUR(dieselCost)} en diesel et ${formatEUR(vidangeCostTotal)} en entretien. ${
    totalSavings >= 0
      ? `Résultat : tu as économisé ${formatEUR(totalSavings)} cette année, soit environ ${savingsPct.toFixed(0)} % de moins que l'équivalent thermique.`
      : `Résultat : sur cette période, le coût a été ${formatEUR(Math.abs(totalSavings))} plus élevé que l'équivalent thermique, soit environ ${Math.abs(savingsPct).toFixed(0)} % de plus.`
  }`;

  const reportRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#0B0E12',
        useCORS: true,
        ignoreElements: (el) => el.classList?.contains('pdf-ignore'),
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const year = new Date().getFullYear();
      pdf.save(`bilan-tesla-${year}.pdf`);
    } catch (err) {
      console.error('Erreur export PDF', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E12] text-[#F4F2ED]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-10" ref={reportRef}>
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#5EEAD4] mb-2">
              Bilan annuel — relevé du 1er septembre
            </div>
            <h1 className="text-[32px] md:text-[40px] font-bold leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Tesla vs Audi A3 — ce que la conversion m'a rapporté
            </h1>
            <p className="text-[#8B96A3] text-[15px] mt-2 max-w-2xl">
              Remplis tes relevés au fil de l'année, et obtiens un bilan complet en graphes et en chiffres,
              prêt à exporter en PDF pour ta vidéo bilan.
            </p>
          </div>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="pdf-ignore flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#5EEAD4]/40 bg-[#5EEAD4]/10 text-[#5EEAD4] text-[14px] font-medium hover:bg-[#5EEAD4]/20 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <Download size={16} />
            {exporting ? 'Génération du PDF…' : 'Exporter en PDF'}
          </button>
        </div>

        <div className="grid md:grid-cols-[220px_1fr] gap-8">
          {/* Sidebar nav */}
          <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
            {SECTIONS.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border whitespace-nowrap ${
                  s.status === 'active'
                    ? 'border-[#5EEAD4]/40 bg-[#5EEAD4]/10'
                    : 'border-[#1E252D] bg-transparent opacity-50'
                }`}
              >
                <span className="font-mono text-[12px] text-[#5A6672]">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[14px] font-medium">{s.label}</span>
                {s.status === 'soon' && (
                  <span className="text-[10px] font-mono uppercase tracking-wide text-[#5A6672] ml-auto">
                    à venir
                  </span>
                )}
              </div>
            ))}
          </nav>

          {/* Main content */}
          <div className="flex flex-col gap-6">
            {/* Section card */}
            <div className="bg-[#12171D] border border-[#1E252D] rounded-2xl p-6 md:p-8">
              <h2 className="text-[20px] font-semibold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                01 — Profil & configuration
              </h2>
              <p className="text-[#8B96A3] text-[13px] mb-6">
                Ces valeurs de référence servent de base à toutes les comparaisons avec ton ancienne Audi A3.
              </p>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field
                  label="Kilomètres parcourus cette année (Tesla)"
                  suffix="km"
                  step="100"
                  value={profile.teslaKm}
                  onChange={set('teslaKm')}
                />
                <Field
                  label="Prix du litre de diesel"
                  suffix="€ / L"
                  value={profile.dieselPrice}
                  onChange={set('dieselPrice')}
                />
                <Field
                  label="Consommation moyenne de l'Audi A3"
                  suffix="L / 100 km"
                  value={profile.audiConso}
                  onChange={set('audiConso')}
                />
                <Field
                  label="Coût d'une vidange / entretien type"
                  suffix="€"
                  step="1"
                  value={profile.vidangeCost}
                  onChange={set('vidangeCost')}
                />
                <Field
                  label="Fréquence de vidange"
                  suffix="km"
                  step="500"
                  value={profile.vidangeFreqKm}
                  onChange={set('vidangeFreqKm')}
                />
              </div>
            </div>

            {/* Section 2 card */}
            <div className="bg-[#12171D] border border-[#1E252D] rounded-2xl p-6 md:p-8">
              <h2 className="text-[20px] font-semibold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                02 — Énergie maison
              </h2>
              <p className="text-[#8B96A3] text-[13px] mb-6">
                Le relevé annuel de ta borne à la maison : la quantité d'énergie chargée et le prix payé au kWh.
              </p>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field
                  label="Énergie chargée à la maison sur l'année"
                  suffix="kWh"
                  step="10"
                  value={homeEnergy.kwh}
                  onChange={setHome('kwh')}
                />
                <Field
                  label="Prix du kWh à la maison"
                  suffix="€ / kWh"
                  step="0.0001"
                  value={homeEnergy.pricePerKwh}
                  onChange={setHome('pricePerKwh')}
                />
              </div>

              <div className="mt-6 pt-5 border-t border-[#1E252D] flex items-center justify-between">
                <div>
                  <div className="text-[13px] text-[#8B96A3] mb-1">Coût total énergie maison</div>
                  <div className="text-[34px] font-bold font-mono text-[#5EEAD4]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatEUR(homeCost)}
                  </div>
                </div>
                <div className="w-1/2">
                  <Gauge value={homeCost} max={1000} accent="#5EEAD4" />
                </div>
              </div>
            </div>

            {/* Section 3 card */}
            <div className="bg-[#12171D] border border-[#1E252D] rounded-2xl p-6 md:p-8">
              <h2 className="text-[20px] font-semibold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                03 — Superchargeurs
              </h2>
              <p className="text-[#8B96A3] text-[13px] mb-6">
                Une ligne par session de charge sur ton compte Tesla : date, énergie chargée et prix payé au kWh.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2 min-w-[480px]">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wide text-[#5A6672]">
                      <th className="text-left font-medium pb-1 w-[30%]">Date</th>
                      <th className="text-left font-medium pb-1 w-[22%]">Énergie (kWh)</th>
                      <th className="text-left font-medium pb-1 w-[22%]">Prix (€/kWh)</th>
                      <th className="text-right font-medium pb-1 w-[20%]">Total (€)</th>
                      <th className="w-[6%]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {superRows.map((row) => {
                      const kwh = parseFloat(row.kwh) || 0;
                      const price = parseFloat(row.price) || 0;
                      const lineTotal = kwh * price;
                      return (
                        <tr key={row.id}>
                          <td className="pr-2">
                            <Cell
                              type="date"
                              value={row.date}
                              onChange={(v) => updateSuperRow(row.id, 'date', v)}
                            />
                          </td>
                          <td className="pr-2">
                            <Cell
                              type="number"
                              step="0.1"
                              placeholder="0,0"
                              value={row.kwh}
                              onChange={(v) => updateSuperRow(row.id, 'kwh', v)}
                            />
                          </td>
                          <td className="pr-2">
                            <Cell
                              type="number"
                              step="0.01"
                              placeholder="0,00"
                              value={row.price}
                              onChange={(v) => updateSuperRow(row.id, 'price', v)}
                            />
                          </td>
                          <td className="text-right pr-2 font-mono text-[13px] text-[#5EEAD4] whitespace-nowrap">
                            {formatEUR(lineTotal)}
                          </td>
                          <td>
                            <button
                              onClick={() => removeSuperRow(row.id)}
                              aria-label="Supprimer la ligne"
                              className="pdf-ignore flex items-center justify-center w-8 h-8 rounded-md text-[#5A6672] hover:text-[#F4A261] hover:bg-[#F4A261]/10 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button
                onClick={addSuperRow}
                className="pdf-ignore mt-3 flex items-center gap-1.5 text-[13px] font-medium text-[#5EEAD4] hover:text-[#9AF3E3] transition-colors"
              >
                <Plus size={15} />
                Ajouter une session de charge
              </button>

              <div className="mt-6 pt-5 border-t border-[#1E252D] grid sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-[13px] text-[#8B96A3] mb-1">Énergie totale chargée (superchargeurs)</div>
                  <div className="text-[28px] font-bold font-mono text-[#5EEAD4]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {superTotals.kwh.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} kWh
                  </div>
                </div>
                <div>
                  <div className="text-[13px] text-[#8B96A3] mb-1">Coût total superchargeurs</div>
                  <div className="text-[28px] font-bold font-mono text-[#5EEAD4]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatEUR(superTotals.cost)}
                  </div>
                  <Gauge value={superTotals.cost} max={1500} accent="#5EEAD4" />
                </div>
              </div>
            </div>

            {/* Section 4 card */}
            <div className="bg-[#12171D] border border-[#1E252D] rounded-2xl p-6 md:p-8">
              <h2 className="text-[20px] font-semibold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                04 — Entretien Tesla
              </h2>
              <p className="text-[#8B96A3] text-[13px] mb-6">
                Tes dépenses d'entretien sur l'année : pneus, révisions, accessoires, etc.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2 min-w-[480px]">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wide text-[#5A6672]">
                      <th className="text-left font-medium pb-1 w-[25%]">Date</th>
                      <th className="text-left font-medium pb-1 w-[50%]">Libellé</th>
                      <th className="text-right font-medium pb-1 w-[19%]">Montant (€)</th>
                      <th className="w-[6%]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceRows.map((row) => (
                      <tr key={row.id}>
                        <td className="pr-2">
                          <Cell
                            type="date"
                            value={row.date}
                            onChange={(v) => updateMaintenanceRow(row.id, 'date', v)}
                          />
                        </td>
                        <td className="pr-2">
                          <Cell
                            type="text"
                            placeholder="ex. Pneus avant"
                            value={row.label}
                            onChange={(v) => updateMaintenanceRow(row.id, 'label', v)}
                          />
                        </td>
                        <td className="pr-2">
                          <Cell
                            type="number"
                            step="1"
                            placeholder="0"
                            align="right"
                            value={row.amount}
                            onChange={(v) => updateMaintenanceRow(row.id, 'amount', v)}
                          />
                        </td>
                        <td>
                          <button
                            onClick={() => removeMaintenanceRow(row.id)}
                            aria-label="Supprimer la ligne"
                            className="pdf-ignore flex items-center justify-center w-8 h-8 rounded-md text-[#5A6672] hover:text-[#F4A261] hover:bg-[#F4A261]/10 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={addMaintenanceRow}
                className="pdf-ignore mt-3 flex items-center gap-1.5 text-[13px] font-medium text-[#5EEAD4] hover:text-[#9AF3E3] transition-colors"
              >
                <Plus size={15} />
                Ajouter une dépense
              </button>

              <div className="mt-6 pt-5 border-t border-[#1E252D] flex items-center justify-between">
                <div>
                  <div className="text-[13px] text-[#8B96A3] mb-1">Coût total entretien Tesla</div>
                  <div className="text-[34px] font-bold font-mono text-[#5EEAD4]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatEUR(maintenanceTotal)}
                  </div>
                </div>
                <div className="w-1/2">
                  <Gauge value={maintenanceTotal} max={600} accent="#5EEAD4" />
                </div>
              </div>
            </div>

            {/* Section 5 card */}
            <div className="bg-[#12171D] border border-[#1E252D] rounded-2xl p-6 md:p-8">
              <h2 className="text-[20px] font-semibold mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                05 — Bilan comparatif
              </h2>
              <p className="text-[#8B96A3] text-[13px] mb-6">
                Tesla (teal) vs Audi A3 diesel équivalente (amber), pour {profile.teslaKm || 0} km parcourus cette année.
              </p>

              <div className="flex flex-col items-center text-center bg-[#0E1318] border border-[#1E252D] rounded-xl py-6 mb-6">
                <div className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#5A6672] mb-2">
                  Économie totale sur l'année
                </div>
                <div
                  className="text-[44px] md:text-[52px] font-bold font-mono"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: totalSavings >= 0 ? '#5EEAD4' : '#F4A261',
                  }}
                >
                  {totalSavings >= 0 ? '+' : ''}{formatEUR(totalSavings)}
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <CompareBar label="Énergie" teslaValue={teslaEnergyCost} audiValue={dieselCost} />
                <CompareBar label="Entretien" teslaValue={maintenanceTotal} audiValue={vidangeCostTotal} />
                <CompareBar label="Total" teslaValue={teslaTotalCost} audiValue={audiTotalCost} />
              </div>

              <div className="mt-6" style={{ height: 220, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E252D" vertical={false} />
                    <XAxis dataKey="name" stroke="#5A6672" tick={{ fontSize: 12, fontFamily: 'Inter' }} />
                    <YAxis stroke="#5A6672" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} width={50} />
                    <Tooltip
                      contentStyle={{ background: '#0E1318', border: '1px solid #262E37', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: '#F4F2ED' }}
                      formatter={(value) => formatEUR(value)}
                    />
                    <Bar dataKey="Tesla" fill="#5EEAD4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Audi A3" fill="#F4A261" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 pt-5 border-t border-[#1E252D] grid sm:grid-cols-2 gap-6 text-[13px]">
                <div>
                  <div className="text-[#8B96A3] mb-1">Coût total Tesla (énergie + entretien)</div>
                  <div className="font-mono font-bold text-[#5EEAD4] text-[18px]">{formatEUR(teslaTotalCost)}</div>
                </div>
                <div>
                  <div className="text-[#8B96A3] mb-1">Coût total Audi A3 équivalent</div>
                  <div className="font-mono font-bold text-[#F4A261] text-[18px]">{formatEUR(audiTotalCost)}</div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[#1E252D]">
                <div className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#5A6672] mb-3">
                  Bilan en quelques mots
                </div>
                <p className="text-[14px] leading-relaxed text-[#C9CFD6]">{bilanText}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

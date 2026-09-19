import { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Printer,
  Trash2,
  Calendar,
  Download,
} from 'lucide-react';
import { Paiement, Classe, MOIS_SCOLAIRES } from '../types';
import { formatMontant, formatDate, getModePaiementLabel } from '../utils/formatters';

interface HistoriqueViewProps {
  paiements: Paiement[];
  classes: Classe[];
  onViewRecu: (paiement: Paiement) => void;
  onRequestDeletePaiement: (paiement: Paiement) => void;
}

export function HistoriqueView({
  paiements,
  classes,
  onViewRecu,
  onRequestDeletePaiement,
}: HistoriqueViewProps) {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [filterMois, setFilterMois] = useState('all');
  const [filterClasse, setFilterClasse] = useState('all');

  const filteredPaiements = useMemo(() => {
    return paiements.filter((p) => {
      const matchSearch =
        p.numeroRecu.toLowerCase().includes(search.toLowerCase()) ||
        p.eleveNom.toLowerCase().includes(search.toLowerCase()) ||
        p.eleveMatricule.toLowerCase().includes(search.toLowerCase());

      const matchMode = filterMode === 'all' || p.modePaiement === filterMode;
      const matchMois = filterMois === 'all' || p.mois === filterMois;
      const matchClasse = filterClasse === 'all' || p.classeNom.includes(filterClasse);

      return matchSearch && matchMode && matchMois && matchClasse;
    });
  }, [paiements, search, filterMode, filterMois, filterClasse]);

  const totalMontantEncaisse = filteredPaiements.reduce((acc, p) => acc + p.montantPaye, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4" />
            <span>Journal de Caisse</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 font-serif">
            Historique Général des Paiements ({paiements.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registre des encaissements, recherche de reçus et réimpression
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200 text-right">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">
              Total Sélectionné
            </span>
            <span className="text-base font-bold font-mono text-emerald-950">
              {formatMontant(totalMontantEncaisse)}
            </span>
          </div>

          <button
            onClick={handlePrint}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer no-print border border-slate-200"
            title="Imprimer le registre"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between no-print">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Rechercher par n° de reçu, élève, matricule..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Mode de paiement */}
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">Tous les modes</option>
            <option value="wave">Wave</option>
            <option value="orange_money">Orange Money</option>
            <option value="especes">Espèces</option>
            <option value="virement">Virement</option>
          </select>

          {/* Mois */}
          <select
            value={filterMois}
            onChange={(e) => setFilterMois(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">Tous les mois</option>
            {MOIS_SCOLAIRES.map((m) => (
              <option key={m.cle} value={m.cle}>
                {m.nom}
              </option>
            ))}
          </select>

          {/* Classe */}
          <select
            value={filterClasse}
            onChange={(e) => setFilterClasse(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">Toutes les classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.nom}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredPaiements.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Aucun paiement ne correspond aux filtres sélectionnés.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Numéro de reçu</th>
                  <th className="py-3 px-4">Élève</th>
                  <th className="py-3 px-4">Classe</th>
                  <th className="py-3 px-4">Mois</th>
                  <th className="py-3 px-4 text-right">Montant</th>
                  <th className="py-3 px-4">Mode de règlement</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Administrateur</th>
                  <th className="py-3 px-4 text-center no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPaiements.map((p) => {
                  const mode = getModePaiementLabel(p.modePaiement);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                        {p.numeroRecu}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{p.eleveNom}</div>
                        <div className="font-mono text-[10px] text-slate-400">
                          {p.eleveMatricule}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{p.classeNom}</td>
                      <td className="py-3.5 px-4 capitalize font-semibold text-slate-800">
                        {p.mois}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                        {formatMontant(p.montantPaye)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${mode.bg}`}>
                          {mode.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{formatDate(p.datePaiement)}</td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] truncate max-w-[140px]">
                        {p.adminNom}
                      </td>
                      <td className="py-3.5 px-4 text-center no-print">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onViewRecu(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Réimprimer le reçu"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Reçu</span>
                          </button>
                          <button
                            onClick={() => onRequestDeletePaiement(p)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Annuler ce paiement"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

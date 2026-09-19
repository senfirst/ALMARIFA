import { useState } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Eleve, Classe, Mensualite, MOIS_SCOLAIRES, MoisCle } from '../types';
import { formatMontant, formatDate } from '../utils/formatters';

interface MensualitesViewProps {
  eleves: Eleve[];
  classes: Classe[];
  mensualites: Mensualite[];
  onOpenPaiementModal: (eleveId: string, mois?: MoisCle) => void;
  onViewStudentCard: (eleve: Eleve) => void;
}

export function MensualitesView({
  eleves,
  classes,
  mensualites,
  onOpenPaiementModal,
  onViewStudentCard,
}: MensualitesViewProps) {
  const [search, setSearch] = useState('');
  const [filterClasse, setFilterClasse] = useState('all');
  const [filterStatut, setFilterStatut] = useState<'all' | 'retard' | 'a_jour'>('all');
  const [expandedEleveId, setExpandedEleveId] = useState<string | null>(null);

  // Filter students
  const filteredEleves = eleves.filter((eleve) => {
    const matchesSearch = `${eleve.nom} ${eleve.prenom} ${eleve.matricule}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesClasse = filterClasse === 'all' || eleve.classeId === filterClasse;

    const studentMs = mensualites.filter((m) => m.eleveId === eleve.id);
    const hasUnpaid = studentMs.some((m) => m.statut !== 'paye');

    let matchesStatut = true;
    if (filterStatut === 'retard') matchesStatut = hasUnpaid;
    if (filterStatut === 'a_jour') matchesStatut = !hasUnpaid;

    return matchesSearch && matchesClasse && matchesStatut;
  });

  const toggleExpand = (id: string) => {
    setExpandedEleveId(expandedEleveId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <CalendarCheck className="w-4 h-4" />
            <span>Suivi Annuel</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 font-serif">
            Gestion des Mensualités (Septembre — Juin)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Grille de statut mensuel : Payé ✅, Non payé ❌, Paiement partiel 🟠
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Payé ✅</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Paiement partiel 🟠</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-bold">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Non payé ❌</span>
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Rechercher par élève ou matricule..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={filterClasse}
            onChange={(e) => setFilterClasse(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">Toutes les classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>

          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="all">Tous les statuts</option>
            <option value="retard">⚠️ En retard / Impayés</option>
            <option value="a_jour">✅ Entièrement à jour</option>
          </select>
        </div>
      </div>

      {/* Student Monthly Matrix Cards */}
      <div className="space-y-3">
        {filteredEleves.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-400 text-xs rounded-2xl border border-slate-200">
            Aucun élève trouvé avec ces critères de filtre.
          </div>
        ) : (
          filteredEleves.map((eleve) => {
            const studentMs = mensualites.filter((m) => m.eleveId === eleve.id);
            const totalPaye = studentMs.reduce((acc, m) => acc + m.montantPaye, 0);
            const totalRestant = studentMs.reduce((acc, m) => acc + m.montantRestant, 0);
            const isExpanded = expandedEleveId === eleve.id;

            return (
              <div
                key={eleve.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden hover:border-emerald-300 transition-all"
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(eleve.id)}
                  className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                      {eleve.nom.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {eleve.nom} {eleve.prenom}
                        </span>
                        <span className="font-mono text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {eleve.matricule}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Classe : <strong className="text-slate-700">{eleve.classeNom}</strong> •
                        Tarif : {formatMontant(eleve.montantMensuel)}/mois
                      </p>
                    </div>
                  </div>

                  {/* Summary Badges & Quick Action */}
                  <div className="flex items-center gap-4 self-end md:self-auto text-xs">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Reste à payer</span>
                      <span
                        className={`font-mono font-bold text-sm ${
                          totalRestant === 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {formatMontant(totalRestant)}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewStudentCard(eleve);
                      }}
                      className="px-3 py-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                    >
                      Fiche complète
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(eleve.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 10-Months Visual Pills Bar (Always visible) */}
                <div className="px-4 pb-4 pt-1 border-t border-slate-100">
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                    {MOIS_SCOLAIRES.map((m) => {
                      const ms = studentMs.find((item) => item.mois === m.cle);
                      const isPaye = ms?.statut === 'paye';
                      const isPartiel = ms?.statut === 'partiel';

                      return (
                        <button
                          key={m.cle}
                          onClick={() => onOpenPaiementModal(eleve.id, m.cle)}
                          className={`p-2 rounded-xl text-center transition-all cursor-pointer border ${
                            isPaye
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : isPartiel
                              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                          title={`${m.nom} : ${
                            isPaye
                              ? 'Payé'
                              : isPartiel
                              ? `Partiel (Reste: ${formatMontant(ms?.montantRestant)})`
                              : 'Non payé'
                          } — Cliquer pour encaisser`}
                        >
                          <div className="text-[11px] font-bold truncate">{m.nom.slice(0, 4)}.</div>
                          <div className="text-[10px] mt-0.5 font-bold">
                            {isPaye ? '✅ Payé' : isPartiel ? '🟠 Partiel' : '❌ Non'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Detailed Table when expanded */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50 border-t border-slate-200">
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Mois</th>
                            <th className="py-2.5 px-3">Statut automatique</th>
                            <th className="py-2.5 px-3 text-right">Montant Prévu</th>
                            <th className="py-2.5 px-3 text-right">Montant Payé</th>
                            <th className="py-2.5 px-3 text-right">Montant Restant</th>
                            <th className="py-2.5 px-3">Date Paiement</th>
                            <th className="py-2.5 px-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {MOIS_SCOLAIRES.map((m) => {
                            const ms = studentMs.find((item) => item.mois === m.cle);
                            const isPaye = ms?.statut === 'paye';
                            const isPartiel = ms?.statut === 'partiel';
                            const montantPrevu = ms?.montantPrevu ?? eleve.montantMensuel;
                            const montantPaye = ms?.montantPaye ?? 0;
                            const montantRestant = ms?.montantRestant ?? montantPrevu;

                            return (
                              <tr key={m.cle} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-semibold capitalize text-slate-900">
                                  {m.nom}
                                </td>
                                <td className="py-2 px-3">
                                  {isPaye ? (
                                    <span className="font-bold text-emerald-700">Payé ✅</span>
                                  ) : isPartiel ? (
                                    <span className="font-bold text-amber-700">
                                      Paiement partiel 🟠
                                    </span>
                                  ) : (
                                    <span className="font-bold text-rose-700">Non payé ❌</span>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-right font-mono text-slate-600">
                                  {formatMontant(montantPrevu)}
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                                  {formatMontant(montantPaye)}
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold">
                                  {montantRestant === 0 ? (
                                    <span className="text-emerald-700">0 FCFA</span>
                                  ) : (
                                    <span className="text-rose-700">
                                      {formatMontant(montantRestant)}
                                    </span>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-slate-500">
                                  {formatDate(ms?.dateDernierPaiement)}
                                </td>
                                <td className="py-2 px-3 text-center">
                                  {!isPaye && (
                                    <button
                                      onClick={() => onOpenPaiementModal(eleve.id, m.cle)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                                    >
                                      <CreditCard className="w-3 h-3" />
                                      <span>Encaisser</span>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

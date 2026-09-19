import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Users,
  CreditCard,
  Printer,
  Calendar,
  Layers,
  Search,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Eleve, Classe, Mensualite, Paiement, MOIS_SCOLAIRES, SchoolConfig } from '../types';
import { formatMontant } from '../utils/formatters';

interface RapportsViewProps {
  eleves: Eleve[];
  classes: Classe[];
  mensualites: Mensualite[];
  paiements: Paiement[];
  config: SchoolConfig;
  onViewStudentCard: (eleve: Eleve) => void;
}

export function RapportsView({
  eleves,
  classes,
  mensualites,
  paiements,
  config,
  onViewStudentCard,
}: RapportsViewProps) {
  const [selectedEleveSearch, setSelectedEleveSearch] = useState('');

  // 1. Total des mensualités encaissées & total des impayés
  const totalEncaisse = paiements.reduce((acc, p) => acc + p.montantPaye, 0);
  const totalImpayes = mensualites.reduce((acc, m) => acc + m.montantRestant, 0);
  const totalPrevuGlobal = mensualites.reduce((acc, m) => acc + m.montantPrevu, 0);
  const tauxRecouvrementGlobal =
    totalPrevuGlobal > 0 ? Math.round((totalEncaisse / totalPrevuGlobal) * 100) : 0;

  // 2. Recettes par mois
  const recettesParMois = MOIS_SCOLAIRES.map((m) => {
    const ms = mensualites.filter((item) => item.mois === m.cle);
    const paye = ms.reduce((acc, item) => acc + item.montantPaye, 0);
    const restant = ms.reduce((acc, item) => acc + item.montantRestant, 0);
    const prevu = ms.reduce((acc, item) => acc + item.montantPrevu, 0);
    const taux = prevu > 0 ? Math.round((paye / prevu) * 100) : 0;
    return {
      cle: m.cle,
      nom: m.nom,
      paye,
      restant,
      prevu,
      taux,
    };
  });

  // Max revenue for relative chart scale
  const maxMoisPaye = Math.max(...recettesParMois.map((r) => r.paye), 1);

  // 3. Paiements par classe
  const paiementsParClasse = classes.map((cls) => {
    const elevesDeClasse = eleves.filter((e) => e.classeId === cls.id);
    const elevesIds = new Set(elevesDeClasse.map((e) => e.id));

    const msClasse = mensualites.filter((m) => elevesIds.has(m.eleveId));
    const paye = msClasse.reduce((acc, m) => acc + m.montantPaye, 0);
    const restant = msClasse.reduce((acc, m) => acc + m.montantRestant, 0);
    const prevu = msClasse.reduce((acc, m) => acc + m.montantPrevu, 0);
    const taux = prevu > 0 ? Math.round((paye / prevu) * 100) : 0;

    return {
      id: cls.id,
      nom: cls.nom,
      countEleves: elevesDeClasse.length,
      paye,
      restant,
      prevu,
      taux,
    };
  });

  // 4. Paiements par mode de paiement (Wave, Orange Money, Espèces, Virement)
  const modes = [
    { key: 'wave', label: 'Wave', color: 'bg-sky-500', text: 'text-sky-600', bgLight: 'bg-sky-50' },
    { key: 'orange_money', label: 'Orange Money', color: 'bg-orange-500', text: 'text-orange-600', bgLight: 'bg-orange-50' },
    { key: 'especes', label: 'Espèces', color: 'bg-emerald-600', text: 'text-emerald-600', bgLight: 'bg-emerald-50' },
    { key: 'virement', label: 'Virement / Chèque', color: 'bg-purple-600', text: 'text-purple-600', bgLight: 'bg-purple-50' },
  ];

  const paiementsParMode = modes.map((m) => {
    const filtered = paiements.filter((p) => p.modePaiement === m.key);
    const total = filtered.reduce((acc, p) => acc + p.montantPaye, 0);
    const count = filtered.length;
    const part = totalEncaisse > 0 ? Math.round((total / totalEncaisse) * 100) : 0;
    return {
      ...m,
      total,
      count,
      part,
    };
  });

  // Filtered students for individual situation lookup
  const searchStudents = eleves.filter((e) =>
    `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(selectedEleveSearch.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Analytique Financière</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 font-serif">
            Rapports & Situation Financière Globale
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bilan des recettes, analyse par classe et par mode de versement
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer no-print border border-slate-200 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimer le rapport</span>
        </button>
      </div>

      {/* Global Financial KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Encaissé
          </span>
          <div className="text-xl font-black font-mono text-emerald-700">
            {formatMontant(totalEncaisse)}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{tauxRecouvrementGlobal}% du budget perçu</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total des Impayés
          </span>
          <div className="text-xl font-black font-mono text-rose-700">
            {formatMontant(totalImpayes)}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-rose-600 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Sommes à recouvrer</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Budget Scolaire Annuel
          </span>
          <div className="text-xl font-black font-mono text-slate-900">
            {formatMontant(totalPrevuGlobal)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">10 mois × {eleves.length} élèves</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Taux de Recouvrement
          </span>
          <div className="text-xl font-black font-mono text-slate-900">
            {tauxRecouvrementGlobal} %
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full"
              style={{ width: `${Math.min(100, tauxRecouvrementGlobal)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recettes par mois (Graphique Visuel) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recettes Encaissées par Mois</h3>
            <p className="text-xs text-slate-500">
              Historique des versements pour chacun des 10 mois de l'année scolaire
            </p>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-3 items-end pt-4 pb-2 border-b border-slate-100">
          {recettesParMois.map((m) => {
            const heightPercent = maxMoisPaye > 0 ? (m.paye / maxMoisPaye) * 100 : 0;
            return (
              <div key={m.cle} className="flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-mono font-bold text-emerald-800 opacity-80 group-hover:opacity-100 transition-opacity">
                  {Math.round(m.paye / 1000)}k
                </span>
                <div className="w-full h-36 bg-slate-50 rounded-xl p-1 flex items-end justify-center border border-slate-100">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-lg transition-all group-hover:brightness-110"
                    style={{ height: `${Math.max(8, heightPercent)}%` }}
                    title={`${m.nom} : ${formatMontant(m.paye)} encaissé`}
                  />
                </div>
                <div className="text-center">
                  <span className="text-[11px] font-bold text-slate-700 block truncate">
                    {m.nom.slice(0, 4)}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 font-semibold">
                    {m.taux}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Modes de paiement + Classement par classe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paiements par mode de paiement (Wave, Orange Money, Espèces, Virement) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <h3 className="text-base font-bold text-slate-900">
                Paiements par Mode de Règlement
              </h3>
            </div>

            <div className="space-y-3">
              {paiementsParMode.map((item) => (
                <div
                  key={item.key}
                  className={`p-4 rounded-xl border border-slate-200 ${item.bgLight} flex items-center justify-between`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        {item.label}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {item.count} versement(s)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-slate-900 block">
                      {formatMontant(item.total)}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600">
                      {item.part}% du volume
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Paiements par classe */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">Situation par Classe</h3>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[340px] pr-1">
            {paiementsParClasse.map((c) => (
              <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900">
                    {c.nom} ({c.countEleves} élève{c.countEleves > 1 ? 's' : ''})
                  </span>
                  <span className="font-mono font-bold text-emerald-700">
                    {formatMontant(c.paye)}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-1">
                  <div
                    className={`h-full rounded-full ${
                      c.taux >= 70 ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, c.taux)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Taux : <strong>{c.taux}%</strong></span>
                  <span>Reste dû : <strong className="text-rose-600">{formatMontant(c.restant)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historique d'un élève (Recherche rapide & impression de fiche financière) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Historique Financier d'un Élève en Particulier
            </h3>
            <p className="text-xs text-slate-500">
              Recherchez un élève pour générer sa fiche financière annuelle et son relevé de compte
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Rechercher élève ou matricule..."
              value={selectedEleveSearch}
              onChange={(e) => setSelectedEleveSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {searchStudents.slice(0, 8).map((eleve) => {
            const studentMs = mensualites.filter((m) => m.eleveId === eleve.id);
            const restant = studentMs.reduce((acc, m) => acc + m.montantRestant, 0);

            return (
              <button
                key={eleve.id}
                onClick={() => onViewStudentCard(eleve)}
                className="p-3 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-900 truncate">
                  {eleve.nom} {eleve.prenom}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{eleve.classeNom}</div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-500">{eleve.matricule}</span>
                  <span
                    className={`font-mono font-bold ${
                      restant === 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {restant === 0 ? 'Soldé' : formatMontant(restant)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

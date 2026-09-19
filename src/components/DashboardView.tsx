import { useState } from 'react';
import {
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  Printer,
  Calendar,
  Layers,
  Phone,
  Sparkles,
} from 'lucide-react';
import { Eleve, Mensualite, Paiement, MOIS_SCOLAIRES, SchoolConfig } from '../types';
import { formatMontant, formatDate, getModePaiementLabel } from '../utils/formatters';

interface DashboardViewProps {
  eleves: Eleve[];
  mensualites: Mensualite[];
  paiements: Paiement[];
  config: SchoolConfig;
  onOpenPaiementModal: (eleveId?: string, mois?: any) => void;
  onOpenNewEleveModal: () => void;
  onViewRecu: (paiement: Paiement) => void;
  onNavigateTab: (tab: any) => void;
}

export function DashboardView({
  eleves,
  mensualites,
  paiements,
  config,
  onOpenPaiementModal,
  onOpenNewEleveModal,
  onViewRecu,
  onNavigateTab,
}: DashboardViewProps) {
  // Calculations
  const totalEleves = eleves.length;

  // Total encaissé (all actual payments recorded)
  const totalEncaisse = paiements.reduce((acc, p) => acc + p.montantPaye, 0);

  // Total restant à payer
  const totalRestant = mensualites.reduce((acc, m) => acc + m.montantRestant, 0);

  // Total budget prévu de l'année scolaire
  const totalBudgetPrevu = mensualites.reduce((acc, m) => acc + m.montantPrevu, 0);

  // Élèves à jour vs en retard
  // Un élève est à jour si aucune de ses mensualités n'a un statut 'non_paye' ou 'partiel' pour les mois passés/en cours
  // Or check if all months are paid or check students with arrears:
  const elevesMap = new Map<string, { totalRestant: number; aPartiel: boolean }>();
  eleves.forEach((e) => {
    elevesMap.set(e.id, { totalRestant: 0, aPartiel: false });
  });

  mensualites.forEach((m) => {
    const data = elevesMap.get(m.eleveId);
    if (data) {
      data.totalRestant += m.montantRestant;
      if (m.statut === 'partiel') {
        data.aPartiel = true;
      }
    }
  });

  let elevesAJour = 0;
  let elevesEnRetard = 0;
  let elevesAvecPaiementPartiel = 0;

  elevesMap.forEach((val) => {
    if (val.totalRestant === 0) {
      elevesAJour++;
    } else {
      elevesEnRetard++;
    }
    if (val.aPartiel) {
      elevesAvecPaiementPartiel++;
    }
  });

  // Current month summary (using current calendar month mapped to school month or default to latest with activity)
  const currentMonthCle = 'septembre'; // Can be selected
  const [selectedMoisApercu, setSelectedMoisApercu] = useState<'septembre' | 'octobre' | 'novembre' | 'decembre' | 'janvier' | 'fevrier' | 'mars' | 'avril' | 'mai' | 'juin'>('septembre');

  const mensualitesMoisApercu = mensualites.filter((m) => m.mois === selectedMoisApercu);
  const encaisseMoisApercu = mensualitesMoisApercu.reduce((acc, m) => acc + m.montantPaye, 0);
  const restantMoisApercu = mensualitesMoisApercu.reduce((acc, m) => acc + m.montantRestant, 0);
  const payeMoisApercuCount = mensualitesMoisApercu.filter((m) => m.statut === 'paye').length;
  const partielMoisApercuCount = mensualitesMoisApercu.filter((m) => m.statut === 'partiel').length;
  const impayeMoisApercuCount = mensualitesMoisApercu.filter((m) => m.statut === 'non_paye').length;

  // Monthly Revenue Bars Data
  const monthlyStats = MOIS_SCOLAIRES.map((m) => {
    const ms = mensualites.filter((item) => item.mois === m.cle);
    const paye = ms.reduce((acc, item) => acc + item.montantPaye, 0);
    const prevu = ms.reduce((acc, item) => acc + item.montantPrevu, 0);
    const taux = prevu > 0 ? Math.round((paye / prevu) * 100) : 0;
    return {
      cle: m.cle,
      nom: m.nom,
      paye,
      prevu,
      taux,
    };
  });

  // Recent 5 payments
  const recentPaiements = paiements.slice(0, 6);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-emerald-700/30">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/10 rounded-full text-xs font-semibold text-emerald-200 mb-2 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Année Scolaire {config.anneeScolaire}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
            Tableau de bord — {config.nomEtablissement}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200 mt-1 max-w-xl">
            Suivi en temps réel des encaissements des mensualités et de l'état des cotisations des élèves.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            onClick={() => onOpenPaiementModal()}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Encaisser un paiement</span>
          </button>
          <button
            onClick={onOpenNewEleveModal}
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer border border-white/20"
          >
            + Inscrire un élève
          </button>
        </div>
      </div>

      {/* 6 Key Statistics Cards (Prompt Section 1) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1: Total Élèves */}
        <div
          onClick={() => onNavigateTab('eleves')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Élèves
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalEleves}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Inscrits cette année</p>
        </div>

        {/* Card 2: Élèves à jour */}
        <div
          onClick={() => onNavigateTab('mensualites')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Élèves à jour
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 transition-colors">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {elevesAJour}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {totalEleves > 0 ? Math.round((elevesAJour / totalEleves) * 100) : 0}% des effectifs
          </p>
        </div>

        {/* Card 3: Élèves en retard */}
        <div
          onClick={() => onNavigateTab('impayes')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
              En Retard
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-100 transition-colors">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700 font-mono">
            {elevesEnRetard}
          </div>
          <p className="text-[11px] text-rose-600 font-medium mt-1">Relances requises</p>
        </div>

        {/* Card 4: Paiements Partiels */}
        <div
          onClick={() => onNavigateTab('impayes')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Partiels
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-100 transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">
            {elevesAvecPaiementPartiel}
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Acomptes versés</p>
        </div>

        {/* Card 5: Total Encaissé */}
        <div
          onClick={() => onNavigateTab('historique')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Total Encaissé
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-800 font-mono truncate">
            {formatMontant(totalEncaisse)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Recouvrement cumulé</p>
        </div>

        {/* Card 6: Total Restant à Payer */}
        <div
          onClick={() => onNavigateTab('impayes')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Reste à Payer
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700 group-hover:bg-rose-100 transition-colors">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-rose-700 font-mono truncate">
            {formatMontant(totalRestant)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Toutes mensualités</p>
        </div>
      </div>

      {/* Résumé des paiements du mois (Section 1 du prompt) & Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Deep Dive Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Résumé Mensuel</h3>
                <p className="text-xs text-slate-500">Sélectionnez le mois à inspecter</p>
              </div>
              <select
                value={selectedMoisApercu}
                onChange={(e) => setSelectedMoisApercu(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              >
                {MOIS_SCOLAIRES.map((m) => (
                  <option key={m.cle} value={m.cle}>
                    {m.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Monthly mini cards */}
            <div className="space-y-3 mt-4">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-800 font-medium block">
                    Encaissé pour ce mois
                  </span>
                  <span className="text-base font-bold font-mono text-emerald-950">
                    {formatMontant(encaisseMoisApercu)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 px-2 py-0.5 rounded-md bg-emerald-100">
                    {payeMoisApercuCount} soldés
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-rose-800 font-medium block">
                    Reste dû pour ce mois
                  </span>
                  <span className="text-base font-bold font-mono text-rose-950">
                    {formatMontant(restantMoisApercu)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-rose-700 px-2 py-0.5 rounded-md bg-rose-100">
                    {impayeMoisApercuCount} non payés
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-amber-800 font-medium block">
                    Paiements partiels
                  </span>
                  <span className="text-sm font-bold text-amber-900">
                    {partielMoisApercuCount} élèves avec acompte
                  </span>
                </div>
                <div className="text-right text-xs font-mono font-bold text-amber-800">
                  🟠 En attente
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Taux recouvrement :{' '}
              <strong className="text-slate-800">
                {encaisseMoisApercu + restantMoisApercu > 0
                  ? Math.round(
                      (encaisseMoisApercu / (encaisseMoisApercu + restantMoisApercu)) * 100
                    )
                  : 0}
                %
              </strong>
            </span>
            <button
              onClick={() => onNavigateTab('impayes')}
              className="text-xs text-emerald-700 font-bold hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Voir les impayés du mois</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Annual Progression Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Progression des Recettes par Mois
              </h3>
              <p className="text-xs text-slate-500">
                Montants perçus comparés aux prévisions (Septembre — Juin)
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              10 Mois Scolaires
            </span>
          </div>

          <div className="space-y-2.5 mt-4">
            {monthlyStats.map((item) => (
              <div key={item.cle} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-700 w-24 truncate">{item.nom}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-emerald-700 font-bold">
                      {formatMontant(item.paye)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      / {formatMontant(item.prevu)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[40px] text-center ${
                        item.taux >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.taux >= 40
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.taux}%
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.taux >= 80
                        ? 'bg-emerald-600'
                        : item.taux >= 40
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${Math.min(100, item.taux)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Payments Section with Quick Receipt Reprint */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Derniers Paiements Enregistrés</h3>
            <p className="text-xs text-slate-500">
              Consultez et réimprimez les derniers reçus de scolarité
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('historique')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Voir tout l'historique</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentPaiements.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Aucun paiement enregistré pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Reçu N°</th>
                  <th className="py-2.5 px-3">Élève</th>
                  <th className="py-2.5 px-3">Classe</th>
                  <th className="py-2.5 px-3">Mois</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3 text-right">Montant</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPaiements.map((p) => {
                  const mode = getModePaiementLabel(p.modePaiement);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-emerald-800">
                        {p.numeroRecu}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900">{p.eleveNom}</td>
                      <td className="py-3 px-3 text-slate-600">{p.classeNom}</td>
                      <td className="py-3 px-3 capitalize font-semibold text-slate-700">
                        {p.mois}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${mode.bg}`}>
                          {mode.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                        {formatMontant(p.montantPaye)}
                      </td>
                      <td className="py-3 px-3 text-slate-500">{formatDate(p.datePaiement)}</td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onViewRecu(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer border border-emerald-200"
                          title="Imprimer le reçu"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Reçu</span>
                        </button>
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

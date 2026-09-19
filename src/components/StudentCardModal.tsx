import { useState } from 'react';
import { User, X, Phone, Calendar, Printer, CreditCard, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Eleve, Mensualite, Paiement, MOIS_SCOLAIRES, SchoolConfig } from '../types';
import { formatMontant, formatDateComplete, formatDate, getModePaiementLabel } from '../utils/formatters';

interface StudentCardModalProps {
  eleve: Eleve | null;
  mensualites: Mensualite[];
  paiements: Paiement[];
  config: SchoolConfig;
  isOpen: boolean;
  onClose: () => void;
  onOpenPaiementModal: (eleveId: string, mois: any) => void;
  onViewRecu: (paiement: Paiement) => void;
}

export function StudentCardModal({
  eleve,
  mensualites,
  paiements,
  config,
  isOpen,
  onClose,
  onOpenPaiementModal,
  onViewRecu,
}: StudentCardModalProps) {
  if (!isOpen || !eleve) return null;

  const studentMensualites = mensualites.filter((m) => m.eleveId === eleve.id);
  const studentPaiements = paiements.filter((p) => p.eleveId === eleve.id);

  const totalPrevu = studentMensualites.reduce((acc, m) => acc + m.montantPrevu, 0);
  const totalPaye = studentMensualites.reduce((acc, m) => acc + m.montantPaye, 0);
  const totalRestant = studentMensualites.reduce((acc, m) => acc + m.montantRestant, 0);

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold">Fiche Financière Individuelle de l'Élève</h2>
              <p className="text-xs text-slate-400">
                {eleve.prenom} {eleve.nom} ({eleve.matricule}) — {eleve.classeNom}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintCard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer la fiche</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Student Folder Sheet */}
        <div className="p-6 space-y-6">
          {/* Identity Block */}
          <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block mb-0.5">
                {config.nomEtablissement} • {config.anneeScolaire}
              </span>
              <h3 className="text-xl font-bold text-slate-900 font-serif">
                {eleve.nom} {eleve.prenom}
              </h3>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600">
                <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200 font-semibold text-emerald-900">
                  Matricule: {eleve.matricule}
                </span>
                <span className="font-semibold text-slate-800">
                  Classe: {eleve.classeNom}
                </span>
                <span className="flex items-center gap-1 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {eleve.telephoneParent}
                </span>
              </div>
            </div>

            {/* Financial Status Badges */}
            <div className="text-right shrink-0 bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Solde Restant Global
              </span>
              <span
                className={`text-lg font-mono font-black ${
                  totalRestant === 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {formatMontant(totalRestant)}
              </span>
              <span className="block text-[10px] font-semibold text-slate-500">
                {totalRestant === 0 ? '✅ Tout est soldé' : '⚠️ En retard sur certains mois'}
              </span>
            </div>
          </div>

          {/* 3 Summary Counters */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Montant Annuel Prévu</span>
              <span className="text-sm font-bold font-mono text-slate-800">
                {formatMontant(totalPrevu)}
              </span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[11px] text-emerald-700 block">Total Déjà Payé</span>
              <span className="text-sm font-bold font-mono text-emerald-800">
                {formatMontant(totalPaye)}
              </span>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-[11px] text-rose-700 block">Reste à Recouvrer</span>
              <span className="text-sm font-bold font-mono text-rose-800">
                {formatMontant(totalRestant)}
              </span>
            </div>
          </div>

          {/* 10-Month Status Grid (Prompt Section 3) */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              État détaillé des 10 Mensualités de l'année scolaire
            </h4>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Mois</th>
                    <th className="py-2.5 px-3">Statut</th>
                    <th className="py-2.5 px-3 text-right">Prévu</th>
                    <th className="py-2.5 px-3 text-right">Payé</th>
                    <th className="py-2.5 px-3 text-right">Reste</th>
                    <th className="py-2.5 px-3">Dernier Versement</th>
                    <th className="py-2.5 px-3 text-center no-print">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOIS_SCOLAIRES.map((m) => {
                    const ms = studentMensualites.find((item) => item.mois === m.cle);
                    const isPaye = ms?.statut === 'paye';
                    const isPartiel = ms?.statut === 'partiel';
                    const restant = ms?.montantRestant ?? eleve.montantMensuel;

                    return (
                      <tr key={m.cle} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-800 capitalize">
                          {m.nom}
                        </td>
                        <td className="py-2.5 px-3">
                          {isPaye ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Payé ✅</span>
                            </span>
                          ) : isPartiel ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <Clock className="w-3 h-3" />
                              <span>Paiement partiel 🟠</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              <AlertCircle className="w-3 h-3" />
                              <span>Non payé ❌</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                          {formatMontant(ms?.montantPrevu ?? eleve.montantMensuel)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                          {formatMontant(ms?.montantPaye ?? 0)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          {restant === 0 ? (
                            <span className="text-emerald-700">0 FCFA</span>
                          ) : (
                            <span className="text-rose-700">{formatMontant(restant)}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {formatDate(ms?.dateDernierPaiement)}
                        </td>
                        <td className="py-2.5 px-3 text-center no-print">
                          {!isPaye && (
                            <button
                              onClick={() => {
                                onClose();
                                onOpenPaiementModal(eleve.id, m.cle);
                              }}
                              className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Encaisser
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

          {/* Student Payment History Receipts */}
          {studentPaiements.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Reçus et Versements Effectués ({studentPaiements.length})
              </h4>
              <div className="space-y-2">
                {studentPaiements.map((p) => {
                  const mode = getModePaiementLabel(p.modePaiement);
                  return (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-emerald-800">
                          {p.numeroRecu}
                        </span>
                        <span className="capitalize font-semibold text-slate-700">
                          Mois de {p.mois}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${mode.bg}`}>
                          {mode.label}
                        </span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-500">{formatDate(p.datePaiement)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-emerald-700 text-sm">
                          {formatMontant(p.montantPaye)}
                        </span>
                        <button
                          onClick={() => onViewRecu(p)}
                          className="px-2.5 py-1 text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer no-print flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Voir Reçu</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

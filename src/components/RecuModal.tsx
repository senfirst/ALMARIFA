import { useRef } from 'react';
import { Printer, Download, X, CheckCircle2 } from 'lucide-react';
import { Paiement, SchoolConfig } from '../types';
import { formatMontant, formatDateComplete, montantEnLettres, getModePaiementLabel } from '../utils/formatters';

interface RecuModalProps {
  paiement: Paiement | null;
  recuDetails?: {
    montantPrevu?: number;
    montantRestantApres?: number;
    telephoneParent?: string;
  };
  config: SchoolConfig;
  isOpen: boolean;
  onClose: () => void;
}

export function RecuModal({ paiement, recuDetails, config, isOpen, onClose }: RecuModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !paiement) return null;

  const modeInfo = getModePaiementLabel(paiement.modePaiement);
  const montantPrevu = recuDetails?.montantPrevu ?? paiement.montantPaye;
  const montantRestant = recuDetails?.montantRestantApres ?? 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header Bar - Hidden on print */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-base">Reçu de Paiement Scolaire</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
              title="Imprimer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              title="Télécharger en PDF via impression"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Content Area */}
        <div id="printable-receipt" ref={printRef} className="p-8 bg-white text-slate-900">
          {/* Institutional Header */}
          <div className="border-b-2 border-emerald-800 pb-5 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-serif text-2xl font-bold border-2 border-amber-400 shadow-xs">
                  ALM
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-emerald-900 font-serif leading-tight">
                    {config.nomEtablissement}
                  </h1>
                  <p className="text-xs font-semibold text-emerald-700 tracking-wider uppercase">
                    {config.sousTitre}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {config.adresse} • Tél: {config.telephone}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block bg-emerald-50 border border-emerald-300 rounded-lg px-3 py-1 text-center">
                  <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                    Année Scolaire
                  </div>
                  <div className="text-sm font-extrabold text-emerald-950">
                    {paiement.anneeScolaire}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Receipt Title & Meta */}
          <div className="flex items-center justify-between mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Numéro de Reçu Officiel
              </span>
              <span className="text-lg font-mono font-bold text-emerald-800">
                {paiement.numeroRecu}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Date du Paiement
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {formatDateComplete(paiement.datePaiement)}
              </span>
            </div>
          </div>

          {/* Student & Class Information Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Nom & Prénom de l'Élève
              </span>
              <p className="text-base font-bold text-slate-900">{paiement.eleveNom}</p>
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                <span className="bg-slate-100 px-2 py-0.5 rounded font-mono font-medium">
                  Matricule: {paiement.eleveMatricule}
                </span>
              </div>
            </div>
            <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Classe & Section
              </span>
              <p className="text-base font-bold text-emerald-800">{paiement.classeNom}</p>
              <div className="pt-1 text-xs text-slate-600">
                Mois réglé : <span className="font-semibold capitalize text-slate-800">{paiement.mois}</span>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden mb-6">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Désignation</th>
                  <th className="py-2.5 px-4 text-center">Mode</th>
                  <th className="py-2.5 px-4 text-right">Montant Encaissé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    Mensualité scolaire — Mois de <span className="capitalize font-bold">{paiement.mois}</span>
                    {paiement.observations && (
                      <span className="block text-xs text-slate-500 italic mt-0.5">
                        Note: {paiement.observations}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${modeInfo.bg}`}>
                      {modeInfo.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-base text-emerald-700">
                    {formatMontant(paiement.montantPaye)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-emerald-50/50 border-t border-slate-200 font-medium">
                <tr>
                  <td className="py-2.5 px-4 text-xs text-slate-600">Montant prévu du mois</td>
                  <td></td>
                  <td className="py-2.5 px-4 text-right font-mono text-xs text-slate-700">
                    {formatMontant(montantPrevu)}
                  </td>
                </tr>
                <tr className="border-t border-slate-200/60 font-semibold">
                  <td className="py-2.5 px-4 text-xs text-slate-700">Reste à solder pour ce mois</td>
                  <td></td>
                  <td className="py-2.5 px-4 text-right font-mono text-sm">
                    {montantRestant === 0 ? (
                      <span className="text-emerald-700 font-bold">0 FCFA (Mois entièrement soldé)</span>
                    ) : (
                      <span className="text-amber-700 font-bold">{formatMontant(montantRestant)}</span>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount in letters (standard West African legal receipt requirement) */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 mb-6 text-xs text-slate-800">
            <span className="font-bold text-amber-900 block mb-0.5">
              Somme arrêtée en toutes lettres :
            </span>
            <p className="font-serif italic text-sm font-semibold text-amber-950">
              « {montantEnLettres(paiement.montantPaye)} »
            </p>
          </div>

          {/* Signatures & Stamps */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-xs">
            <div className="text-center pb-8 border-r border-slate-100 pr-4">
              <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Le Parent / Déposant
              </span>
              <p className="text-[11px] text-slate-400 italic mt-8">
                (Signature ou émargement)
              </p>
            </div>
            <div className="text-center pb-8 pl-4">
              <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                La Caisse / Comptabilité
              </span>
              <p className="font-semibold text-emerald-900 mt-2">{paiement.adminNom}</p>
              <div className="mt-4 inline-block border border-dashed border-emerald-400 rounded-lg px-4 py-2 text-[11px] text-emerald-800 font-serif">
                Cachet & Signature ALMAARIFA
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="mt-6 pt-3 border-t border-slate-200 text-[10px] text-center text-slate-400">
            Reçu délivré à titre de justificatif de versement. Conserver pour toute réclamation auprès de l'administration.
          </div>
        </div>

        {/* Modal Bottom Actions - Hidden on print */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between no-print">
          <p className="text-xs text-slate-500">
            Paiement enregistré dans le système ALMAARIFA
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Fermer
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimer le reçu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

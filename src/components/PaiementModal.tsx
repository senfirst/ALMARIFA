import { useState, useEffect } from 'react';
import { CreditCard, X, AlertCircle, CheckCircle2, User, Calendar, DollarSign, Wallet } from 'lucide-react';
import { Eleve, Mensualite, MoisCle, ModePaiement, MOIS_SCOLAIRES, Paiement } from '../types';
import { StorageService } from '../services/storageService';
import { formatMontant } from '../utils/formatters';

interface PaiementModalProps {
  isOpen: boolean;
  onClose: () => void;
  eleves: Eleve[];
  mensualites: Mensualite[];
  initialEleveId?: string;
  initialMois?: MoisCle;
  onPaymentSuccess: (paiement: Paiement, recuData: any) => void;
}

export function PaiementModal({
  isOpen,
  onClose,
  eleves,
  mensualites,
  initialEleveId,
  initialMois,
  onPaymentSuccess,
}: PaiementModalProps) {
  const [selectedEleveId, setSelectedEleveId] = useState<string>('');
  const [selectedMois, setSelectedMois] = useState<MoisCle>('septembre');
  const [montantPaye, setMontantPaye] = useState<number | ''>('');
  const [modePaiement, setModePaiement] = useState<ModePaiement>('wave');
  const [datePaiement, setDatePaiement] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [observations, setObservations] = useState<string>('');
  const [autoriserSurplus, setAutoriserSurplus] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Pre-fill if props provided
  useEffect(() => {
    if (isOpen) {
      if (initialEleveId) {
        setSelectedEleveId(initialEleveId);
      } else if (eleves.length > 0 && !selectedEleveId) {
        setSelectedEleveId(eleves[0].id);
      }

      if (initialMois) {
        setSelectedMois(initialMois);
      }
      setError('');
    }
  }, [isOpen, initialEleveId, initialMois, eleves]);

  const selectedEleve = eleves.find((e) => e.id === selectedEleveId);

  // Find the selected mensualite
  const currentMensualite = mensualites.find(
    (m) => m.eleveId === selectedEleveId && m.mois === selectedMois
  );

  const montantPrevu = currentMensualite?.montantPrevu ?? selectedEleve?.montantMensuel ?? 20000;
  const montantDejaPaye = currentMensualite?.montantPaye ?? 0;
  const montantRestant = currentMensualite?.montantRestant ?? montantPrevu;

  // Whenever student or month changes, pre-fill amount with remaining balance if remaining > 0
  useEffect(() => {
    if (montantRestant > 0) {
      setMontantPaye(montantRestant);
    } else {
      setMontantPaye('');
    }
  }, [selectedEleveId, selectedMois, montantRestant]);

  if (!isOpen) return null;

  const handleSolderTout = () => {
    setMontantPaye(montantRestant);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedEleveId) {
      setError('Veuillez sélectionner un élève.');
      return;
    }

    const montant = Number(montantPaye);
    if (isNaN(montant) || montant <= 0) {
      setError('Veuillez saisir un montant supérieur à 0.');
      return;
    }

    if (!autoriserSurplus && montant > montantRestant) {
      setError(
        `Le montant (${formatMontant(montant)}) est supérieur au reste à payer (${formatMontant(montantRestant)}).`
      );
      return;
    }

    const result = StorageService.enregistrerPaiement({
      eleveId: selectedEleveId,
      mois: selectedMois,
      montantPaye: montant,
      modePaiement,
      datePaiement,
      observations: observations.trim() || undefined,
      autoriserSurplus,
    });

    if (result.success && result.paiement) {
      onPaymentSuccess(result.paiement, result.recuData);
      onClose();
    } else {
      setError(result.message || 'Erreur lors de l\'enregistrement.');
    }
  };

  const filteredEleves = eleves.filter((e) => {
    const full = `${e.prenom} ${e.nom} ${e.matricule} ${e.classeNom}`.toLowerCase();
    return full.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <CreditCard className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif">Enregistrer un Paiement</h2>
              <p className="text-xs text-emerald-200">
                Paiement de mensualité & délivrance de reçu officiel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              1. Sélectionner l'Élève
            </label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Rechercher par nom, matricule ou classe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
              <select
                value={selectedEleveId}
                onChange={(e) => setSelectedEleveId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                size={searchTerm ? 4 : 1}
              >
                {filteredEleves.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nom} {e.prenom} — {e.classeNom} ({e.matricule})
                  </option>
                ))}
              </select>
            </div>

            {selectedEleve && (
              <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="font-semibold text-slate-800">
                    {selectedEleve.prenom} {selectedEleve.nom}
                  </span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-600">{selectedEleve.classeNom}</span>
                </div>
                <span className="font-mono text-emerald-800 font-semibold">
                  Tarif: {formatMontant(selectedEleve.montantMensuel)}/mois
                </span>
              </div>
            )}
          </div>

          {/* Month Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              2. Mois de l'année scolaire
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {MOIS_SCOLAIRES.map((m) => {
                const isSelected = selectedMois === m.cle;
                const ms = mensualites.find(
                  (item) => item.eleveId === selectedEleveId && item.mois === m.cle
                );
                const isSold = ms?.statut === 'paye';
                const isPartiel = ms?.statut === 'partiel';

                return (
                  <button
                    key={m.cle}
                    type="button"
                    onClick={() => setSelectedMois(m.cle)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-medium transition-all cursor-pointer relative border ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs font-bold'
                        : isSold
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : isPartiel
                        ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="truncate">{m.nom}</div>
                    <div className="text-[10px] mt-0.5">
                      {isSold ? '✅ Payé' : isPartiel ? '🟠 Partiel' : '❌ Non payé'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Financial Calculation Box */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-slate-500 block text-[11px]">Montant Prévu</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {formatMontant(montantPrevu)}
                </span>
              </div>
              <div className="border-x border-emerald-200 px-2">
                <span className="text-slate-500 block text-[11px]">Déjà Versé</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {formatMontant(montantDejaPaye)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Reste à Payer</span>
                <span className="font-mono font-bold text-rose-700 text-sm">
                  {formatMontant(montantRestant)}
                </span>
              </div>
            </div>
          </div>

          {/* Amount to Pay & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Montant à encaisser (FCFA)
                </label>
                {montantRestant > 0 && (
                  <button
                    type="button"
                    onClick={handleSolderTout}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                  >
                    Solder ({formatMontant(montantRestant)})
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={montantPaye}
                  onChange={(e) => setMontantPaye(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Ex: 25000"
                  className="w-full pl-3.5 pr-14 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                  FCFA
                </span>
              </div>
              {Number(montantPaye) > 0 && (
                <div className="mt-1 text-[11px] text-slate-500 flex justify-between">
                  <span>Nouveau reste :</span>
                  <span className="font-bold font-mono text-slate-800">
                    {formatMontant(Math.max(0, montantRestant - Number(montantPaye)))}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mode de règlement
              </label>
              <select
                value={modePaiement}
                onChange={(e) => setModePaiement(e.target.value as ModePaiement)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              >
                <option value="wave">Wave (Paiement Mobile)</option>
                <option value="orange_money">Orange Money</option>
                <option value="especes">Espèces (En caisse)</option>
                <option value="virement">Virement bancaire / Chèque</option>
              </select>
            </div>
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date de versement
              </label>
              <input
                type="date"
                value={datePaiement}
                onChange={(e) => setDatePaiement(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Observations (Facultatif)
              </label>
              <input
                type="text"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Ex: Acompte, réglé par l'oncle..."
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Surplus Guard Checkbox */}
          {Number(montantPaye) > montantRestant && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoriserSurplus}
                  onChange={(e) => setAutoriserSurplus(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-amber-900 font-medium">
                  Autoriser un versement supérieur au reste dû (crédit / avance sur mois suivants)
                </span>
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider & Générer le Reçu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

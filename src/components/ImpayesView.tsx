import { useState, useMemo } from 'react';
import {
  AlertCircle,
  Search,
  Filter,
  Phone,
  MessageCircle,
  CreditCard,
  Printer,
  TrendingDown,
  Clock,
  XCircle,
} from 'lucide-react';
import { ImpayeItem, Classe, MOIS_SCOLAIRES, SchoolConfig } from '../types';
import { formatMontant } from '../utils/formatters';

interface ImpayesViewProps {
  impayes: ImpayeItem[];
  classes: Classe[];
  config: SchoolConfig;
  onOpenPaiementModal: (eleveId: string, mois: any) => void;
}

export function ImpayesView({
  impayes,
  classes,
  config,
  onOpenPaiementModal,
}: ImpayesViewProps) {
  const [search, setSearch] = useState('');
  const [filterClasse, setFilterClasse] = useState('all');
  const [filterMois, setFilterMois] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'non_paye' | 'partiel'>('all');

  // Filter logic
  const filteredImpayes = useMemo(() => {
    return impayes.filter((item) => {
      const matchSearch =
        item.eleveNom.toLowerCase().includes(search.toLowerCase()) ||
        item.eleveMatricule.toLowerCase().includes(search.toLowerCase());

      const matchClasse = filterClasse === 'all' || item.classeNom.includes(filterClasse);
      const matchMois = filterMois === 'all' || item.mois === filterMois;
      const matchType = filterType === 'all' || item.statut === filterType;

      return matchSearch && matchClasse && matchMois && matchType;
    });
  }, [impayes, search, filterClasse, filterMois, filterType]);

  // Aggregate totals
  const totalResteAPayer = filteredImpayes.reduce((acc, item) => acc + item.resteAPayer, 0);
  const totalMontantDu = filteredImpayes.reduce((acc, item) => acc + item.montantDu, 0);
  const countTotalementImpaye = filteredImpayes.filter((i) => i.statut === 'non_paye').length;
  const countPartiel = filteredImpayes.filter((i) => i.statut === 'partiel').length;

  // WhatsApp quick reminder generator
  const handleWhatsAppReminder = (item: ImpayeItem) => {
    const rawTel = item.telephoneParent.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Bonjour Chers Parents de l'élève ${item.eleveNom} (Matricule: ${item.eleveMatricule}, Classe: ${item.classeNom}). ` +
      `L'administration de ${config.nomEtablissement} vous informe que la mensualité du mois de ${item.moisNom} présente un solde restant de ${formatMontant(item.resteAPayer)}. ` +
      `Nous vous prions de bien vouloir régulariser ce montant à la caisse de l'école ou par Wave/Orange Money. Merci de votre confiance.`
    );
    window.open(`https://wa.me/${rawTel}?text=${message}`, '_blank');
  };

  const handlePrintTable = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-900 to-rose-950 text-white p-6 rounded-2xl shadow-md border border-rose-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-300 text-xs font-bold uppercase tracking-wider mb-1">
            <AlertCircle className="w-4 h-4" />
            <span>Recouvrement & Créances</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif">
            Liste des Impayés Scolaires ({filteredImpayes.length})
          </h1>
          <p className="text-xs text-rose-200 mt-1 max-w-xl">
            Élèves en retard de paiement ou ayant versé un montant partiel pour les mois échus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-3 rounded-xl border border-white/20 text-right">
            <span className="text-[10px] uppercase font-bold text-rose-200 block">
              Total Créances Filtrées
            </span>
            <span className="text-lg font-mono font-black text-amber-300">
              {formatMontant(totalResteAPayer)}
            </span>
          </div>
          <button
            onClick={handlePrintTable}
            className="p-3 bg-white/15 hover:bg-white/25 rounded-xl transition-colors cursor-pointer text-white no-print"
            title="Imprimer la liste des impayés"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row gap-3 items-center justify-between no-print">
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Rechercher par nom ou matricule..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:bg-white"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Class Filter */}
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

          {/* Month Filter */}
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

          {/* Status Filter (Totalement impayé vs Partiel) */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous ({filteredImpayes.length})
            </button>
            <button
              onClick={() => setFilterType('non_paye')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === 'non_paye'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Totalement impayé ({countTotalementImpaye})
            </button>
            <button
              onClick={() => setFilterType('partiel')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterType === 'partiel'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paiement partiel ({countPartiel})
            </button>
          </div>
        </div>
      </div>

      {/* Impayés Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredImpayes.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Félicitations ! Aucun impayé trouvé avec ces filtres.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Élève</th>
                  <th className="py-3 px-4">Matricule</th>
                  <th className="py-3 px-4">Classe</th>
                  <th className="py-3 px-4">Mois Impayé</th>
                  <th className="py-3 px-4 text-right">Montant Dû</th>
                  <th className="py-3 px-4 text-right">Déjà Versé</th>
                  <th className="py-3 px-4 text-right">Reste à Payer</th>
                  <th className="py-3 px-4">Téléphone Parent</th>
                  <th className="py-3 px-4 text-center no-print">Relance & Règlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredImpayes.map((item, idx) => {
                  const isTotalementImpaye = item.statut === 'non_paye';
                  return (
                    <tr key={`${item.eleveId}-${item.mois}-${idx}`} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.eleveNom}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-emerald-800">
                        {item.eleveMatricule}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                          {item.classeNom}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 capitalize font-semibold text-slate-800">
                        {item.moisNom}
                        <span
                          className={`block text-[10px] font-bold ${
                            isTotalementImpaye ? 'text-rose-600' : 'text-amber-600'
                          }`}
                        >
                          {isTotalementImpaye ? '❌ Non payé' : '🟠 Paiement partiel'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                        {formatMontant(item.montantDu)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-medium">
                        {formatMontant(item.montantPaye)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-700">
                        {formatMontant(item.resteAPayer)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.telephoneParent}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center no-print">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* WhatsApp Reminder Button */}
                          <button
                            onClick={() => handleWhatsAppReminder(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border border-emerald-200"
                            title="Envoyer un rappel WhatsApp pré-rempli au parent"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Rappeler</span>
                          </button>

                          {/* Quick Payment Button */}
                          <button
                            onClick={() => onOpenPaiementModal(item.eleveId, item.mois)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                            title="Encaisser ce montant maintenant"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Encaisser</span>
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

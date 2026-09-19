import { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Phone,
  FileText,
  CreditCard,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { Eleve, Classe, Mensualite, Paiement } from '../types';
import { StorageService } from '../services/storageService';
import { formatMontant, formatDate } from '../utils/formatters';

interface ElevesViewProps {
  eleves: Eleve[];
  classes: Classe[];
  mensualites: Mensualite[];
  paiements: Paiement[];
  onReload: () => void;
  onOpenPaiementModal: (eleveId: string, mois?: any) => void;
  onRequestDelete: (eleve: Eleve) => void;
  onViewStudentCard: (eleve: Eleve) => void;
}

export function ElevesView({
  eleves,
  classes,
  mensualites,
  paiements,
  onReload,
  onOpenPaiementModal,
  onRequestDelete,
  onViewStudentCard,
}: ElevesViewProps) {
  const [search, setSearch] = useState('');
  const [filterClasse, setFilterClasse] = useState('all');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEleve, setEditingEleve] = useState<Eleve | null>(null);

  // Form fields
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [matricule, setMatricule] = useState('');
  const [classeId, setClasseId] = useState('');
  const [telephoneParent, setTelephoneParent] = useState('');
  const [montantMensuel, setMontantMensuel] = useState<number>(20000);
  const [dateInscription, setDateInscription] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [fraisInscription, setFraisInscription] = useState<number>(20000);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Handle open add modal
  const handleOpenAdd = () => {
    setEditingEleve(null);
    setNom('');
    setPrenom('');
    setMatricule(`ALM-${new Date().getFullYear()}-${String(eleves.length + 1).padStart(3, '0')}`);
    const defaultCls = classes[0];
    setClasseId(defaultCls?.id || '');
    setMontantMensuel(defaultCls?.montantMensuelDefaut || 20000);
    setTelephoneParent('+221 7');
    setDateInscription(new Date().toISOString().split('T')[0]);
    setFraisInscription(15000);
    setNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (eleve: Eleve) => {
    setEditingEleve(eleve);
    setNom(eleve.nom);
    setPrenom(eleve.prenom);
    setMatricule(eleve.matricule);
    setClasseId(eleve.classeId);
    setTelephoneParent(eleve.telephoneParent);
    setMontantMensuel(eleve.montantMensuel);
    setDateInscription(eleve.dateInscription);
    setFraisInscription(eleve.fraisInscription);
    setNotes(eleve.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  // When class changes, adjust default monthly amount if adding
  const handleClasseChange = (clsId: string) => {
    setClasseId(clsId);
    const cls = classes.find((c) => c.id === clsId);
    if (cls && !editingEleve) {
      setMontantMensuel(cls.montantMensuelDefaut);
    }
  };

  // Save student
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!nom.trim() || !prenom.trim()) {
      setFormError('Le nom et le prénom sont obligatoires.');
      return;
    }
    if (!telephoneParent.trim()) {
      setFormError('Le numéro de téléphone du parent est requis.');
      return;
    }
    if (!classeId) {
      setFormError('Veuillez sélectionner une classe.');
      return;
    }

    const cls = classes.find((c) => c.id === classeId);
    const classeNom = cls ? cls.nom : 'Non assignée';

    if (editingEleve) {
      StorageService.updateEleve({
        ...editingEleve,
        nom: nom.trim().toUpperCase(),
        prenom: prenom.trim(),
        matricule: matricule.trim(),
        classeId,
        classeNom,
        telephoneParent: telephoneParent.trim(),
        montantMensuel: Number(montantMensuel),
        dateInscription,
        fraisInscription: Number(fraisInscription),
        notes: notes.trim() || undefined,
      });
    } else {
      StorageService.addEleve({
        nom: nom.trim().toUpperCase(),
        prenom: prenom.trim(),
        matricule: matricule.trim(),
        classeId,
        classeNom,
        telephoneParent: telephoneParent.trim(),
        montantMensuel: Number(montantMensuel),
        dateInscription,
        fraisInscription: Number(fraisInscription),
        statutActif: true,
        notes: notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
    onReload();
  };

  // Filter students
  const filteredEleves = eleves.filter((e) => {
    const matchesSearch =
      `${e.nom} ${e.prenom} ${e.matricule} ${e.telephoneParent}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesClasse = filterClasse === 'all' || e.classeId === filterClasse;
    return matchesSearch && matchesClasse;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Effectifs & Scolarité</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 font-serif">
            Gestion des Élèves ({eleves.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ajout, modification, consultation des fiches et suivi individuel
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Inscrire un nouvel élève</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Rechercher par nom, matricule ou téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterClasse}
            onChange={(e) => setFilterClasse(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">Toutes les classes ({eleves.length})</option>
            {classes.map((c) => {
              const count = eleves.filter((e) => e.classeId === c.id).length;
              return (
                <option key={c.id} value={c.id}>
                  {c.nom} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredEleves.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Aucun élève ne correspond aux critères de recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Matricule</th>
                  <th className="py-3 px-4">Nom & Prénom</th>
                  <th className="py-3 px-4">Classe</th>
                  <th className="py-3 px-4">Téléphone Parent</th>
                  <th className="py-3 px-4 text-right">Mensualité</th>
                  <th className="py-3 px-4">Date Inscription</th>
                  <th className="py-3 px-4 text-center">Fiche & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEleves.map((eleve) => {
                  return (
                    <tr
                      key={eleve.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onViewStudentCard(eleve)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                        {eleve.matricule}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {eleve.nom} {eleve.prenom}
                        </div>
                        {eleve.notes && (
                          <div className="text-[10px] text-slate-400 italic truncate max-w-xs">
                            {eleve.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                          {eleve.classeNom}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{eleve.telephoneParent}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatMontant(eleve.montantMensuel)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(eleve.dateInscription)}
                      </td>
                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Quick Pay */}
                          <button
                            onClick={() => onOpenPaiementModal(eleve.id)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer border border-emerald-200"
                            title="Encaisser une mensualité"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                          {/* View details */}
                          <button
                            onClick={() => onViewStudentCard(eleve)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
                            title="Voir la fiche financière"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(eleve)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border border-blue-200"
                            title="Modifier l'élève"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => onRequestDelete(eleve)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-rose-200"
                            title="Supprimer l'élève"
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

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold">
                  {editingEleve ? 'Modifier l\'élève' : 'Inscrire un nouvel élève'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nom de famille *
                  </label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Ex: BA, DIALLO, SOW..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Prénom(s) *
                  </label>
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Ex: Mamadou, Fatou..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Matricule
                  </label>
                  <input
                    type="text"
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value)}
                    className="w-full px-3 py-2 font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Classe *
                  </label>
                  <select
                    value={classeId}
                    onChange={(e) => handleClasseChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Téléphone du Parent (WhatsApp / Contact) *
                </label>
                <input
                  type="tel"
                  required
                  value={telephoneParent}
                  onChange={(e) => setTelephoneParent(e.target.value)}
                  placeholder="Ex: +221 77 123 45 67"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Montant Mensualité (FCFA) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={montantMensuel}
                    onChange={(e) => setMontantMensuel(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Frais Inscription (FCFA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={fraisInscription}
                    onChange={(e) => setFraisInscription(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Date d'inscription
                </label>
                <input
                  type="date"
                  value={dateInscription}
                  onChange={(e) => setDateInscription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Observations / Remarques
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Fratrie, régime particulier..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  {editingEleve ? 'Enregistrer les modifications' : 'Confirmer l\'inscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

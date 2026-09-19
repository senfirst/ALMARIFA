import { useState, useEffect } from 'react';
import { StorageService } from './services/storageService';
import {
  Eleve,
  Classe,
  Mensualite,
  Paiement,
  SchoolConfig,
  MoisCle,
} from './types';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { Sidebar, TabKey } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ElevesView } from './components/ElevesView';
import { MensualitesView } from './components/MensualitesView';
import { ImpayesView } from './components/ImpayesView';
import { HistoriqueView } from './components/HistoriqueView';
import { RapportsView } from './components/RapportsView';
import { PaiementModal } from './components/PaiementModal';
import { RecuModal } from './components/RecuModal';
import { StudentCardModal } from './components/StudentCardModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Core Data States
  const [config, setConfig] = useState<SchoolConfig>(StorageService.getConfig());
  const [classes, setClasses] = useState<Classe[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [mensualites, setMensualites] = useState<Mensualite[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<TabKey>('dashboard');

  // Modals
  const [isPaiementModalOpen, setIsPaiementModalOpen] = useState(false);
  const [paiementInitialEleveId, setPaiementInitialEleveId] = useState<string | undefined>();
  const [paiementInitialMois, setPaiementInitialMois] = useState<MoisCle | undefined>();

  // Receipt Modal
  const [activeRecuPaiement, setActiveRecuPaiement] = useState<Paiement | null>(null);
  const [activeRecuDetails, setActiveRecuDetails] = useState<any>(null);
  const [isRecuModalOpen, setIsRecuModalOpen] = useState(false);

  // Student Card Modal
  const [selectedStudentForCard, setSelectedStudentForCard] = useState<Eleve | null>(null);
  const [isStudentCardModalOpen, setIsStudentCardModalOpen] = useState(false);

  // Supabase / Settings Modal
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Delete Confirmation Modals
  const [eleveToDelete, setEleveToDelete] = useState<Eleve | null>(null);
  const [paiementToDelete, setPaiementToDelete] = useState<Paiement | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial load
  const reloadData = () => {
    StorageService.initializeAllData();
    setConfig(StorageService.getConfig());
    setClasses(StorageService.getClasses());
    setEleves(StorageService.getEleves());
    setMensualites(StorageService.getMensualites());
    setPaiements(StorageService.getPaiements());
  };

  useEffect(() => {
    const auth = StorageService.isAuthenticated();
    setIsAuthenticated(auth);
    reloadData();
  }, []);

  // Handlers
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    reloadData();
    showToast('Bienvenue sur le portail ALMAARIFA Thierno Djibril Ousmane Ba');
  };

  const handleLogout = () => {
    StorageService.logout();
    setIsAuthenticated(false);
  };

  const handleOpenPaiementModal = (eleveId?: string, mois?: MoisCle) => {
    setPaiementInitialEleveId(eleveId);
    setPaiementInitialMois(mois);
    setIsPaiementModalOpen(true);
  };

  const handlePaymentSuccess = (nouveauPaiement: Paiement, recuData: any) => {
    reloadData();
    setActiveRecuPaiement(nouveauPaiement);
    setActiveRecuDetails(recuData);
    setIsRecuModalOpen(true);
    showToast(`Paiement ${nouveauPaiement.numeroRecu} enregistré avec succès`);
  };

  const handleViewRecu = (paiement: Paiement) => {
    setActiveRecuPaiement(paiement);
    const ms = mensualites.find(
      (m) => m.eleveId === paiement.eleveId && m.mois === paiement.mois
    );
    setActiveRecuDetails({
      montantPrevu: ms?.montantPrevu ?? paiement.montantPaye,
      montantRestantApres: ms?.montantRestant ?? 0,
    });
    setIsRecuModalOpen(true);
  };

  const handleViewStudentCard = (eleve: Eleve) => {
    setSelectedStudentForCard(eleve);
    setIsStudentCardModalOpen(true);
  };

  const confirmDeleteEleve = () => {
    if (eleveToDelete) {
      StorageService.deleteEleve(eleveToDelete.id);
      reloadData();
      showToast(`Élève ${eleveToDelete.nom} ${eleveToDelete.prenom} supprimé`);
      setEleveToDelete(null);
    }
  };

  const confirmDeletePaiement = () => {
    if (paiementToDelete) {
      StorageService.annulerPaiement(paiementToDelete.id);
      reloadData();
      showToast(`Paiement ${paiementToDelete.numeroRecu} annulé`);
      setPaiementToDelete(null);
    }
  };

  // Impayés computation
  const impayesList = StorageService.getImpayes();
  const supaConfig = StorageService.getSupabaseConfig();

  // If not logged in, show the secure access code screen
  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-emerald-400 px-4 py-2.5 rounded-xl shadow-xl border border-emerald-500/30 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200 no-print">
          {toastMessage}
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        config={config}
        onOpenPaiementModal={() => handleOpenPaiementModal()}
        onOpenNewEleveModal={() => setCurrentTab('eleves')}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onLogout={handleLogout}
        supabaseConnected={supaConfig.isConnected}
        impayesCount={impayesList.length}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            if (tab === 'paiement') {
              handleOpenPaiementModal();
            } else if (tab === 'supabase') {
              setIsSupabaseModalOpen(true);
            } else {
              setCurrentTab(tab);
            }
          }}
          impayesCount={impayesList.length}
          totalEleves={eleves.length}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardView
              eleves={eleves}
              mensualites={mensualites}
              paiements={paiements}
              config={config}
              onOpenPaiementModal={handleOpenPaiementModal}
              onOpenNewEleveModal={() => setCurrentTab('eleves')}
              onViewRecu={handleViewRecu}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'eleves' && (
            <ElevesView
              eleves={eleves}
              classes={classes}
              mensualites={mensualites}
              paiements={paiements}
              onReload={reloadData}
              onOpenPaiementModal={(eleveId) => handleOpenPaiementModal(eleveId)}
              onRequestDelete={(e) => setEleveToDelete(e)}
              onViewStudentCard={handleViewStudentCard}
            />
          )}

          {currentTab === 'mensualites' && (
            <MensualitesView
              eleves={eleves}
              classes={classes}
              mensualites={mensualites}
              onOpenPaiementModal={handleOpenPaiementModal}
              onViewStudentCard={handleViewStudentCard}
            />
          )}

          {currentTab === 'impayes' && (
            <ImpayesView
              impayes={impayesList}
              classes={classes}
              config={config}
              onOpenPaiementModal={handleOpenPaiementModal}
            />
          )}

          {currentTab === 'historique' && (
            <HistoriqueView
              paiements={paiements}
              classes={classes}
              onViewRecu={handleViewRecu}
              onRequestDeletePaiement={(p) => setPaiementToDelete(p)}
            />
          )}

          {currentTab === 'rapports' && (
            <RapportsView
              eleves={eleves}
              classes={classes}
              mensualites={mensualites}
              paiements={paiements}
              config={config}
              onViewStudentCard={handleViewStudentCard}
            />
          )}
        </main>
      </div>

      {/* Payment Modal */}
      <PaiementModal
        isOpen={isPaiementModalOpen}
        onClose={() => setIsPaiementModalOpen(false)}
        eleves={eleves}
        mensualites={mensualites}
        initialEleveId={paiementInitialEleveId}
        initialMois={paiementInitialMois}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Official Receipt Modal */}
      <RecuModal
        isOpen={isRecuModalOpen}
        onClose={() => setIsRecuModalOpen(false)}
        paiement={activeRecuPaiement}
        recuDetails={activeRecuDetails}
        config={config}
      />

      {/* Student Folder / Financial Card Modal */}
      <StudentCardModal
        isOpen={isStudentCardModalOpen}
        onClose={() => setIsStudentCardModalOpen(false)}
        eleve={selectedStudentForCard}
        mensualites={mensualites}
        paiements={paiements}
        config={config}
        onOpenPaiementModal={handleOpenPaiementModal}
        onViewRecu={handleViewRecu}
      />

      {/* Supabase & Settings Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        config={config}
        onDataReset={reloadData}
        onConfigSaved={reloadData}
      />

      {/* Confirmation Modal for Student Deletion */}
      <ConfirmationModal
        isOpen={Boolean(eleveToDelete)}
        title="Supprimer cet élève ?"
        message={`Attention : La suppression de l'élève ${eleveToDelete?.nom} ${eleveToDelete?.prenom} (${eleveToDelete?.matricule}) supprimera également l'ensemble de ses mensualités et ses historiques de paiement. Cette action est irréversible.`}
        confirmLabel="Oui, supprimer définitivement"
        cancelLabel="Annuler"
        isDanger={true}
        onConfirm={confirmDeleteEleve}
        onCancel={() => setEleveToDelete(null)}
      />

      {/* Confirmation Modal for Payment Cancellation */}
      <ConfirmationModal
        isOpen={Boolean(paiementToDelete)}
        title="Annuler ce paiement ?"
        message={`Confirmez-vous l'annulation du paiement ${paiementToDelete?.numeroRecu} d'un montant de ${paiementToDelete?.montantPaye} FCFA ? Le solde de la mensualité sera automatiquement réajusté.`}
        confirmLabel="Oui, annuler ce reçu"
        cancelLabel="Garder"
        isDanger={true}
        onConfirm={confirmDeletePaiement}
        onCancel={() => setPaiementToDelete(null)}
      />
    </div>
  );
}

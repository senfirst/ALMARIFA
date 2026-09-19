import {
  Classe,
  Eleve,
  Mensualite,
  Paiement,
  SchoolConfig,
  SupabaseConfig,
  ImpayeItem,
  MoisCle,
  MOIS_SCOLAIRES,
  ModePaiement,
} from '../types';
import {
  INITIAL_CLASSES,
  INITIAL_ELEVES,
  INITIAL_SCHOOL_CONFIG,
  generateInitialMensualites,
} from '../data/mockData';

const KEYS = {
  CLASSES: 'almaarifa_classes_v2',
  ELEVES: 'almaarifa_eleves_v2',
  MENSUALITES: 'almaarifa_mensualites_v2',
  PAIEMENTS: 'almaarifa_paiements_v2',
  CONFIG: 'almaarifa_config_v2',
  SUPABASE: 'almaarifa_supabase_v2',
  AUTH: 'almaarifa_auth_v2',
};

// Nettoyage automatique des anciennes données de démonstration v1
try {
  localStorage.removeItem('almaarifa_eleves_v1');
  localStorage.removeItem('almaarifa_mensualites_v1');
  localStorage.removeItem('almaarifa_paiements_v1');
} catch {
  // Ignorer dans les environnements restreints
}

export class StorageService {
  // --- AUTHENTICATION ---
  static isAuthenticated(): boolean {
    try {
      const auth = localStorage.getItem(KEYS.AUTH);
      if (!auth) return false;
      const parsed = JSON.parse(auth);
      return Boolean(parsed && parsed.isLoggedIn);
    } catch {
      return false;
    }
  }

  static login(code: string): { success: boolean; message?: string } {
    const config = this.getConfig();
    // Compare trimmed code case-insensitively or exact match
    if (code.trim().toUpperCase() === config.codeAcces.trim().toUpperCase()) {
      localStorage.setItem(
        KEYS.AUTH,
        JSON.stringify({
          isLoggedIn: true,
          timestamp: Date.now(),
          adminNom: config.nomAdmin,
        })
      );
      return { success: true };
    }
    return { success: false, message: 'Code d\'accès incorrect' };
  }

  static logout(): void {
    localStorage.removeItem(KEYS.AUTH);
  }

  // --- CONFIGURATION ---
  static getConfig(): SchoolConfig {
    try {
      const raw = localStorage.getItem(KEYS.CONFIG);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(INITIAL_SCHOOL_CONFIG));
    return INITIAL_SCHOOL_CONFIG;
  }

  static saveConfig(config: SchoolConfig): void {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  }

  // --- SUPABASE CONFIG ---
  static getSupabaseConfig(): SupabaseConfig {
    try {
      const raw = localStorage.getItem(KEYS.SUPABASE);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return { url: '', anonKey: '', isConnected: false };
  }

  static saveSupabaseConfig(config: SupabaseConfig): void {
    localStorage.setItem(KEYS.SUPABASE, JSON.stringify(config));
  }

  // --- CLASSES ---
  static getClasses(): Classe[] {
    try {
      const raw = localStorage.getItem(KEYS.CLASSES);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
    return INITIAL_CLASSES;
  }

  static saveClasses(classes: Classe[]): void {
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(classes));
  }

  // --- ELEVES ---
  static getEleves(): Eleve[] {
    try {
      const raw = localStorage.getItem(KEYS.ELEVES);
      if (raw !== null) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    this.initializeAllData();
    return [];
  }

  static saveEleves(eleves: Eleve[]): void {
    localStorage.setItem(KEYS.ELEVES, JSON.stringify(eleves));
  }

  // --- MENSUALITES ---
  static getMensualites(): Mensualite[] {
    try {
      const raw = localStorage.getItem(KEYS.MENSUALITES);
      if (raw !== null) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    this.initializeAllData();
    const raw = localStorage.getItem(KEYS.MENSUALITES);
    return raw ? JSON.parse(raw) : [];
  }

  static saveMensualites(mensualites: Mensualite[]): void {
    localStorage.setItem(KEYS.MENSUALITES, JSON.stringify(mensualites));
  }

  // --- PAIEMENTS ---
  static getPaiements(): Paiement[] {
    try {
      const raw = localStorage.getItem(KEYS.PAIEMENTS);
      if (raw !== null) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    this.initializeAllData();
    const raw = localStorage.getItem(KEYS.PAIEMENTS);
    return raw ? JSON.parse(raw) : [];
  }

  static savePaiements(paiements: Paiement[]): void {
    localStorage.setItem(KEYS.PAIEMENTS, JSON.stringify(paiements));
  }

  // --- INITIALIZATION ---
  static initializeAllData(force = false): void {
    if (!force && localStorage.getItem(KEYS.ELEVES) !== null && localStorage.getItem(KEYS.MENSUALITES) !== null) {
      return;
    }

    const { mensualites, paiements } = generateInitialMensualites(INITIAL_ELEVES);
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(INITIAL_SCHOOL_CONFIG));
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
    localStorage.setItem(KEYS.ELEVES, JSON.stringify(INITIAL_ELEVES));
    localStorage.setItem(KEYS.MENSUALITES, JSON.stringify(mensualites));
    localStorage.setItem(KEYS.PAIEMENTS, JSON.stringify(paiements));
  }

  // --- RESET / PURGE ALL STUDENTS ---
  static clearAllEleves(): void {
    localStorage.setItem(KEYS.ELEVES, JSON.stringify([]));
    localStorage.setItem(KEYS.MENSUALITES, JSON.stringify([]));
    localStorage.setItem(KEYS.PAIEMENTS, JSON.stringify([]));
  }

  // --- ADD ELEVE ---
  static addEleve(eleveData: Omit<Eleve, 'id' | 'matricule'> & { matricule?: string }): Eleve {
    const eleves = this.getEleves();
    const classes = this.getClasses();
    const classe = classes.find((c) => c.id === eleveData.classeId);
    const classeNom = classe ? classe.nom : eleveData.classeNom;

    const matricule =
      eleveData.matricule?.trim() ||
      `ALM-${new Date().getFullYear()}-${String(eleves.length + 1).padStart(3, '0')}`;

    const newEleve: Eleve = {
      ...eleveData,
      id: `elv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      matricule,
      classeNom,
      statutActif: true,
    };

    const updatedEleves = [newEleve, ...eleves];
    this.saveEleves(updatedEleves);

    // Generate 10 months of tuition for this new student
    const config = this.getConfig();
    const mensualites = this.getMensualites();
    const newMensualites: Mensualite[] = MOIS_SCOLAIRES.map((m) => ({
      id: `ms-${newEleve.id}-${m.cle}`,
      eleveId: newEleve.id,
      mois: m.cle,
      anneeScolaire: config.anneeScolaire,
      montantPrevu: newEleve.montantMensuel,
      montantPaye: 0,
      montantRestant: newEleve.montantMensuel,
      statut: 'non_paye',
    }));

    this.saveMensualites([...mensualites, ...newMensualites]);
    return newEleve;
  }

  // --- UPDATE ELEVE ---
  static updateEleve(updatedEleve: Eleve): void {
    const eleves = this.getEleves();
    const index = eleves.findIndex((e) => e.id === updatedEleve.id);
    if (index === -1) return;

    const oldEleve = eleves[index];
    const classes = this.getClasses();
    const classe = classes.find((c) => c.id === updatedEleve.classeId);
    if (classe) {
      updatedEleve.classeNom = classe.nom;
    }

    eleves[index] = updatedEleve;
    this.saveEleves(eleves);

    // If tuition changed, adjust remaining for unpaid months
    if (oldEleve.montantMensuel !== updatedEleve.montantMensuel) {
      const mensualites = this.getMensualites();
      const updatedMensualites = mensualites.map((m) => {
        if (m.eleveId === updatedEleve.id && m.statut === 'non_paye') {
          return {
            ...m,
            montantPrevu: updatedEleve.montantMensuel,
            montantRestant: updatedEleve.montantMensuel,
          };
        }
        return m;
      });
      this.saveMensualites(updatedMensualites);
    }
  }

  // --- DELETE ELEVE ---
  static deleteEleve(eleveId: string): void {
    const eleves = this.getEleves().filter((e) => e.id !== eleveId);
    this.saveEleves(eleves);

    const mensualites = this.getMensualites().filter((m) => m.eleveId !== eleveId);
    this.saveMensualites(mensualites);

    const paiements = this.getPaiements().filter((p) => p.eleveId !== eleveId);
    this.savePaiements(paiements);
  }

  // --- ENREGISTRER PAIEMENT ---
  static enregistrerPaiement(params: {
    eleveId: string;
    mois: MoisCle;
    montantPaye: number;
    modePaiement: ModePaiement;
    datePaiement: string;
    observations?: string;
    adminNom?: string;
    autoriserSurplus?: boolean;
  }): { success: boolean; message?: string; paiement?: Paiement; recuData?: any } {
    const eleves = this.getEleves();
    const eleve = eleves.find((e) => e.id === params.eleveId);
    if (!eleve) {
      return { success: false, message: 'Élève introuvable.' };
    }

    const config = this.getConfig();
    const mensualites = this.getMensualites();
    const msIndex = mensualites.findIndex(
      (m) => m.eleveId === params.eleveId && m.mois === params.mois
    );

    if (msIndex === -1) {
      return { success: false, message: 'Fiche de mensualité introuvable pour ce mois.' };
    }

    const ms = mensualites[msIndex];

    if (!params.autoriserSurplus && params.montantPaye > ms.montantRestant) {
      return {
        success: false,
        message: `Le montant payé (${params.montantPaye.toLocaleString()} FCFA) dépasse le reste à payer (${ms.montantRestant.toLocaleString()} FCFA).`,
      };
    }

    if (params.montantPaye <= 0) {
      return { success: false, message: 'Le montant payé doit être supérieur à 0.' };
    }

    const nouveauMontantPaye = ms.montantPaye + params.montantPaye;
    const nouveauMontantRestant = Math.max(0, ms.montantPrevu - nouveauMontantPaye);
    const nouveauStatut =
      nouveauMontantRestant === 0
        ? 'paye'
        : nouveauMontantPaye > 0
        ? 'partiel'
        : 'non_paye';

    // Update Mensualite
    mensualites[msIndex] = {
      ...ms,
      montantPaye: nouveauMontantPaye,
      montantRestant: nouveauMontantRestant,
      statut: nouveauStatut,
      dateDernierPaiement: params.datePaiement,
    };
    this.saveMensualites(mensualites);

    // Generate Receipt Number
    const paiements = this.getPaiements();
    const year = new Date().getFullYear();
    const receiptNum = `REC-${year}-${String(paiements.length + 101).padStart(4, '0')}`;

    const nouveauPaiement: Paiement = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      numeroRecu: receiptNum,
      eleveId: eleve.id,
      eleveNom: `${eleve.prenom} ${eleve.nom}`,
      eleveMatricule: eleve.matricule,
      classeNom: eleve.classeNom,
      mois: params.mois,
      anneeScolaire: config.anneeScolaire,
      montantPaye: params.montantPaye,
      modePaiement: params.modePaiement,
      datePaiement: params.datePaiement,
      adminNom: params.adminNom || config.nomAdmin,
      observations: params.observations,
    };

    this.savePaiements([nouveauPaiement, ...paiements]);

    return {
      success: true,
      paiement: nouveauPaiement,
      recuData: {
        ...nouveauPaiement,
        montantPrevu: ms.montantPrevu,
        montantRestantApres: nouveauMontantRestant,
        telephoneParent: eleve.telephoneParent,
      },
    };
  }

  // --- ANNULER / SUPPRIMER UN PAIEMENT ---
  static annulerPaiement(paiementId: string): { success: boolean; message?: string } {
    const paiements = this.getPaiements();
    const paiement = paiements.find((p) => p.id === paiementId);
    if (!paiement) {
      return { success: false, message: 'Paiement introuvable.' };
    }

    const mensualites = this.getMensualites();
    const msIndex = mensualites.findIndex(
      (m) => m.eleveId === paiement.eleveId && m.mois === paiement.mois
    );

    if (msIndex !== -1) {
      const ms = mensualites[msIndex];
      const updatedPaye = Math.max(0, ms.montantPaye - paiement.montantPaye);
      const updatedRestant = Math.min(ms.montantPrevu, ms.montantPrevu - updatedPaye);
      const updatedStatut =
        updatedPaye === 0
          ? 'non_paye'
          : updatedRestant === 0
          ? 'paye'
          : 'partiel';

      mensualites[msIndex] = {
        ...ms,
        montantPaye: updatedPaye,
        montantRestant: updatedRestant,
        statut: updatedStatut,
      };
      this.saveMensualites(mensualites);
    }

    this.savePaiements(paiements.filter((p) => p.id !== paiementId));
    return { success: true };
  }

  // --- GET IMPAYES ---
  static getImpayes(): ImpayeItem[] {
    const eleves = this.getEleves();
    const mensualites = this.getMensualites();
    const elevesMap = new Map(eleves.map((e) => [e.id, e]));

    const impayes: ImpayeItem[] = [];

    mensualites.forEach((m) => {
      if (m.statut !== 'paye') {
        const eleve = elevesMap.get(m.eleveId);
        if (eleve && eleve.statutActif) {
          const moisObj = MOIS_SCOLAIRES.find((item) => item.cle === m.mois);
          impayes.push({
            eleveId: eleve.id,
            eleveNom: `${eleve.prenom} ${eleve.nom}`,
            eleveMatricule: eleve.matricule,
            classeNom: eleve.classeNom,
            mois: m.mois,
            moisNom: moisObj ? moisObj.nom : m.mois,
            montantDu: m.montantPrevu,
            montantPaye: m.montantPaye,
            resteAPayer: m.montantRestant,
            telephoneParent: eleve.telephoneParent,
            statut: m.statut as 'non_paye' | 'partiel',
          });
        }
      }
    });

    return impayes;
  }

  // --- BACKUP & RESTORE ---
  static exportBackupJSON(): string {
    const data = {
      config: this.getConfig(),
      classes: this.getClasses(),
      eleves: this.getEleves(),
      mensualites: this.getMensualites(),
      paiements: this.getPaiements(),
      exportedAt: new Date().toISOString(),
      system: 'ALMAARIFA THIERNO DJIBRIL OUSMANE BA',
    };
    return JSON.stringify(data, null, 2);
  }

  static importBackupJSON(jsonStr: string): { success: boolean; message?: string } {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.eleves || !Array.isArray(data.eleves)) {
        return { success: false, message: 'Format de fichier JSON invalide.' };
      }
      if (data.classes) this.saveClasses(data.classes);
      if (data.eleves) this.saveEleves(data.eleves);
      if (data.mensualites) this.saveMensualites(data.mensualites);
      if (data.paiements) this.savePaiements(data.paiements);
      if (data.config) this.saveConfig(data.config);
      return { success: true };
    } catch (e: any) {
      return { success: false, message: `Erreur d'importation: ${e.message}` };
    }
  }
}

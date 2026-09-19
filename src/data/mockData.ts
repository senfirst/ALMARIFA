import { Classe, Eleve, Mensualite, Paiement, SchoolConfig, MOIS_SCOLAIRES } from '../types';

export const INITIAL_SCHOOL_CONFIG: SchoolConfig = {
  nomEtablissement: 'ALMAARIFA',
  sousTitre: 'THIERNO DJIBRIL OUSMANE BA',
  devise: 'FCFA',
  anneeScolaire: '2025-2026',
  codeAcces: 'MAARIFA0204',
  telephone: '+221 33 824 15 20 / +221 77 654 32 10',
  email: 'contact@almaarifa-ecole.sn',
  adresse: 'Avenue Cheikh Anta Diop, Dakar - Sénégal',
  nomAdmin: 'Direction des Études & Comptabilité',
};

export const INITIAL_CLASSES: Classe[] = [
  { id: 'cls-1', nom: 'CI (Cours d\'Initiation)', niveau: 'Élémentaire', montantMensuelDefaut: 20000 },
  { id: 'cls-2', nom: 'CP (Cours Préparatoire)', niveau: 'Élémentaire', montantMensuelDefaut: 20000 },
  { id: 'cls-3', nom: 'CE1', niveau: 'Élémentaire', montantMensuelDefaut: 22000 },
  { id: 'cls-4', nom: 'CE2', niveau: 'Élémentaire', montantMensuelDefaut: 22000 },
  { id: 'cls-5', nom: 'CM1', niveau: 'Élémentaire', montantMensuelDefaut: 25000 },
  { id: 'cls-6', nom: 'CM2', niveau: 'Élémentaire', montantMensuelDefaut: 25000 },
  { id: 'cls-7', nom: '6ème', niveau: 'Moyen', montantMensuelDefaut: 30000 },
  { id: 'cls-8', nom: '5ème', niveau: 'Moyen', montantMensuelDefaut: 30000 },
  { id: 'cls-9', nom: '4ème', niveau: 'Moyen', montantMensuelDefaut: 32000 },
  { id: 'cls-10', nom: '3ème', niveau: 'Moyen', montantMensuelDefaut: 35000 },
];

// Base d'élèves vide pour permettre à l'administration de démarrer avec ses propres données réelles
export const INITIAL_ELEVES: Eleve[] = [];

// Helper to generate monthly tuition grid
export function generateInitialMensualites(eleves: Eleve[]): { mensualites: Mensualite[]; paiements: Paiement[] } {
  const mensualites: Mensualite[] = [];
  const paiements: Paiement[] = [];

  eleves.forEach((eleve) => {
    MOIS_SCOLAIRES.forEach((m) => {
      mensualites.push({
        id: `ms-${eleve.id}-${m.cle}`,
        eleveId: eleve.id,
        mois: m.cle,
        anneeScolaire: '2025-2026',
        montantPrevu: eleve.montantMensuel,
        montantPaye: 0,
        montantRestant: eleve.montantMensuel,
        statut: 'non_paye',
      });
    });
  });

  return { mensualites, paiements };
}

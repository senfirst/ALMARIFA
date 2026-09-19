export type MoisCle =
  | 'septembre'
  | 'octobre'
  | 'novembre'
  | 'decembre'
  | 'janvier'
  | 'fevrier'
  | 'mars'
  | 'avril'
  | 'mai'
  | 'juin';

export interface MoisInfo {
  cle: MoisCle;
  nom: string;
  ordre: number;
}

export const MOIS_SCOLAIRES: MoisInfo[] = [
  { cle: 'septembre', nom: 'Septembre', ordre: 1 },
  { cle: 'octobre', nom: 'Octobre', ordre: 2 },
  { cle: 'novembre', nom: 'Novembre', ordre: 3 },
  { cle: 'decembre', nom: 'Décembre', ordre: 4 },
  { cle: 'janvier', nom: 'Janvier', ordre: 5 },
  { cle: 'fevrier', nom: 'Février', ordre: 6 },
  { cle: 'mars', nom: 'Mars', ordre: 7 },
  { cle: 'avril', nom: 'Avril', ordre: 8 },
  { cle: 'mai', nom: 'Mai', ordre: 9 },
  { cle: 'juin', nom: 'Juin', ordre: 10 },
];

export type StatutPaiement = 'paye' | 'partiel' | 'non_paye';

export type ModePaiement = 'especes' | 'wave' | 'orange_money' | 'virement';

export interface Classe {
  id: string;
  nom: string;
  niveau: string; // ex: 'Maternelle', 'Élémentaire', 'Moyen', 'Secondaire'
  montantMensuelDefaut: number; // ex: 20000
}

export interface Eleve {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  classeId: string;
  classeNom: string;
  telephoneParent: string;
  montantMensuel: number;
  dateInscription: string;
  fraisInscription: number;
  statutActif: boolean;
  notes?: string;
}

export interface Mensualite {
  id: string;
  eleveId: string;
  mois: MoisCle;
  anneeScolaire: string;
  montantPrevu: number;
  montantPaye: number;
  montantRestant: number;
  statut: StatutPaiement;
  dateDernierPaiement?: string;
}

export interface Paiement {
  id: string;
  numeroRecu: string;
  eleveId: string;
  eleveNom: string;
  eleveMatricule: string;
  classeNom: string;
  mois: MoisCle;
  anneeScolaire: string;
  montantPaye: number;
  modePaiement: ModePaiement;
  datePaiement: string;
  adminNom: string;
  observations?: string;
}

export interface ImpayeItem {
  eleveId: string;
  eleveNom: string;
  eleveMatricule: string;
  classeNom: string;
  mois: MoisCle;
  moisNom: string;
  montantDu: number;
  montantPaye: number;
  resteAPayer: number;
  telephoneParent: string;
  statut: 'non_paye' | 'partiel';
}

export interface SchoolConfig {
  nomEtablissement: string;
  sousTitre: string;
  devise: string;
  anneeScolaire: string;
  codeAcces: string;
  telephone: string;
  email: string;
  adresse: string;
  nomAdmin: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

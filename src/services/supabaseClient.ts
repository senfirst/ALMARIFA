import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageService } from './storageService';

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = StorageService.getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  if (cachedClient && lastUrl === config.url && lastKey === config.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey);
    lastUrl = config.url;
    lastKey = config.anonKey;
    return cachedClient;
  } catch (error) {
    console.error('Erreur d\'initialisation Supabase:', error);
    return null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const client = createClient(url, anonKey);
    const { error } = await client.from('classes').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      // Table might not exist yet, which is normal before running SQL script
      if (error.message.includes('relation "classes" does not exist')) {
        return {
          success: true,
          message: 'Connexion réussie ! Veuillez maintenant exécuter le script SQL ci-dessous dans Supabase pour créer les tables.',
        };
      }
      return { success: false, message: `Erreur Supabase: ${error.message}` };
    }
    return { success: true, message: 'Connexion à Supabase établie avec succès et tables détectées !' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Impossible de joindre le serveur Supabase.' };
  }
}

// Full SQL Schema requested in prompt (item 9)
export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- ALMAARIFA THIERNO DJIBRIL OUSMANE BA — GESTION SCOLAIRE
-- Schéma PostgreSQL pour Supabase avec Row Level Security (RLS)
-- ==============================================================================

-- 1. Activation de l'extension pgcrypto pour les UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLE DES CLASSES
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(100) NOT NULL UNIQUE,
    niveau VARCHAR(50) NOT NULL,
    montant_mensuel_defaut NUMERIC(12, 0) NOT NULL DEFAULT 20000,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLE DES ÉLÈVES
CREATE TABLE IF NOT EXISTS public.eleves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matricule VARCHAR(50) NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    classe_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    classe_nom VARCHAR(100) NOT NULL,
    telephone_parent VARCHAR(50) NOT NULL,
    montant_mensuel NUMERIC(12, 0) NOT NULL,
    date_inscription DATE NOT NULL DEFAULT CURRENT_DATE,
    frais_inscription NUMERIC(12, 0) NOT NULL DEFAULT 0,
    statut_actif BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLE DES MENSUALITÉS SCOLAIRES (Septembre -> Juin)
CREATE TABLE IF NOT EXISTS public.mensualites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    eleve_id UUID NOT NULL REFERENCES public.eleves(id) ON DELETE CASCADE,
    mois VARCHAR(20) NOT NULL, -- 'septembre', 'octobre', ..., 'juin'
    annee_scolaire VARCHAR(20) NOT NULL DEFAULT '2025-2026',
    montant_prevu NUMERIC(12, 0) NOT NULL,
    montant_paye NUMERIC(12, 0) NOT NULL DEFAULT 0,
    montant_restant NUMERIC(12, 0) NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'non_paye', -- 'paye', 'partiel', 'non_paye'
    date_dernier_paiement DATE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_eleve_mois_annee UNIQUE (eleve_id, mois, annee_scolaire)
);

-- 5. TABLE DES PAIEMENTS
CREATE TABLE IF NOT EXISTS public.paiements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_recu VARCHAR(50) NOT NULL UNIQUE,
    eleve_id UUID NOT NULL REFERENCES public.eleves(id) ON DELETE CASCADE,
    eleve_nom VARCHAR(200) NOT NULL,
    eleve_matricule VARCHAR(50) NOT NULL,
    classe_nom VARCHAR(100) NOT NULL,
    mois VARCHAR(20) NOT NULL,
    annee_scolaire VARCHAR(20) NOT NULL DEFAULT '2025-2026',
    montant_paye NUMERIC(12, 0) NOT NULL,
    mode_paiement VARCHAR(30) NOT NULL, -- 'especes', 'wave', 'orange_money', 'virement'
    date_paiement DATE NOT NULL DEFAULT CURRENT_DATE,
    admin_nom VARCHAR(100) NOT NULL DEFAULT 'Direction ALMAARIFA',
    observations TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABLE DES UTILISATEURS / ADMINISTRATEURS
CREATE TABLE IF NOT EXISTS public.utilisateurs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    nom_complet VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'secretaire', -- 'admin', 'comptable', 'secretaire'
    code_acces_hash TEXT,
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABLE DES REÇUS OFFICIELS
CREATE TABLE IF NOT EXISTS public.recus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_recu VARCHAR(50) NOT NULL UNIQUE,
    paiement_id UUID REFERENCES public.paiements(id) ON DELETE CASCADE,
    eleve_id UUID REFERENCES public.eleves(id) ON DELETE SET NULL,
    contenu_json JSONB NOT NULL,
    genere_par VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) — PROTECTION DES DONNÉES FINANCIÈRES
-- ==============================================================================

-- Activation RLS sur toutes les tables
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eleves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensualites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paiements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recus ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité (autorise les utilisateurs authentifiés via Supabase Auth ou token de service)
CREATE POLICY "Acces complet personnel ALMAARIFA - classes" 
ON public.classes FOR ALL 
TO authenticated 
USING (true) WITH CHECK (true);

CREATE POLICY "Acces complet personnel ALMAARIFA - eleves" 
ON public.eleves FOR ALL 
TO authenticated 
USING (true) WITH CHECK (true);

CREATE POLICY "Acces complet personnel ALMAARIFA - mensualites" 
ON public.mensualites FOR ALL 
TO authenticated 
USING (true) WITH CHECK (true);

CREATE POLICY "Acces complet personnel ALMAARIFA - paiements" 
ON public.paiements FOR ALL 
TO authenticated 
USING (true) WITH CHECK (true);

CREATE POLICY "Acces complet personnel ALMAARIFA - recus" 
ON public.recus FOR ALL 
TO authenticated 
USING (true) WITH CHECK (true);

CREATE POLICY "Lecture anonyme interdite sur les finances" 
ON public.paiements FOR SELECT 
TO anon 
USING (false);

-- Index pour accélérer les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_eleves_classe ON public.eleves(classe_id);
CREATE INDEX IF NOT EXISTS idx_eleves_matricule ON public.eleves(matricule);
CREATE INDEX IF NOT EXISTS idx_mensualites_eleve ON public.mensualites(eleve_id);
CREATE INDEX IF NOT EXISTS idx_mensualites_statut ON public.mensualites(statut);
CREATE INDEX IF NOT EXISTS idx_paiements_eleve ON public.paiements(eleve_id);
CREATE INDEX IF NOT EXISTS idx_paiements_date ON public.paiements(date_paiement);
`;

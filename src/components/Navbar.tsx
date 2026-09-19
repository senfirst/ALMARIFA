import { School, LogOut, PlusCircle, CreditCard, Database, Bell } from 'lucide-react';
import { SchoolConfig } from '../types';

interface NavbarProps {
  config: SchoolConfig;
  onOpenPaiementModal: () => void;
  onOpenNewEleveModal: () => void;
  onOpenSupabaseModal: () => void;
  onLogout: () => void;
  supabaseConnected: boolean;
  impayesCount: number;
}

export function Navbar({
  config,
  onOpenPaiementModal,
  onOpenNewEleveModal,
  onOpenSupabaseModal,
  onLogout,
  supabaseConnected,
  impayesCount,
}: NavbarProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-amber-300 flex items-center justify-center font-bold text-lg border border-amber-400/40 shadow-xs shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight font-serif truncate">
                {config.nomEtablissement}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {config.anneeScolaire}
              </span>
            </div>
            <p className="text-xs text-emerald-800 font-semibold truncate uppercase tracking-wider">
              {config.sousTitre}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Payment Action */}
          <button
            onClick={onOpenPaiementModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span className="hidden md:inline">Encaisser Paiement</span>
            <span className="md:hidden">Encaisser</span>
          </button>

          {/* Quick New Student Action */}
          <button
            onClick={onOpenNewEleveModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
          >
            <PlusCircle className="w-4 h-4 text-emerald-700" />
            <span>Nouvel élève</span>
          </button>

          {/* Supabase Status / Config Button */}
          <button
            onClick={onOpenSupabaseModal}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              supabaseConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Configuration Base Supabase & Sauvegarde"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">
              {supabaseConnected ? 'Supabase Connecté' : 'Base de données'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                supabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 hover:text-rose-800 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
}

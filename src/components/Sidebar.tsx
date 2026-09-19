import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  AlertCircle,
  Receipt,
  BarChart3,
  Database,
  ChevronRight,
} from 'lucide-react';

export type TabKey =
  | 'dashboard'
  | 'eleves'
  | 'mensualites'
  | 'paiement'
  | 'impayes'
  | 'historique'
  | 'rapports'
  | 'supabase';

interface SidebarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  impayesCount: number;
  totalEleves: number;
}

export function Sidebar({ currentTab, onSelectTab, impayesCount, totalEleves }: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard' as TabKey,
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      description: 'Vue globale & statistiques',
    },
    {
      id: 'eleves' as TabKey,
      label: 'Gestion des élèves',
      icon: Users,
      badge: totalEleves > 0 ? String(totalEleves) : undefined,
      description: 'Inscriptions, classes & fiches',
    },
    {
      id: 'mensualites' as TabKey,
      label: 'Gestion des mensualités',
      icon: CalendarCheck,
      description: 'Grille Septembre — Juin',
    },
    {
      id: 'paiement' as TabKey,
      label: 'Enregistrer un paiement',
      icon: CreditCard,
      highlight: true,
      description: 'Encaisser & générer un reçu',
    },
    {
      id: 'impayes' as TabKey,
      label: 'Liste des impayés',
      icon: AlertCircle,
      badge: impayesCount > 0 ? String(impayesCount) : undefined,
      badgeColor: 'bg-rose-500 text-white',
      description: 'Relances & sommes dues',
    },
    {
      id: 'historique' as TabKey,
      label: 'Historique des paiements',
      icon: Receipt,
      description: 'Registre & réimpression reçus',
    },
    {
      id: 'rapports' as TabKey,
      label: 'Rapports & Statistiques',
      icon: BarChart3,
      description: 'Bilan financier & classements',
    },
    {
      id: 'supabase' as TabKey,
      label: 'Base Supabase & Paramètres',
      icon: Database,
      description: 'SQL, RLS & Sauvegardes',
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 select-none no-print">
      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Menu Principal
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all group cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white font-semibold shadow-xs shadow-emerald-950/40'
                  : item.highlight
                  ? 'bg-emerald-950/50 text-emerald-300 hover:bg-emerald-900/60 hover:text-white border border-emerald-800/40'
                  : 'hover:bg-slate-800/80 hover:text-white text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? 'text-white'
                      : item.highlight
                      ? 'text-emerald-400'
                      : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.badgeColor || (isActive ? 'bg-emerald-900 text-white' : 'bg-slate-800 text-slate-400')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                    isActive ? 'opacity-100' : ''
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* School Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-xs">
        <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
          ALMAARIFA
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
          Gestion des Mensualités Scolaires
        </p>
        <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
          <span>Session Sécurisée</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      </div>
    </aside>
  );
}

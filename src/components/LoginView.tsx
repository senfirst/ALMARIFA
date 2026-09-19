import { useState } from 'react';
import { KeyRound, ShieldAlert, School, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Veuillez saisir le code d\'accès');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = StorageService.login(code);
      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.message || 'Code d\'accès incorrect');
      }
      setLoading(false);
    }, 250);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 flex items-center justify-center p-4">
      {/* Decorative subtle patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-emerald-500/20 overflow-hidden">
          {/* Header Branding */}
          <div className="bg-gradient-to-b from-emerald-900 to-emerald-950 p-8 text-center text-white relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 mb-4 shadow-inner">
              <School className="w-9 h-9" />
            </div>

            <h1 className="text-2xl font-bold font-serif tracking-tight text-white">
              ALMAARIFA
            </h1>
            <p className="text-xs font-semibold tracking-wider text-amber-300 uppercase mt-1">
              THIERNO DJIBRIL OUSMANE BA
            </p>
            <p className="text-xs text-emerald-300/80 mt-2 font-light">
              Système de Gestion Scolaire & Suivi des Mensualités
            </p>
          </div>

          {/* Form Area */}
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">Connexion sécurisée</h2>
              <p className="text-xs text-slate-500 mt-1">
                Espace réservé à la direction et au secrétariat de l'établissement.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Code d'accès
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showCode ? 'text' : 'password'}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Entrez votre code d'accès"
                    autoFocus
                    className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-xl text-sm font-mono tracking-wider focus:outline-hidden focus:ring-2 transition-all ${
                      error
                        ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/40 text-rose-900'
                        : 'border-slate-200 focus:ring-emerald-600 focus:border-emerald-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="flex items-center gap-2 text-rose-600 text-xs font-semibold mt-2.5 bg-rose-50 border border-rose-200 p-2.5 rounded-lg animate-in fade-in">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold rounded-xl shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 text-sm"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-emerald-200/60 mt-6">
          © {new Date().getFullYear()} Établissement ALMAARIFA Thierno Djibril Ousmane Ba. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}

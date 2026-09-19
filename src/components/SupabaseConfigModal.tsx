import { useState } from 'react';
import {
  Database,
  X,
  Copy,
  Check,
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  ExternalLink,
  AlertCircle,
  FileCode,
  Lock,
} from 'lucide-react';
import { SupabaseConfig, SchoolConfig } from '../types';
import { StorageService } from '../services/storageService';
import { SUPABASE_SQL_SCHEMA, testSupabaseConnection } from '../services/supabaseClient';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SchoolConfig;
  onDataReset: () => void;
  onConfigSaved: () => void;
}

export function SupabaseConfigModal({
  isOpen,
  onClose,
  config,
  onDataReset,
  onConfigSaved,
}: SupabaseConfigModalProps) {
  const currentSupa = StorageService.getSupabaseConfig();

  const [url, setUrl] = useState(currentSupa.url);
  const [anonKey, setAnonKey] = useState(currentSupa.anonKey);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'connexion' | 'sql' | 'sauvegarde'>('connexion');

  // New access code change state
  const [nouveauCode, setNouveauCode] = useState('');
  const [codeSuccess, setCodeSuccess] = useState('');

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    if (!url.trim() || !anonKey.trim()) {
      setTestResult({
        success: false,
        message: 'Veuillez saisir l\'URL de votre projet Supabase et la clé publique Anon.',
      });
      setIsTesting(false);
      return;
    }

    const res = await testSupabaseConnection(url.trim(), anonKey.trim());
    setTestResult(res);
    setIsTesting(false);

    if (res.success) {
      StorageService.saveSupabaseConfig({
        url: url.trim(),
        anonKey: anonKey.trim(),
        isConnected: true,
      });
      onConfigSaved();
    }
  };

  const handleSaveOnly = () => {
    StorageService.saveSupabaseConfig({
      url: url.trim(),
      anonKey: anonKey.trim(),
      isConnected: Boolean(url && anonKey),
    });
    onConfigSaved();
    onClose();
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2500);
  };

  const handleExportJSON = () => {
    const jsonStr = StorageService.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `sauvegarde-almaarifa-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = StorageService.importBackupJSON(content);
      if (res.success) {
        setImportStatus('✅ Données restaurées avec succès !');
        onDataReset();
      } else {
        setImportStatus(`❌ ${res.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleClearStudents = () => {
    if (
      window.confirm(
        'Voulez-vous supprimer tous les élèves et réinitialiser les registres ?'
      )
    ) {
      StorageService.clearAllEleves();
      onDataReset();
      onClose();
    }
  };

  const handleChangeCodeAcces = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauCode.trim()) return;
    StorageService.saveConfig({
      ...config,
      codeAcces: nouveauCode.trim(),
    });
    setCodeSuccess('Code d\'accès modifié avec succès !');
    setNouveauCode('');
    setTimeout(() => setCodeSuccess(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold">Base de Données Supabase & Paramètres</h2>
              <p className="text-xs text-slate-400">
                Connexion Cloud, Schéma SQL avec RLS et Sauvegardes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('connexion')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'connexion'
                ? 'border-emerald-700 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>1. Connexion Supabase</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-emerald-700 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>2. Script SQL & RLS</span>
          </button>
          <button
            onClick={() => setActiveTab('sauvegarde')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sauvegarde'
                ? 'border-emerald-700 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>3. Sauvegardes & Code d'accès</span>
          </button>
        </div>

        {/* Tab 1: Connexion Supabase */}
        {activeTab === 'connexion' && (
          <div className="p-6 space-y-5 text-xs">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-slate-800 leading-relaxed">
              <h3 className="font-bold text-emerald-950 text-sm mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Intégration Cloud Supabase (Optionnelle ou Production)
              </h3>
              <p className="text-slate-600">
                L'application fonctionne actuellement avec <strong>persistance locale sécurisée</strong> dans le navigateur.
                Pour synchroniser avec votre base de données Supabase, saisissez vos identifiants ci-dessous.
                N'utilisez <strong>JAMAIS</strong> la clé <code>service_role</code> secrète dans le frontend ; utilisez uniquement la clé publique <code>anon key</code>.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Supabase Anon Key (Clé publique uniquement)
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {testResult.success ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold cursor-pointer transition-colors disabled:opacity-50"
              >
                {isTesting ? 'Test en cours...' : 'Tester la connexion'}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveOnly}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Enregistrer les paramètres
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Script SQL & RLS */}
        {activeTab === 'sql' && (
          <div className="p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Schéma SQL Officiel avec Tables & Row Level Security (RLS)
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Copiez et collez ce script dans l'éditeur SQL de votre console Supabase.
                </p>
              </div>

              <button
                onClick={handleCopySQL}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold transition-colors cursor-pointer"
              >
                {copiedSQL ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSQL ? 'Copié !' : 'Copier tout le SQL'}</span>
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-200">
              <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-[360px] leading-relaxed select-all">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Sauvegardes & Paramètres */}
        {activeTab === 'sauvegarde' && (
          <div className="p-6 space-y-6 text-xs">
            {/* Change Access Code */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-700" />
                Modifier le Code d'Accès de l'Établissement
              </h4>
              <p className="text-slate-500 text-[11px] mb-3">
                Code actuel masqué par sécurité. Code par défaut : <code>MAARIFA0204</code>
              </p>

              <form onSubmit={handleChangeCodeAcces} className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  placeholder="Nouveau code d'accès"
                  value={nouveauCode}
                  onChange={(e) => setNouveauCode(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl cursor-pointer"
                >
                  Mettre à jour
                </button>
              </form>
              {codeSuccess && (
                <div className="mt-2 text-emerald-700 font-bold">{codeSuccess}</div>
              )}
            </div>

            {/* Backup Export / Import */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">
                Sauvegarde & Restauration des Données Scolaires
              </h4>
              <p className="text-slate-500 text-[11px]">
                Exportez tous les élèves, classes, mensualités et reçus en format JSON sécurisé.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Exporter la sauvegarde (JSON)</span>
                </button>

                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-semibold cursor-pointer">
                  <Upload className="w-4 h-4 text-emerald-700" />
                  <span>Importer un fichier JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>
              </div>

              {importStatus && (
                <div className="text-xs font-semibold mt-2">{importStatus}</div>
              )}
            </div>

            {/* Purge students */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleClearStudents}
                className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-800 font-bold transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Vider la base et supprimer tous les élèves enregistrés</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

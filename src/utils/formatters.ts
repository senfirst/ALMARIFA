// Formatting utilities for ALMAARIFA school management

export function formatMontant(montant: number | undefined | null): string {
  if (montant === undefined || montant === null || isNaN(montant)) {
    return '0 FCFA';
  }
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(montant) + ' FCFA';
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateComplete(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// Convert amount to words in French (standard for West African receipts)
export function montantEnLettres(montant: number): string {
  if (montant === 0) return 'Zéro Franc CFA';
  if (isNaN(montant)) return '';

  const unites = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const dizainesParticulieres = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
  const dizaines = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

  function convertirCentaines(n: number): string {
    let res = '';
    const c = Math.floor(n / 100);
    const r = n % 100;

    if (c > 0) {
      if (c === 1) res += 'cent ';
      else res += unites[c] + ' cents ';
    }

    if (r > 0) {
      if (r < 10) {
        res += unites[r];
      } else if (r <= 16) {
        res += dizainesParticulieres[r - 10];
      } else if (r < 20) {
        res += 'dix-' + unites[r - 10];
      } else if (r < 70) {
        const d = Math.floor(r / 10);
        const u = r % 10;
        if (u === 0) res += dizaines[d];
        else if (u === 1 && d !== 8) res += dizaines[d] + ' et un';
        else res += dizaines[d] + '-' + unites[u];
      } else if (r < 80) {
        const u = r % 10;
        if (u === 1) res += 'soixante et onze';
        else if (u <= 6) res += 'soixante-' + dizainesParticulieres[u];
        else res += 'soixante-dix-' + unites[u];
      } else if (r < 90) {
        const u = r % 10;
        if (u === 0) res += 'quatre-vingts';
        else res += 'quatre-vingt-' + unites[u];
      } else {
        const u = r % 10;
        if (u <= 6) res += 'quatre-vingt-' + dizainesParticulieres[u];
        else res += 'quatre-vingt-dix-' + unites[u];
      }
    }

    return res.trim();
  }

  let reste = Math.floor(montant);
  const millions = Math.floor(reste / 1000000);
  reste %= 1000000;
  const milliers = Math.floor(reste / 1000);
  reste %= 1000;

  const parties: string[] = [];

  if (millions > 0) {
    if (millions === 1) parties.push('un million');
    else parties.push(convertirCentaines(millions) + ' millions');
  }

  if (milliers > 0) {
    if (milliers === 1) parties.push('mille');
    else parties.push(convertirCentaines(milliers) + ' mille');
  }

  if (reste > 0) {
    parties.push(convertirCentaines(reste));
  }

  const texte = parties.join(' ').trim();
  const texteCapitalise = texte.charAt(0).toUpperCase() + texte.slice(1);
  return `${texteCapitalise} Francs CFA`;
}

export function getModePaiementLabel(mode: string): { label: string; bg: string; text: string } {
  switch (mode) {
    case 'wave':
      return { label: 'Wave', bg: 'bg-sky-100 text-sky-800 border-sky-200', text: 'text-sky-600' };
    case 'orange_money':
      return { label: 'Orange Money', bg: 'bg-orange-100 text-orange-800 border-orange-200', text: 'text-orange-600' };
    case 'virement':
      return { label: 'Virement bancaire', bg: 'bg-purple-100 text-purple-800 border-purple-200', text: 'text-purple-600' };
    case 'especes':
    default:
      return { label: 'Espèces', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: 'text-emerald-600' };
  }
}

/**
 * Utilitaires de dates et devises pour l'Atelier de Robes de Mariée
 */

// Formate YYYY-MM-DD en JJ/MM/AAAA (ex. 15/10/2026)
export function formatDateDMY(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// Convertit une date YYYY-MM-DD en timestamp à minuit pour comparaisons pures
export function parseDateToMidnight(dateStr: string): number {
  if (!dateStr) return 0;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0).getTime();
}

/**
 * Vérifie si deux plages de dates se chevauchent.
 * La plage 1 chevauche la plage 2 si (start1 <= end2 && end1 >= start2)
 */
export function doDatesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = parseDateToMidnight(start1);
  const e1 = parseDateToMidnight(end1);
  const s2 = parseDateToMidnight(start2);
  const e2 = parseDateToMidnight(end2);

  if (!s1 || !e1 || !s2 || !e2) return false;
  return s1 <= e2 && e1 >= s2;
}

// Formate en Dinar Algérien (DA / DZD)
export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} DA`;
}

// Calcule la différence en jours
export function getDaysDifference(date1: string, date2: string): number {
  const d1 = parseDateToMidnight(date1);
  const d2 = parseDateToMidnight(date2);
  const diffTime = d2 - d1;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Noms des mois en français
export const FRENCH_MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

export const FRENCH_DAYS_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

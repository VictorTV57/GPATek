// GPATek — module → display text (badge label, tone, tooltip), in the current language.
(() => {
  'use strict';
  const UI = (globalThis.GpaTekUI ||= {});
  const G = globalThis.GpaTek;
  const I18n = globalThis.GpaTekI18n;
  const { t } = I18n;

  const isPending = (m) => !m.isOfficial && !m.acquired;

  // Module or skill title: the API only has `titleFr` (French) and `title` (English), so every language
  // other than French gets the English one.
  UI.titleOf = (x) => (I18n.lang === 'fr' ? x.title || x.titleEn : x.titleEn || x.title);

  UI.toneFor = function toneFor(m) {
    if (isPending(m)) return 'tone-pending';
    if (m.points >= 4) return 'tone-max';
    if (m.points >= 3) return 'tone-good';
    if (m.points >= 2) return 'tone-mid';
    if (m.points >= 1) return 'tone-low';
    return 'tone-fail';
  };

  UI.badgeText = function badgeText(m, mode) {
    if (isPending(m)) return t('inProgress', { xp: Math.floor(m.averageScore) });
    const prefix = m.isOfficial ? '' : '≈ ';
    if (mode === 'linear' && !m.isOfficial) return `${prefix}${I18n.points(m.points)} / 4`;
    return `${prefix}${m.letter} · ${I18n.points(m.points)}`;
  };

  // Next step of a module ("↑ B −37 XP"), or null when there is none (official grade, A, linear mode).
  UI.nextBadgeText = function nextBadgeText(m) {
    if (!m.next) return null;
    return t(m.next.credits ? 'nextBadgeCredits' : 'nextBadge', { letter: m.next.letter, xp: m.next.missingXp });
  };

  // "B at a 300 XP average: 37 XP to go, ≈ 148 XP over 4 skills", or why there is no step to reach.
  UI.nextDetail = function nextDetail(m) {
    if (!m.next) return !m.isOfficial && !m.hasActivities ? t('noActivities') : null;
    const { letter, targetXp, missingXp, totalXp, skills } = m.next;
    return t(m.next.credits ? 'nextCredits' : 'nextLetter', { letter, target: targetXp, xp: missingXp, total: totalXp, count: skills });
  };

  UI.tooltipFor = function tooltipFor(m) {
    const lines = [
      `GPATek — ${t(m.isOfficial ? 'officialGrade' : 'unofficialEstimate')}`,
      t('averageXp', { avg: Math.floor(m.averageScore), max: G.XP_MAX }),
      t('pointsTimesCredits', { points: I18n.points(m.points), count: m.credits }),
      UI.nextDetail(m),
      '',
      ...m.outcomes.map((o) => `${o.isMaxLevel ? 'MAX' : 'LV' + o.level} · ${o.score} XP — ${UI.titleOf(o)}`),
    ];
    return lines.filter((line) => line !== null).join('\n');
  };
})();

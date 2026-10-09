// GPATek — module → display text (badge label, tone, tooltip), in the current language.
(() => {
  'use strict';
  const UI = (globalThis.GpaTekUI ||= {});
  const G = globalThis.GpaTek;
  const I18n = globalThis.GpaTekI18n;
  const { t } = I18n;

  const isPending = (m) => !m.isOfficial && !m.acquired;

  // Module or skill title in the current language (the API gives `title` in English, `titleFr` in French).
  UI.titleOf = (x) => (I18n.lang === 'en' ? x.titleEn || x.title : x.title || x.titleEn);

  UI.toneFor = function toneFor(m) {
    if (isPending(m)) return 'tone-pending';
    if (m.points >= 4) return 'tone-max';
    if (m.points >= 3) return 'tone-good';
    if (m.points >= 2) return 'tone-mid';
    if (m.points >= 1) return 'tone-low';
    return 'tone-fail';
  };

  UI.badgeText = function badgeText(m, mode) {
    if (isPending(m)) return t('inProgress', { xp: Math.round(m.averageScore) });
    const prefix = m.isOfficial ? '' : '≈ ';
    if (mode === 'linear' && !m.isOfficial) return `${prefix}${I18n.points(m.points)} / 4`;
    return `${prefix}${m.letter} · ${I18n.points(m.points)}`;
  };

  UI.tooltipFor = function tooltipFor(m) {
    const lines = [
      `GPATek — ${t(m.isOfficial ? 'officialGrade' : 'unofficialEstimate')}`,
      t('averageXp', { avg: Math.round(m.averageScore), max: G.XP_MAX }),
      t('pointsTimesCredits', { points: I18n.points(m.points), credits: m.credits }),
      '',
      ...m.outcomes.map((o) => `${o.isMaxLevel ? 'MAX' : 'LV' + o.level} · ${o.score} XP — ${UI.titleOf(o)}`),
    ];
    if (isPending(m)) lines.splice(3, 0, t('creditsThreshold', { xp: G.XP_FOR_CREDITS }));
    return lines.join('\n');
  };
})();

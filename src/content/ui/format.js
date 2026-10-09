// GPATek — module → display text (badge label, tone, tooltip).
(() => {
  'use strict';
  const UI = (globalThis.GpaTekUI ||= {});
  const G = globalThis.GpaTek;

  const isPending = (m) => !m.isOfficial && !m.acquired;

  UI.toneFor = function toneFor(m) {
    if (isPending(m)) return 'tone-pending';
    if (m.points >= 4) return 'tone-max';
    if (m.points >= 3) return 'tone-good';
    if (m.points >= 2) return 'tone-mid';
    if (m.points >= 1) return 'tone-low';
    return 'tone-fail';
  };

  UI.badgeText = function badgeText(m, mode) {
    if (isPending(m)) return `En cours · ${Math.round(m.averageScore)} XP`;
    const prefix = m.isOfficial ? '' : '≈ ';
    if (mode === 'linear' && !m.isOfficial) return `${prefix}${G.formatPoints(m.points)} / 4`;
    return `${prefix}${m.letter} · ${G.formatPoints(m.points)}`;
  };

  UI.tooltipFor = function tooltipFor(m) {
    const lines = [
      `GPATek — ${m.isOfficial ? 'note officielle' : 'estimation non officielle'}`,
      `Moyenne XP : ${Math.round(m.averageScore)} / ${G.XP_MAX}`,
      `Points : ${G.formatPoints(m.points)} × ${m.credits} crédit${m.credits > 1 ? 's' : ''}`,
      '',
      ...m.outcomes.map((o) => `${o.isMaxLevel ? 'MAX' : 'LV' + o.level} · ${o.score} XP — ${o.title}`),
    ];
    if (isPending(m)) lines.splice(3, 0, `Crédits obtenus à partir de ${G.XP_FOR_CREDITS} XP de moyenne`);
    return lines.join('\n');
  };
})();

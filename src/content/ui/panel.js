// GPATek — side panel with the per-module breakdown.
(() => {
  'use strict';
  const UI = (globalThis.GpaTekUI ||= {});
  const G = globalThis.GpaTek;
  const I18n = globalThis.GpaTekI18n;
  const { t } = I18n;
  const { el } = UI;

  let host = null;

  function moduleRow(m, mode) {
    const pct = Math.min(100, (m.averageScore / G.XP_MAX) * 100);
    const sub = t('rowSub', { avg: Math.round(m.averageScore), max: G.XP_MAX, validated: m.validatedCount, total: m.totalCount });
    return el('div', { class: 'row' }, [
      el('div', { class: 'row-top' }, [
        el('div', { class: 'row-title', text: UI.titleOf(m) }),
        el('span', { class: 'row-meta', text: `${m.credits} CR` }),
        el('span', { class: `badge ${UI.toneFor(m)}`, text: UI.badgeText(m, mode), title: UI.tooltipFor(m) }),
      ]),
      el('div', { class: 'bar' }, [el('i', { style: `width:${pct}%` })]),
      el('div', { class: 'row-sub', text: m.isOfficial ? `${sub} · ${t('officialGrade')}` : sub }),
    ]);
  }

  function fact(value, label) {
    return el('div', { class: 'fact' }, [el('b', { text: value }), el('span', { text: label })]);
  }

  function build(r, onClose) {
    const pct = r.estimatedGpa != null ? Math.max(0, Math.min(100, (r.estimatedGpa / 4) * 100)) : 0;
    const modeLabel = t(r.settings.mode === 'linear' ? 'modeLinear' : 'modeLetters');
    const rows = [...r.modules]
      .sort((a, b) => b.averageScore - a.averageScore)
      .map((m) => moduleRow(m, r.settings.mode));

    const panel = el('aside', { class: 'panel', role: 'dialog', 'aria-label': t('panelLabel'), lang: I18n.lang }, [
      el('div', { class: 'panel-head' }, [
        el('div', { class: 'tile', text: 'GPA' }),
        el('div', {}, [
          el('h2', { text: t('estimatedGpa') }),
          el('div', { class: 'muted', text: t('semesterMode', { semester: r.semester ?? '—', mode: modeLabel }) }),
        ]),
        el('button', { class: 'close', text: t('close'), onclick: onClose }),
      ]),
      el('div', { class: 'big' }, [I18n.points(r.estimatedGpa), el('small', { text: ' / 4' })]),
      el('div', { class: 'bar' }, [el('i', { style: `width:${pct}%` })]),
      el('div', { class: 'facts' }, [
        fact(I18n.points(r.officialGpa), t('officialCredits', { credits: r.baseCredits })),
        fact(`+${r.countedCredits}`, t('estimatedCredits')),
        fact(I18n.points(r.pessimisticGpa), t('ifItEnds')),
      ]),
      el('div', {
        class: 'muted',
        text: t(r.settings.countInProgress ? 'noteCountInProgress' : 'noteDefault', { xp: G.XP_FOR_CREDITS }),
      }),
      el('hr', { class: 'sep' }),
      ...rows,
      el('div', { class: 'note', text: t('disclaimer') }),
    ]);

    const overlay = el('div', { class: 'overlay', onclick: (e) => { if (e.target === overlay) onClose(); } }, [panel]);
    return overlay;
  }

  UI.panel = {
    // (Re)draws the panel for `result`; onClose is called by the close button / backdrop.
    show(result, onClose) {
      this.hide();
      if (!result) return;
      const shadow = UI.shadowHost('div', UI.ATTR.panel);
      shadow.root.append(build(result, onClose));
      document.documentElement.append(shadow.host);
      host = shadow.host;
    },
    hide() {
      if (host) host.remove();
      host = null;
    },
  };
})();

// GPATek — side panel with the per-module breakdown.
(() => {
  'use strict';
  const UI = (globalThis.GpaTekUI ||= {});
  const G = globalThis.GpaTek;
  const { el } = UI;

  let host = null;

  function moduleRow(m, mode) {
    const pct = Math.min(100, (m.averageScore / G.XP_MAX) * 100);
    return el('div', { class: 'row' }, [
      el('div', { class: 'row-top' }, [
        el('div', { class: 'row-title', text: m.title }),
        el('span', { class: 'row-meta', text: `${m.credits} CR` }),
        el('span', { class: `badge ${UI.toneFor(m)}`, text: UI.badgeText(m, mode), title: UI.tooltipFor(m) }),
      ]),
      el('div', { class: 'bar' }, [el('i', { style: `width:${pct}%` })]),
      el('div', {
        class: 'row-sub',
        text: `${Math.round(m.averageScore)} / ${G.XP_MAX} XP moyen · ${m.validatedCount}/${m.totalCount} compétences validées${m.isOfficial ? ' · note officielle' : ''}`,
      }),
    ]);
  }

  function fact(value, label) {
    return el('div', { class: 'fact' }, [el('b', { text: value }), el('span', { text: label })]);
  }

  function build(r, onClose) {
    const pct = r.estimatedGpa != null ? Math.max(0, Math.min(100, (r.estimatedGpa / 4) * 100)) : 0;
    const modeLabel = r.settings.mode === 'linear' ? 'Linéaire' : 'Lettres';
    const rows = [...r.modules]
      .sort((a, b) => b.averageScore - a.averageScore)
      .map((m) => moduleRow(m, r.settings.mode));

    const panel = el('aside', { class: 'panel', role: 'dialog', 'aria-label': 'Détail du GPA estimé' }, [
      el('div', { class: 'panel-head' }, [
        el('div', { class: 'tile', text: 'GPA' }),
        el('div', {}, [el('h2', { text: 'GPA estimé' }), el('div', { class: 'muted', text: `Semestre ${r.semester ?? '—'} · mode ${modeLabel}` })]),
        el('button', { class: 'close', text: 'Fermer', onclick: onClose }),
      ]),
      el('div', { class: 'big' }, [G.formatPoints(r.estimatedGpa), el('small', { text: ' / 4' })]),
      el('div', { class: 'bar' }, [el('i', { style: `width:${pct}%` })]),
      el('div', { class: 'facts' }, [
        fact(G.formatPoints(r.officialGpa), `Officiel · ${r.baseCredits} cr`),
        fact(`+${r.countedCredits}`, 'Crédits estimés'),
        fact(G.formatPoints(r.pessimisticGpa), 'Si tout finit ainsi'),
      ]),
      el('div', {
        class: 'muted',
        text: r.settings.countInProgress
          ? 'Les UE sous 100 XP de moyenne comptent comme un échec (0 point).'
          : `Seules les UE déjà à ${G.XP_FOR_CREDITS} XP de moyenne ou plus s'ajoutent au GPA officiel. « Si tout finit ainsi » compte les autres comme un échec.`,
      }),
      el('hr', { class: 'sep' }),
      ...rows,
      el('div', { class: 'note', text: 'Estimation non officielle · non affilié à Epitech' }),
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

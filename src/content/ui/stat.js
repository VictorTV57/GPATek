// GPATek — "GPA estimé" column next to the official GPA in the "Ma scolarité" header.
(() => {
  'use strict';
  const UI = (globalThis.GpaTekUI ||= {});
  const G = globalThis.GpaTek;

  UI.renderStat = function renderStat(result, profile, onOpen) {
    if (!profile || profile.gpa == null) return;
    if (document.querySelector(`[${UI.ATTR.stat}]`)) return;

    // Find the official GPA value: a leaf whose text is the GPA, inside a block mentioning "GPA".
    const gpaText = UI.norm(String(profile.gpa));
    const value = UI.leavesWithText(UI.mainScope(),
      (t, n) => t === gpaText && /gpa/i.test(n.parentElement ? n.parentElement.textContent : ''))[0];
    if (!value) return;

    const column = value.parentElement;
    const { host, root } = UI.shadowHost('div', UI.ATTR.stat);
    host.className = column.className;
    root.append(UI.el('div', { class: 'stat', title: 'GPATek — cliquer pour le détail', onclick: onOpen }, [
      UI.el('div', { class: 'stat-label' }, [UI.el('i', { class: 'dot' }), 'GPA estimé']),
      UI.el('div', { class: 'stat-value' }, [G.formatPoints(result.estimatedGpa), UI.el('small', { text: '/4' })]),
    ]));
    column.after(host);
  };
})();

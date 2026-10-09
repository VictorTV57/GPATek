// GPATek — "GPA estimé" column next to the official GPA in the "Ma scolarité" header.
(() => {
  'use strict';
  const UI = (globalThis.GpaTekUI ||= {});
  const I18n = globalThis.GpaTekI18n;
  const { t } = I18n;

  UI.renderStat = function renderStat(result, profile, onOpen) {
    if (!profile || profile.gpa == null) return;
    if (document.querySelector(`[${UI.ATTR.stat}]`)) return;

    // Find the official GPA value: a leaf whose text is the GPA ("3,25" in French, "3.25" in English),
    // inside a block mentioning "GPA".
    const gpaText = UI.norm(String(profile.gpa));
    const gpaTexts = new Set([gpaText, gpaText.replace('.', ','), gpaText.replace(',', '.')]);
    const value = UI.leavesWithText(UI.mainScope(),
      (text, n) => gpaTexts.has(text) && /gpa/i.test(n.parentElement ? n.parentElement.textContent : ''))[0];
    if (!value) return;

    const column = value.parentElement;
    const { host, root } = UI.shadowHost('div', UI.ATTR.stat);
    host.className = column.className;
    root.append(UI.el('div', { class: 'stat', title: t('statTitle'), onclick: onOpen }, [
      UI.el('div', { class: 'stat-label' }, [UI.el('i', { class: 'dot' }), t('estimatedGpa')]),
      UI.el('div', { class: 'stat-value' }, [I18n.points(result.estimatedGpa), UI.el('small', { text: '/4' })]),
    ]));
    column.after(host);
  };
})();

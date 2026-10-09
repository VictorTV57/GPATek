// GPATek — CSS shared by every shadow root injected in the page.
(() => {
  'use strict';
  const UI = (globalThis.GpaTekUI ||= {});

  UI.CSS = `
    :host { all: initial; }
    * { box-sizing: border-box; }
    .mono { font-family: "Space Mono", "JetBrains Mono", ui-monospace, monospace; }

    /* ---------- badge ---------- */
    .badge { display: inline-flex; align-items: center; gap: 6px; height: 100%; padding: 3px 10px;
      font: 10px/1.6 "Space Mono", ui-monospace, monospace; letter-spacing: .8px; text-transform: uppercase;
      border: 1px solid var(--c-border); background: var(--c-bg); color: var(--c-fg); white-space: nowrap; cursor: help; }
    .tone-max   { --c-fg: #d98cf2; --c-border: rgba(192, 66, 232, .6); --c-bg: rgba(192, 66, 232, .14); }
    .tone-good  { --c-fg: #6fd69a; --c-border: rgba(116, 214, 156, .6); --c-bg: rgba(0, 196, 117, .14); }
    .tone-mid   { --c-fg: #a9bcff; --c-border: rgba(143, 168, 255, .6); --c-bg: rgba(143, 168, 255, .12); }
    .tone-low   { --c-fg: #c9c9c9; --c-border: rgba(186, 190, 195, .6); --c-bg: rgba(134, 142, 150, .14); }
    .tone-fail  { --c-fg: #f58b8b; --c-border: rgba(240, 90, 90, .6); --c-bg: rgba(240, 90, 90, .12); }
    .tone-pending { --c-fg: #9a9a9a; --c-border: rgba(130, 130, 130, .5); --c-bg: transparent; border-style: dashed; }

    /* ---------- header stat ---------- */
    .stat { display: flex; flex-direction: column; gap: 4px; cursor: pointer; position: relative; }
    .stat-label { display: flex; align-items: center; gap: 6px; font: 10px/1.4 "Space Mono", monospace;
      letter-spacing: .8px; text-transform: uppercase; color: #828282; }
    .dot { width: 6px; height: 6px; background: #00c475; display: inline-block; }
    .stat-value { font: 28px/1.15 Anton, "Bebas Neue", Impact, sans-serif; color: #6fd69a; }
    .stat-value small { font: 12px "Space Mono", monospace; color: #828282; margin-left: 4px; }
    .stat:hover .stat-value { text-decoration: underline dotted #00c475; text-underline-offset: 4px; }

    /* ---------- detail panel ---------- */
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 2147483646; display: flex; justify-content: flex-end; }
    .panel { width: min(560px, 100vw); height: 100%; overflow-y: auto; background: #232323; border-left: 1px solid #4a4a4a;
      color: #e6e6e6; font: 14px/1.5 "IBM Plex Sans", system-ui, sans-serif; padding: 24px; }
    .panel-head { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
    .tile { width: 40px; height: 40px; background: #00c475; display: grid; place-items: center; color: #181818;
      font: 700 13px "Space Mono", monospace; }
    .panel h2 { margin: 0; font: 600 16px "IBM Plex Sans", sans-serif; }
    .close { margin-left: auto; background: none; border: 1px solid #4a4a4a; color: #c9c9c9; padding: 4px 10px; cursor: pointer;
      font: 10px "Space Mono", monospace; text-transform: uppercase; letter-spacing: .8px; }
    .close:hover { border-color: #828282; }
    .big { font: 44px/1.1 Anton, Impact, sans-serif; color: #6fd69a; margin: 16px 0 4px; }
    .big small { font: 14px "Space Mono", monospace; color: #828282; }
    .bar { height: 3px; background: #3a3a3a; margin: 8px 0 16px; }
    .bar > i { display: block; height: 100%; background: #00c475; }
    .facts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #3a3a3a; border: 1px solid #3a3a3a; margin-bottom: 20px; }
    .fact { background: #232323; padding: 10px 12px; }
    .fact b { display: block; font: 18px Anton, Impact, sans-serif; color: #e6e6e6; font-weight: 400; }
    .fact span { font: 10px "Space Mono", monospace; color: #828282; text-transform: uppercase; letter-spacing: .8px; }
    .sep { border: 0; border-top: 1px dashed #4a4a4a; margin: 16px 0; }
    .row { padding: 10px 0; border-bottom: 1px solid #333; }
    .row-top { display: flex; align-items: baseline; gap: 10px; }
    .row-title { flex: 1; min-width: 0; color: #e6e6e6; }
    .row-meta { font: 11px "Space Mono", monospace; color: #9a9a9a; white-space: nowrap; }
    .row .bar { margin: 6px 0 0; }
    .row-sub { font: 11px "Space Mono", monospace; color: #828282; margin-top: 4px; }
    .note { font: 11px "Space Mono", monospace; color: #828282; text-transform: uppercase; letter-spacing: .8px; margin-top: 20px; }
    .muted { color: #9a9a9a; font-size: 13px; }
  `;
})();

// GPATek — pure calculation, no DOM, no network. Shared by the content scripts, the popup and the tests.
(function (root) {
  'use strict';

  const DEFAULT_SETTINGS = Object.freeze({
    mode: 'letters',          // 'letters' (default) | 'linear'
    countInProgress: false,   // count enrolled modules still under 100 XP as a fail (0)
    language: 'auto',         // 'auto' (follow my.epitech.eu) | 'fr' | 'en'
  });

  const XP_FOR_CREDITS = 100; // referent: 100 XP average gives the unit's credits
  const XP_MAX = 500;         // LEVEL MAX

  // A = 4, B = 3, C = 2, D = 1, fail = 0 (official GPA tooltip)
  const LETTER_POINTS = { A: 4, B: 3, C: 2, D: 1, E: 0, F: 0 };

  function letterFor(points) {
    if (points >= 4) return 'A';
    if (points >= 3) return 'B';
    if (points >= 2) return 'C';
    if (points >= 1) return 'D';
    return 'E';
  }

  // Returns points for an official grade, or null while the grade is not set ("in progress").
  function officialPoints(grade) {
    if (typeof grade !== 'string') return null;
    const g = grade.trim().toUpperCase();
    if (g in LETTER_POINTS) return LETTER_POINTS[g];
    if (/^(FAIL|FAILED|ÉCHEC|ECHEC|ÉCHOUÉ|ECHOUE)$/.test(g)) return 0;
    return null;
  }

  // Letters: 1 point per 100 XP of average, capped at 4 (>= 400 → A, < 100 → fail).
  // Linear: 4 × average / 500.
  function estimatePoints(averageScore, mode) {
    const avg = Math.max(0, Number(averageScore) || 0);
    if (mode === 'linear') return Math.min(4, (4 * avg) / XP_MAX);
    return Math.min(4, Math.floor(avg / XP_FOR_CREDITS));
  }

  function evaluateModule(block, settings) {
    const s = { ...DEFAULT_SETTINGS, ...(settings || {}) };
    const avg = Math.max(0, Number(block.averageScore) || 0);
    const official = officialPoints(block.grade);
    const isOfficial = official !== null;
    const points = isOfficial ? official : estimatePoints(avg, s.mode);
    const acquired = isOfficial ? official > 0 : avg >= XP_FOR_CREDITS;
    const letter = isOfficial ? letterFor(official) : (acquired ? letterFor(Math.floor(avg / XP_FOR_CREDITS)) : 'E');
    return {
      id: block.id,
      title: block.titleFr || block.title || '',
      titleEn: block.title || '',
      credits: Math.max(0, Number(block.credits) || 0),
      averageScore: avg,
      points,
      letter,
      isOfficial,
      acquired,
      status: isOfficial ? 'official' : (acquired ? 'acquired' : 'in_progress'),
      enrolled: Boolean(block.hasOpportunity) || avg > 0 || isOfficial,
      validatedCount: Number(block.validatedCount) || 0,
      totalCount: Number(block.totalCount) || 0,
      outcomes: (block.learningOutcomes || []).map((o) => ({
        title: o.titleFr || o.title || '',
        titleEn: o.title || '',
        score: Number(o.score) || 0,
        level: Number(o.level) || 0,
        isMaxLevel: Boolean(o.isMaxLevel),
      })),
    };
  }

  function weighted(base, baseCredits, modules) {
    let num = 0;
    let den = 0;
    if (Number.isFinite(base) && baseCredits > 0) {
      num += base * baseCredits;
      den += baseCredits;
    }
    for (const m of modules) {
      num += m.points * m.credits;
      den += m.credits;
    }
    return den > 0 ? num / den : null;
  }

  // validations: GET /api/evaluations/validations/me ; profile: GET /api/students/profile
  function computeGpa(validations, profile, settings) {
    const s = { ...DEFAULT_SETTINGS, ...(settings || {}) };
    const blocks = Array.isArray(validations && validations.blocks) ? validations.blocks : [];
    const modules = blocks.map((b) => evaluateModule(b, s)).filter((m) => m.enrolled && m.credits > 0);

    const officialGpa = profile && profile.gpa != null ? parseFloat(String(profile.gpa).replace(',', '.')) : NaN;
    const totalAcquired = Number(validations && validations.totalAcquiredCredits) || 0;

    // Modules of this semester that already carry an official grade are assumed to be
    // part of the official GPA: take their credits out of the base, then add them back once.
    const officialHere = modules.filter((m) => m.isOfficial);
    const baseCredits = Math.max(0, totalAcquired - officialHere.reduce((n, m) => n + (m.acquired ? m.credits : 0), 0));

    const counted = modules.filter((m) => m.isOfficial || m.acquired || s.countInProgress);
    const pessimistic = modules; // every enrolled module, under 100 XP = fail

    return {
      officialGpa: Number.isFinite(officialGpa) ? officialGpa : null,
      baseCredits,
      estimatedGpa: weighted(officialGpa, baseCredits, counted),
      pessimisticGpa: weighted(officialGpa, baseCredits, pessimistic),
      countedCredits: counted.reduce((n, m) => n + m.credits, 0),
      enrolledCredits: modules.reduce((n, m) => n + m.credits, 0),
      semester: validations ? validations.semester : null,
      settings: s,
      modules,
    };
  }

  function formatPoints(value, digits = 2, decimal = ',') {
    if (value == null || !Number.isFinite(value)) return '—';
    return value.toFixed(digits).replace('.', decimal);
  }

  const api = { DEFAULT_SETTINGS, XP_FOR_CREDITS, XP_MAX, letterFor, officialPoints, estimatePoints, evaluateModule, computeGpa, formatPoints };
  root.GpaTek = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

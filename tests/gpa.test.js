// Run with: npm test  (or: node --test)
const test = require('node:test');
const assert = require('node:assert/strict');
const G = require('../src/lib/gpa.js');

const block = (over = {}) => ({ id: 1, title: 'Unit', credits: 4, averageScore: 0, hasOpportunity: true, ...over });

test('letters mode: 1 point per 100 XP, capped at 4', () => {
  assert.equal(G.estimatePoints(99, 'letters'), 0);
  assert.equal(G.estimatePoints(100, 'letters'), 1);
  assert.equal(G.estimatePoints(399, 'letters'), 3);
  assert.equal(G.estimatePoints(500, 'letters'), 4);
});

test('linear mode: 4 × XP / 500, capped at 4', () => {
  assert.equal(G.estimatePoints(250, 'linear'), 2);
  assert.equal(G.estimatePoints(800, 'linear'), 4);
});

test('official grades', () => {
  assert.equal(G.officialPoints('A'), 4);
  assert.equal(G.officialPoints(' e '), 0);
  assert.equal(G.officialPoints('Échec'), 0);
  assert.equal(G.officialPoints(null), null);
  assert.equal(G.officialPoints('-'), null);
});

test('evaluateModule: status and letter', () => {
  assert.equal(G.evaluateModule(block({ averageScore: 50 })).status, 'in_progress');
  const acquired = G.evaluateModule(block({ averageScore: 320 }));
  assert.equal(acquired.status, 'acquired');
  assert.equal(acquired.letter, 'B');
  const official = G.evaluateModule(block({ averageScore: 50, grade: 'A' }));
  assert.equal(official.status, 'official');
  assert.equal(official.points, 4);
});

test('computeGpa: weights official GPA with acquired modules only', () => {
  const validations = {
    totalAcquiredCredits: 20,
    semester: 3,
    blocks: [block({ averageScore: 400 }), block({ id: 2, averageScore: 50 })],
  };
  const r = G.computeGpa(validations, { gpa: '3,00' });
  assert.equal(r.officialGpa, 3);
  assert.equal(r.baseCredits, 20);
  assert.equal(r.countedCredits, 4);
  assert.equal(r.estimatedGpa, (3 * 20 + 4 * 4) / 24);
  assert.equal(r.pessimisticGpa, (3 * 20 + 4 * 4 + 0 * 4) / 28);
});

test('computeGpa: officially graded modules are not counted twice', () => {
  const validations = { totalAcquiredCredits: 20, blocks: [block({ grade: 'B' })] };
  const r = G.computeGpa(validations, { gpa: 3.5 });
  assert.equal(r.baseCredits, 16);
  assert.equal(r.estimatedGpa, (3.5 * 16 + 3 * 4) / 20);
});

test('formatPoints uses a French decimal comma by default', () => {
  assert.equal(G.formatPoints(3.456), '3,46');
  assert.equal(G.formatPoints(3.456, 2, '.'), '3.46');
  assert.equal(G.formatPoints(null), '—');
});

test('evaluateModule keeps French and English titles', () => {
  const m = G.evaluateModule(block({
    title: 'Unit', titleFr: 'Unité',
    learningOutcomes: [{ title: 'Skill', titleFr: 'Compétence', score: 50, level: 1 }],
  }));
  assert.equal(m.title, 'Unité');
  assert.equal(m.titleEn, 'Unit');
  assert.equal(m.outcomes[0].title, 'Compétence');
  assert.equal(m.outcomes[0].titleEn, 'Skill');
});

test('nextStep: credits first, then each letter up to A', () => {
  assert.deepEqual(G.nextStep(23, 'letters', 4), { targetXp: 100, letter: 'D', credits: true, missingXp: 77, totalXp: 308, skills: 4 });
  assert.equal(G.nextStep(100, 'letters').targetXp, 200);
  assert.equal(G.nextStep(100, 'letters').letter, 'C');
  assert.equal(G.nextStep(263, 'letters', 4).letter, 'B');
  assert.equal(G.nextStep(263, 'letters', 4).missingXp, 37);
  assert.equal(G.nextStep(263, 'letters', 4).totalXp, 148);
  assert.equal(G.nextStep(399.5, 'letters').missingXp, 1);
  assert.equal(G.nextStep(400, 'letters'), null);
  assert.equal(G.nextStep(520, 'letters'), null);
});

test('nextStep: linear mode only has the credits step', () => {
  assert.equal(G.nextStep(50, 'linear').targetXp, 100);
  assert.equal(G.nextStep(50, 'linear').credits, true);
  assert.equal(G.nextStep(150, 'linear'), null);
});

test('nextStep: at least one skill, so the total is never zero', () => {
  assert.equal(G.nextStep(50, 'letters', 0).skills, 1);
  assert.equal(G.nextStep(50, 'letters', 0).totalXp, 50);
});

test('evaluateModule: next step from the skills, none once officially graded', () => {
  const skills = [{ score: 250 }, { score: 270 }, { score: 260 }, { score: 272 }];
  assert.equal(G.evaluateModule(block({ averageScore: 263, learningOutcomes: skills })).next.totalXp, 148);
  assert.equal(G.evaluateModule(block({ averageScore: 263, totalCount: 5 })).next.skills, 5);
  assert.equal(G.evaluateModule(block({ averageScore: 263, grade: 'B' })).next, null);
});

test('evaluateModule: no next step once no activity is linked to the module', () => {
  const closed = G.evaluateModule(block({ averageScore: 263, hasOpportunity: false }));
  assert.equal(closed.next, null);
  assert.equal(closed.hasActivities, false);
  assert.equal(closed.enrolled, true);
  assert.equal(closed.points, 2);
  assert.equal(G.evaluateModule(block({ averageScore: 263 })).hasActivities, true);
});

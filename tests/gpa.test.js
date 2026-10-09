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

test('formatPoints uses a French decimal comma', () => {
  assert.equal(G.formatPoints(3.456), '3,46');
  assert.equal(G.formatPoints(null), '—');
});

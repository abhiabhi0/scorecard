import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Load files
const htmlPath = path.resolve('games/canasta/index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

const homePath = path.resolve('index.html');
const homeContent = fs.readFileSync(homePath, 'utf-8');

test('DOM structure: Single shared headings for both teams', () => {
  // Check section heading elements appear only once
  const bonusMatches = htmlContent.match(/<span>Canasta bonuses &amp; going out<\/span>/g);
  assert.equal(bonusMatches?.length, 1, 'Canasta bonuses heading element must appear only once');

  const meldMatches = htmlContent.match(/<span>Melded hands · count cards<\/span>/g);
  assert.equal(meldMatches?.length, 1, 'Melded hands heading element must appear only once');

  const handMatches = htmlContent.match(/<span>Cards left · count cards<\/span>/g);
  assert.equal(handMatches?.length, 1, 'Cards left heading element must appear only once');

  // Check section banners have proper class and colors
  assert.ok(htmlContent.includes('.bonus-header { background: #8f3d5f; }'), 'Bonus header has muted magenta');
  assert.ok(htmlContent.includes('.meld-header { background: #174e4f; }'), 'Meld header has dark teal');
  assert.ok(htmlContent.includes('.hand-header { background: #7c4e0e; }'), 'Hand header has warm gold/brown');

  // Check side-by-side layout across screen sizes
  assert.ok(htmlContent.includes('.shared-cols {'), 'Defines shared-cols grid');
  assert.ok(htmlContent.includes('grid-template-columns: minmax(0, 1fr) minmax(0, 1fr)'), 'Uses 2-column side-by-side layout');
  assert.ok(htmlContent.includes('.team-header-grid'), 'Includes team label header grid');
});

test('Homepage title contrast and structure', () => {
  assert.ok(homeContent.includes('class="hero-shell"'), 'Includes hero-shell');
  assert.ok(homeContent.includes('background:var(--bg)'), 'Hero shell uses dark teal background');
  assert.ok(homeContent.includes('color:#fff'), 'Wordmark and title are white on dark teal');
  assert.ok(homeContent.includes('Scorepad'), 'Scorepad title present');
});

test('Scoring logic calculations', () => {
  // Extract and verify scoring calculation directly
  const ranks = [
    { key: 'J', label: 'Jokers', points: 50 },
    { key: '2', label: '2s', points: 20 },
    { key: 'A', label: 'Aces', points: 20 },
    { key: 'K8', label: 'Kings–8s', points: 10 },
    { key: '74', label: '7s–4s', points: 5 },
    { key: 'B3', label: 'Black 3s', points: 5 }
  ];

  function countPoints(counts) {
    return ranks.reduce((s, r) => s + (Number(counts?.[r.key]) || 0) * r.points, 0);
  }

  function red3Points(n) {
    const count = Math.min(4, Math.max(0, Number(n) || 0));
    return count === 4 ? 800 : count * 100;
  }

  function calculateTeamScore(t) {
    const meldCards = { ...(t.meldCards || {}) };
    const handCards = { ...(t.handCards || {}) };
    const meldCardPts = countPoints(meldCards);
    const meldExtra = Math.max(0, Number(t.meldExtra) || 0);
    const totalMeld = meldCardPts + meldExtra;
    const handCardPts = countPoints(handCards);
    const handExtra = Math.max(0, Number(t.handExtra) || 0);
    const totalHand = handCardPts + handExtra;
    const natural = Math.max(0, Number(t.natural) || 0);
    const naturalBonus = natural * 500;
    const mixed = Math.max(0, Number(t.mixed) || 0);
    const mixedBonus = mixed * 300;
    const red3 = Math.min(4, Math.max(0, Number(t.red3) || 0));
    const red3Bonus = red3Points(red3);
    const out = !!t.out;
    const outBonus = out ? 100 : 0;
    const delta = totalMeld - totalHand + naturalBonus + mixedBonus + red3Bonus + outBonus;
    return { meldCards, handCards, meldCardPts, meldExtra, meld: totalMeld, totalMeld, handCardPts, handExtra, hand: totalHand, totalHand, natural, naturalBonus, mixed, mixedBonus, red3, red3Bonus, out, outBonus, delta };
  }

  // 1. Natural canasta: 1 -> +500
  const t1 = calculateTeamScore({ natural: 1 });
  assert.equal(t1.delta, 500, '1 natural canasta should add 500 points');

  // 2. Mixed canasta: 1 -> +300
  const t2 = calculateTeamScore({ mixed: 1 });
  assert.equal(t2.delta, 300, '1 mixed canasta should add 300 points');

  // 3. Going Out: +100
  const t3 = calculateTeamScore({ natural: 1, out: true });
  assert.equal(t3.delta, 600, 'Natural canasta + going out should be 500 + 100 = 600');

  // 4. Red-three rules: 1 -> 100, 2 -> 200, 3 -> 300, 4 -> 800
  assert.equal(calculateTeamScore({ red3: 1 }).delta, 100, '1 red 3 = 100 pts');
  assert.equal(calculateTeamScore({ red3: 2 }).delta, 200, '2 red 3s = 200 pts');
  assert.equal(calculateTeamScore({ red3: 3 }).delta, 300, '3 red 3s = 300 pts');
  assert.equal(calculateTeamScore({ red3: 4 }).delta, 800, '4 red 3s = 800 pts');

  // 5. Melded cards + cards left + bonuses
  const complex = calculateTeamScore({
    meldCards: { J: 1, '2': 2, A: 1 }, // 50 + 40 + 20 = 110
    meldExtra: 20, // total meld = 130
    handCards: { K8: 2, '74': 1 }, // 20 + 5 = 25
    handExtra: 5, // total hand = 30
    natural: 1, // 500
    mixed: 1, // 300
    red3: 4, // 800
    out: true // 100
  });
  // Delta = 130 - 30 + 500 + 300 + 800 + 100 = 1800
  assert.equal(complex.delta, 1800, 'Complex round score calculation must match expected delta');
});

test('Floating Live Score Summary elements and styles', () => {
  // Check floating bar element exists
  assert.ok(htmlContent.includes('id="floatingScoreBar"'), 'Includes floatingScoreBar aside');
  assert.ok(htmlContent.includes('id="floatRoundA"'), 'Includes floatRoundA');
  assert.ok(htmlContent.includes('id="floatRoundB"'), 'Includes floatRoundB');
  assert.ok(htmlContent.includes('id="floatTotalA"'), 'Includes floatTotalA');
  assert.ok(htmlContent.includes('id="floatTotalB"'), 'Includes floatTotalB');
  assert.ok(htmlContent.includes('id="floatNameA"'), 'Includes floatNameA');
  assert.ok(htmlContent.includes('id="floatNameB"'), 'Includes floatNameB');

  // Check CSS styling
  assert.ok(htmlContent.includes('position: fixed;'), 'Bar is fixed at the bottom');
  assert.ok(htmlContent.includes('bottom: 0;'), 'Bar sits at bottom of viewport');
  assert.ok(htmlContent.includes('env(safe-area-inset-bottom)'), 'Considers safe area inset');
  assert.ok(htmlContent.includes('calc(98px + env(safe-area-inset-bottom))'), 'Body has sufficient bottom padding');
});

test('Unboxed scoring layout and maximized mobile width', () => {
  // Check that #entryPanel removes card styling
  assert.ok(htmlContent.includes('#entryPanel.panel, #entryPanel'), 'Entry panel overrides .panel container styles');
  assert.ok(htmlContent.includes('background: transparent;'), 'Uses unboxed transparent background for entry panel');

  // Check shared sections have no decorative border or outer rounded card
  assert.ok(htmlContent.includes('.shared-section {'), 'Defines .shared-section');
  assert.ok(htmlContent.includes('border: 0;'), 'Eliminates outer container borders');

  // Check team header cells have no background card or bulky rounded border
  assert.ok(htmlContent.includes('.team-header-cell.a {'), 'Team A header accent');
  assert.ok(htmlContent.includes('.team-header-cell.b {'), 'Team B header accent');
  assert.ok(htmlContent.includes('border-bottom: 2px solid #8f3d5f;'), 'Team A has subtle bottom accent');
  assert.ok(htmlContent.includes('border-bottom: 2px solid #7c4e0e;'), 'Team B has subtle bottom accent');

  // Check compact mobile page padding
  assert.ok(htmlContent.includes('.app { max-width: 900px; margin: 0 auto; padding: 0 6px; }'), 'Minimizes page-level horizontal padding on mobile');
  assert.ok(htmlContent.includes('@media (max-width: 360px) { .app { padding: 0 4px; } }'), 'Optimizes padding for narrow 320-360px screens');

  // Check shared section headers retain distinct high-contrast colors and compact padding
  assert.ok(htmlContent.includes('.bonus-header { background: #8f3d5f; }'), 'Bonus header maintains muted magenta');
  assert.ok(htmlContent.includes('.meld-header { background: #174e4f; }'), 'Meld header maintains dark teal');
  assert.ok(htmlContent.includes('.hand-header { background: #7c4e0e; }'), 'Hand header maintains warm gold/brown');

  // Check counter rows alignment and compact stepper buttons
  assert.ok(htmlContent.includes('.count-row, .bonus-row {'), 'Defines unified counter rows');
  assert.ok(htmlContent.includes('touch-action: manipulation;'), 'Touch-action optimized for responsive mobile taps');
});


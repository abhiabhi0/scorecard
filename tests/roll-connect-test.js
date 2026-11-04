import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const page=fs.readFileSync('games/roll-connect/index.html','utf8');
const home=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');

test('homepage and app shell include Roll & Connect',()=>{
 assert.ok(home.includes('games/roll-connect/index.html'));
 assert.ok(sw.includes('./games/roll-connect/index.html'));
 assert.ok(sw.includes('scorepad-static-v6'));
});
test('each player has independent numbers and repeated numbers skip',()=>{
 assert.match(page,/Each player has an independent set of numbers/);
 assert.match(page,/state\.connected\[player\]\.includes\(result\)/);
 assert.match(page,/already connected\. Turn skipped/);
 assert.match(page,/state\.connected\[player\]\.push\(result\)/);
});
test('win condition requires six connections by one player',()=>{
 assert.match(page,/state\.connected\[player\]\.length===6/);
 assert.match(page,/state\.winner=player/);
});
test('local persistence and service worker registration are present',()=>{
 assert.match(page,/scorepad\.rollConnect\.v1/);
 assert.match(page,/localStorage\.setItem\(KEY/);
 assert.match(page,/navigator\.serviceWorker\.register\('\.\.\/\.\.\/sw\.js'\)/);
});

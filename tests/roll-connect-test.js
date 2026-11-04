import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const R=require('../games/roll-connect/game-logic.js');
const page=fs.readFileSync('games/roll-connect/index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');

test('a roll creates one undo point and exposes the rolled number',()=>{
 let s=R.roll(R.freshState(),4).state;assert.equal(s.pendingRoll,4);assert.equal(s.turn,0);assert.equal(s.history.length,1);
});
test('players have independent copies of numbers',()=>{
 let s=R.roll(R.freshState(),3).state;s=R.connect(s,0,3).state;
 s=R.roll(s,3).state;assert.equal(s.pendingRoll,3);s=R.connect(s,1,3).state;
 assert.deepEqual(s.connected,[[3],[3]]);
});
test('a repeated number for the same player skips and passes the turn',()=>{
 let s=R.roll(R.freshState(),2).state;s=R.connect(s,0,2).state;
 s=R.roll(s,1).state;s=R.connect(s,1,1).state;
 const r=R.roll(s,2);assert.equal(r.event,'duplicate');assert.equal(r.state.turn,1);assert.equal(r.state.pendingRoll,null);
});
test('wrong player or number cannot connect',()=>{
 const s=R.roll(R.freshState(),5).state;assert.equal(R.connect(s,0,4).event,'invalid');assert.equal(R.connect(s,1,5).event,'invalid');
 assert.equal(s.pendingRoll,5);assert.deepEqual(s.connected,[[],[]]);
});
test('first player to connect all six wins',()=>{
 let s=R.freshState();for(let n=1;n<=6;n++){s=R.roll(s,n).state;s=R.connect(s,0,n).state;s.turn=0;}
 assert.equal(s.winner,0);assert.equal(s.connected[0].length,6);assert.equal(R.roll(s,1).event,'blocked');
});
test('undo restores the complete previous turn',()=>{
 let s=R.roll(R.freshState(),6).state;s=R.connect(s,0,6).state;const u=R.undo(s);
 assert.deepEqual(u.connected,[[],[]]);assert.equal(u.turn,0);assert.equal(u.pendingRoll,null);assert.equal(u.history.length,0);
});
test('stored state validation rejects duplicates and invalid numbers',()=>{
 assert.equal(R.validState(R.freshState()),true);const bad=R.freshState();bad.connected[0]=[2,2];assert.equal(R.validState(bad),false);
});
test('game page has a visible die and offline logic dependency',()=>{
 assert.match(page,/id="diceButton"/);assert.match(page,/id="player0"/);assert.match(page,/id="player1"/);assert.match(page,/game-logic\.js/);
 assert.match(sw,/games\/roll-connect\/game-logic\.js/);
});

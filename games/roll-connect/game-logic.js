(() => {
  const freshState = (names = ['Player 1', 'Player 2']) => ({names:[...names],connected:[[],[]],turn:0,lastRoll:null,pendingRoll:null,winner:null,history:[]});
  const snapshot = s => ({names:[...s.names],connected:s.connected.map(a=>[...a]),turn:s.turn,lastRoll:s.lastRoll,pendingRoll:s.pendingRoll,winner:s.winner});
  function roll(s,n) {
    if(s.winner!==null||s.pendingRoll!==null)return {state:s,event:'blocked'};
    if(!Number.isInteger(n)||n<1||n>6)throw new RangeError('Die result must be 1–6');
    const next=snapshot(s);next.history=[...s.history,snapshot(s)];next.lastRoll=n;
    if(next.connected[next.turn].includes(n)){const player=next.turn;next.turn=1-player;return {state:next,event:'duplicate',player,value:n};}
    next.pendingRoll=n;return {state:next,event:'rolled',player:next.turn,value:n};
  }
  function connect(s,p,n) {
    if(s.winner!==null||s.pendingRoll===null)return {state:s,event:'blocked'};
    if(p!==s.turn||n!==s.pendingRoll)return {state:s,event:'invalid'};
    const next=snapshot(s);next.history=[...s.history];next.connected[p].push(n);next.pendingRoll=null;
    if(next.connected[p].length===6){next.winner=p;return {state:next,event:'won',player:p,value:n};}
    next.turn=1-p;return {state:next,event:'connected',player:p,value:n};
  }
  function undo(s){if(!s.history.length)return s;const h=[...s.history],previous=h.pop();return {...previous,history:h};}
  function reset(s){return freshState(s.names);}
  function validState(s){
    return !!s&&Array.isArray(s.names)&&s.names.length===2&&Array.isArray(s.connected)&&s.connected.length===2&&[0,1].includes(s.turn)&&
      s.connected.every(a=>Array.isArray(a)&&a.every(n=>Number.isInteger(n)&&n>=1&&n<=6)&&new Set(a).size===a.length)&&
      (s.pendingRoll===null||(Number.isInteger(s.pendingRoll)&&s.pendingRoll>=1&&s.pendingRoll<=6))&&
      (s.winner===null||[0,1].includes(s.winner));
  }
  const api={freshState,snapshot,roll,connect,undo,reset,validState};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(typeof window!=='undefined')window.RollConnectRules=api;
})();
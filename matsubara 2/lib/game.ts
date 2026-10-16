export type Rank = 'A'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'J'|'Q'|'K'|'Joker';
export type Suit = '♥'|'♦'|'♠'|'♣';
export interface Player { id: string; name: string }
export interface RequestUsage { playerId: string; count: number }
export interface SpecialWildcardInfo { turnedRank: Rank; turnedSuit: Suit; rank: Rank; suits: Suit[] }
export interface RoundResult { playerId: string; points: number; cards: Rank[] }
export interface Round { number: number; winnerPlayerId: string; results: RoundResult[]; requestCounts: Record<string,number>; turnedRank?: Rank; turnedSuit?: Suit }
export interface Match { id: string; rounds: Round[]; currentRound: number; status: 'active'|'complete'; requests: Record<string,number>; draft?: Round }
export interface Championship { id: string; name: string; players: Player[]; matches: Match[]; status: 'active'|'complete'; createdAt: string }
export interface AppSettings { theme: 'system'|'light'|'dark'; preferredScoringMode: 'quick'|'cards' }
export interface AppData { version: 1; championships: Championship[]; activeId?: string; settings: AppSettings }
export const objectives = ['Uma trinca','Duas trincas','Uma quadra','Duas quadras','Uma quina','Duas quinas','Sequência de 7 cartas'];
export const descriptions = ['3 cartas do mesmo valor, de qualquer naipe.','2 grupos de 3 cartas do mesmo valor.','4 cartas do mesmo valor, de qualquer naipe.','2 grupos de 4 cartas do mesmo valor.','5 cartas do mesmo valor, de qualquer naipe.','2 grupos de 5 cartas do mesmo valor.','7 cartas em sequência, todas do mesmo naipe.'];
export const ranks: Rank[] = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
export const id = () => crypto.randomUUID();
export const cardValue = (rank: Rank) => rank === 'A' ? 15 : ['J','Q','K','Joker'].includes(rank) ? 10 : Number(rank);
export const sumCards = (cards: Rank[]) => cards.reduce((n,c)=>n+cardValue(c),0);
export function wildcard(rank: Rank, suit: Suit): SpecialWildcardInfo { return {turnedRank:rank,turnedSuit:suit,rank:ranks[(ranks.indexOf(rank)+1)%13],suits:['♥','♦'].includes(suit)?['♠','♣']:['♥','♦']}; }
export function changeRequest(current: number, delta: number) { const next = current+delta; if(!Number.isInteger(next)||next<0||next>7) throw new Error('Cada jogador pode usar até 7 pedidos por partida.'); return next; }
export function newMatch(players: Player[]): Match { return {id:id(),rounds:[],currentRound:1,status:'active',requests:Object.fromEntries(players.map(p=>[p.id,0]))}; }
export function blankRound(match: Match, players: Player[], number=match.currentRound): Round { return {number,winnerPlayerId:'',results:players.map(p=>({playerId:p.id,points:0,cards:[]})),requestCounts:{...match.requests}}; }
export function saveRound(match: Match, round: Round, players: Player[]): Match {
 if(match.status==='complete' && !match.rounds.some(r=>r.number===round.number)) throw new Error('Partida já finalizada.');
 if(round.number<1||round.number>7||!Number.isInteger(round.number)) throw new Error('Rodada inválida.');
 if(!players.some(p=>p.id===round.winnerPlayerId)) throw new Error('Selecione quem venceu a rodada.');
 if(round.results.length!==players.length||players.some(p=>round.results.filter(r=>r.playerId===p.id).length!==1)) throw new Error('Informe todos os jogadores.');
 const results=round.results.map(r=>{if(!Number.isFinite(r.points)||!Number.isInteger(r.points)||(r.playerId!==round.winnerPlayerId&&r.points<0)) throw new Error('Informe pontos inteiros, iguais ou maiores que zero.');return {...r,points:r.playerId===round.winnerPlayerId?-20:r.points};});
 const rounds=[...match.rounds.filter(r=>r.number!==round.number),{...round,results}].sort((a,b)=>a.number-b.number);
 const complete=rounds.length===7;
 return {...match,rounds,status:complete?'complete':'active',currentRound:complete?7:rounds.length+1,draft:undefined};
}
export function ranking(players: Player[], matches: Match[], reveal: boolean) {
 if(!reveal) return [];
 const list=players.map(p=>({...p,points:matches.reduce((s,m)=>s+m.rounds.reduce((v,r)=>v+(r.results.find(x=>x.playerId===p.id)?.points||0),0),0),roundWins:matches.reduce((s,m)=>s+m.rounds.filter(r=>r.winnerPlayerId===p.id).length,0),matchWins:matches.filter(m=>m.status==='complete'&&Math.min(...players.map(q=>m.rounds.reduce((s,r)=>s+(r.results.find(x=>x.playerId===q.id)?.points||0),0)))===m.rounds.reduce((s,r)=>s+(r.results.find(x=>x.playerId===p.id)?.points||0),0)).length}));
 return list.sort((a,b)=>a.points-b.points).map((p,_,all)=>({...p,place:all.filter(x=>x.points<p.points).length+1}));
}
export const initialData: AppData = {version:1,championships:[],settings:{theme:'system',preferredScoringMode:'quick'}};
export function parseData(raw: string): AppData {
 const d=JSON.parse(raw) as AppData;
 if(d.version!==1||!Array.isArray(d.championships)||!d.settings||!['system','light','dark'].includes(d.settings.theme)||!['quick','cards'].includes(d.settings.preferredScoringMode)) throw new Error('Arquivo de backup inválido.');
 const ids=new Set<string>();
 for(const c of d.championships){if(!c.id||ids.has(c.id)||typeof c.name!=='string'||!Array.isArray(c.players)||!c.players.length||!Array.isArray(c.matches)||!['active','complete'].includes(c.status)) throw new Error('Campeonato inválido.');ids.add(c.id);const pids=new Set(c.players.map(p=>p.id));if(pids.size!==c.players.length||c.players.some(p=>!p.id||typeof p.name!=='string'||!p.name.trim()))throw new Error('Jogadores inválidos.');for(const m of c.matches){if(!m.id||!Array.isArray(m.rounds)||m.rounds.length>7||!['active','complete'].includes(m.status)||m.currentRound<1||m.currentRound>7||!m.requests)throw new Error('Partida inválida.');for(const p of c.players)if(!Number.isInteger(m.requests[p.id])||m.requests[p.id]<0||m.requests[p.id]>7)throw new Error('Pedidos inválidos.');const seen=new Set<number>();for(const r of m.rounds){if(seen.has(r.number)||!pids.has(r.winnerPlayerId))throw new Error('Rodada inválida.');seen.add(r.number);saveRound({...m,status:'active'},r,c.players);}if(m.status==='complete'&&m.rounds.length!==7)throw new Error('Partida incompleta.');}}
 return d;
}

import {useState,useEffect,createElement} from 'react';
import {createRoot} from 'react-dom/client';
import htm from 'htm';
import './index.css';
const html=htm.bind(createElement);
const KEY='legetio-v1';
const uid=()=>Math.random().toString(36).slice(2,9);let DB;
const day=o=>new Date(Date.UTC(2026,10,5+o)).toISOString().slice(0,10);
const ORD=['Round of 32','Round of 16','Quarter-final','Semi-final','Third place','Final'];
const EI={goal:'⚽',assist:'🅰️',yellow:'🟨',red:'🟥'};
function seed(){let s=7;const r=n=>{s=(s*9301+49297)%233280;return Math.floor(s/233280*n)};
const wards={'North Ward':['Legetio United','Northern Stars','Kijana FC','Eagles Youth'],'Central Ward':['Central Rangers','Town Lions','Rising Sun','Valley Boys']};
const fn=['Brian','Kevin','Dennis','Ian','Victor','Samuel','Joel','Felix','Collins','Allan','Peter','Mark'],ln=['Kiprop','Otieno','Kamau','Chebet','Mutua','Rotich','Wekesa','Kiplagat','Njoroge','Cheruiyot'];
const nm=()=>fn[r(12)]+' '+ln[r(10)],pos=['GK','DF','DF','MF','MF','FW','FW'];const teams=[];
Object.entries(wards).forEach(([w,ns])=>ns.forEach(n=>teams.push({id:uid(),name:n,ward:w,coach:nm(),players:pos.map((p,i)=>({id:uid(),name:nm(),pos:p,no:i+1}))})));
const matches=[];
Object.keys(wards).forEach((w,wi)=>{const t=teams.filter(x=>x.ward===w);let n=0;
for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){const h=t[i],a=t[j];const st=n<4?'FT':(n===4&&wi===0?'Live':'Upcoming');
const m={id:uid(),stage:'ward',ward:w,round:'Group',date:day(n<4?n:n===4?6:8),time:['10:00','13:00','15:30'][(n+wi)%3],venue:wi?'Central Stadium':'Legetio Grounds',home:h.id,away:a.id,hs:null,as:null,status:st,events:[],motm:null};
if(st!=='Upcoming'){m.hs=r(st==='Live'?2:4);m.as=r(3);
[[h,m.hs],[a,m.as]].forEach(([tm,g])=>{for(let k=0;k<g;k++){const sc=tm.players[3+r(4)];m.events.push({id:uid(),type:'goal',team:tm.id,player:sc.id,min:r(88)+1});if(r(2))m.events.push({id:uid(),type:'assist',team:tm.id,player:tm.players[1+r(4)].id,min:0})}});
if(r(3)===0){const p=a.players[r(7)];m.events.push({id:uid(),type:'yellow',team:a.id,player:p.id,min:r(80)+5})}
if(st==='FT'){const wt=m.hs>=m.as?h:a;m.motm=wt.players[r(7)].id}}
matches.push(m);n++}});
return{teams,matches,news:[{id:uid(),text:'Welcome to the Legetio Youth Tournament! Ward qualifiers are underway.',date:day(5)},{id:uid(),text:'Top 2 teams from every ward advance to the constituency main tournament.',date:day(6)}]}}
function load(){try{const s=localStorage.getItem(KEY);if(s)return JSON.parse(s)}catch(e){}return seed()}
const tn=id=>(DB.teams.find(t=>t.id===id)||{name:'TBD'}).name;
const pn=id=>{for(const t of DB.teams){const p=t.players.find(p=>p.id===id);if(p)return p.name}return'?'};
const standings=(teams,matches)=>{const m={};teams.forEach(t=>m[t.id]={t,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0});
matches.filter(x=>x.status==='FT').forEach(x=>{const a=m[x.home],b=m[x.away];if(!a||!b)return;const h=x.hs||0,g=x.as||0;a.p++;b.p++;a.gf+=h;a.ga+=g;b.gf+=g;b.ga+=h;
if(h>g){a.w++;b.l++;a.pts+=3}else if(h<g){b.w++;a.l++;b.pts+=3}else{a.d++;b.d++;a.pts++;b.pts++}});
return Object.values(m).map(o=>({...o,gd:o.gf-o.ga})).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||a.t.name.localeCompare(b.t.name))};
const qualified=(teams,matches)=>{const out=[];const wm=matches.filter(m=>m.stage==='ward');
[...new Set(teams.map(t=>t.ward))].forEach(w=>{const wt=teams.filter(t=>t.ward===w);if(!wm.some(m=>m.status==='FT'&&wt.some(t=>t.id===m.home)))return;
standings(wt,wm).slice(0,2).forEach((r,i)=>out.push({...r,rank:i+1}))});return out};
const pstats=()=>{const o={};DB.teams.forEach(t=>t.players.forEach(p=>o[p.id]={p,t,g:0,a:0,y:0,r:0,m:0}));
DB.matches.forEach(m=>{(m.events||[]).forEach(e=>{const s=o[e.player];if(!s)return;if(e.type==='goal')s.g++;if(e.type==='assist')s.a++;if(e.type==='yellow')s.y++;if(e.type==='red')s.r++});if(m.motm&&o[m.motm])o[m.motm].m++});return Object.values(o)};
const sortM=ms=>ms.slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
const formOf=id=>sortM(DB.matches.filter(m=>m.status==='FT'&&(m.home===id||m.away===id))).slice(-5).map(m=>{const[a,b]=m.home===id?[m.hs,m.as]:[m.as,m.hs];return a>b?'W':a<b?'L':'D'});
const useF=i=>{const[f,s]=useState(i);return[f,k=>e=>s({...f,[k]:e.target.value}),()=>s(i)]};

const Badge=({s})=>html`<span class=${'text-[10px] font-bold px-2 py-0.5 rounded-full '+(s==='Live'?'bg-red-600 text-white animate-pulse':s==='FT'?'bg-[var(--card2)] gold':'bg-[var(--card2)] mu')}>${s==='Live'?'● LIVE':s==='FT'?'FT':'Upcoming'}</span>`;
function MatchCard({m}){const[o,setO]=useState(false);
return html`<div class="card p-3 cursor-pointer" onClick=${()=>setO(!o)}>
<div class="flex justify-between items-center text-xs mu mb-2"><span>${m.stage==='ward'?m.ward:'Main Tournament'} · ${m.round}</span><${Badge} s=${m.status}/></div>
<div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center"><div class="font-semibold text-sm">${tn(m.home)}</div><div class="text-2xl font-black gold tabular-nums">${m.status==='Upcoming'?'vs':(m.hs||0)+' - '+(m.as||0)}</div><div class="font-semibold text-sm">${tn(m.away)}</div></div>
<div class="text-xs mu text-center mt-2">${m.date} · ${m.time} · ${m.venue}</div>
${o&&html`<div class="mt-3 pt-3 border-t border-[var(--ln)] text-sm space-y-1">${(m.events||[]).length?m.events.slice().sort((a,b)=>a.min-b.min).map(e=>html`<div key=${e.id} class=${e.team===m.away?'text-right':''}>${e.min?e.min+"' ":''}${EI[e.type]} ${pn(e.player)}</div>`):html`<div class="mu text-center">No events recorded</div>`}${m.motm&&html`<div class="text-center gold pt-1">⭐ Man of the Match: ${pn(m.motm)}</div>`}</div>`}</div>`}
function Table({rows,q=2}){return html`<div class="card overflow-x-auto"><table class="w-full text-sm"><thead class="mu text-xs"><tr>${['#','Team','P','W','D','L','GF','GA','GD','Pts'].map(h=>html`<th key=${h} class=${'p-2 '+(h==='Team'?'text-left':'text-center')}>${h}</th>`)}</tr></thead><tbody>${rows.map((r,i)=>html`<tr key=${r.t.id} class=${'border-t border-[var(--ln)] '+(i<q&&r.p?'q':'')}><td class="p-2 text-center">${i+1}</td><td class="p-2 font-semibold whitespace-nowrap">${r.t.name}${i<q&&r.p?' ✓':''}</td>${[r.p,r.w,r.d,r.l,r.gf,r.ga,r.gd,r.pts].map((v,j)=>html`<td key=${j} class=${'p-2 text-center '+(j===7?'font-bold gold':'')}>${v}</td>`)}</tr>`)}</tbody></table></div>`}
const Pills=({v,set,items})=>html`<div class="flex gap-2 overflow-x-auto pb-1">${items.map(([k,l])=>html`<button key=${k} class=${'pill '+(v===k?'on':'')} onClick=${()=>set(k)}>${l}</button>`)}</div>`;
const Form=({l,children})=>html`<label class="block text-xs mu">${l}${children}</label>`;
const Chip=({r})=>html`<span class=${'inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold text-white '+(r==='W'?'bg-green-600':r==='L'?'bg-red-600':'bg-gray-500')}>${r}</span>`;

function Home({go}){const ft=DB.matches.filter(m=>m.status==='FT'),live=DB.matches.filter(m=>m.status==='Live');
const goals=DB.matches.reduce((a,m)=>a+(m.hs||0)+(m.as||0),0);
const items=[...sortM(ft).slice(-6).map(m=>`FT: ${tn(m.home)} ${m.hs}-${m.as} ${tn(m.away)}`),...DB.news.map(n=>'📢 '+n.text)];
const up=sortM(DB.matches.filter(m=>m.status==='Upcoming')).slice(0,3);
return html`<div class="space-y-5">
<div class="rounded-2xl p-6 sm:p-10 text-white" style=${{background:'linear-gradient(135deg,#0b3d1f,#14532d 55%,#8a6400)'}}>
<div class="text-xs tracking-[.3em] text-yellow-300 font-bold">WARD → CONSTITUENCY</div>
<h1 class="text-4xl sm:text-6xl font-black leading-none mt-2">LEGETIO<br/><span class="text-yellow-300">YOUTH TOURNAMENT</span></h1>
<p class="mt-3 text-green-100 max-w-md">Grassroots football from ward qualifiers to the constituency main tournament.</p>
<div class="flex gap-2 mt-5 flex-wrap"><button class="btn" onClick=${()=>go('fixtures')}>View Fixtures</button><button class="btn2 !bg-white/10 !text-white !border-white/30" onClick=${()=>go('tables')}>Standings</button></div></div>
${live.length>0&&html`<div class="rounded-xl bg-red-600/90 text-white p-3 font-semibold text-sm animate-pulse">● LIVE NOW: ${live.map(m=>`${tn(m.home)} ${m.hs||0}-${m.as||0} ${tn(m.away)}`).join('  |  ')}</div>`}
<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">${[['Teams',DB.teams.length],['Played',ft.length],['Goals',goals],['Wards',new Set(DB.teams.map(t=>t.ward)).size]].map(([l,v])=>html`<div key=${l} class="card p-4 text-center"><div class="text-3xl font-black gold">${v}</div><div class="text-xs mu uppercase tracking-wider">${l}</div></div>`)}</div>
<div class="card py-2 overflow-hidden text-sm"><div class="mq"><span class="flex gap-12">${items.map((t,i)=>html`<span key=${i}>${t}</span>`)}</span><span class="flex gap-12" aria-hidden="true">${items.map((t,i)=>html`<span key=${i}>${t}</span>`)}</span></div></div>
<div class="grid md:grid-cols-2 gap-5"><div><h2 class="font-bold mb-2 gold">Next Fixtures</h2><div class="space-y-3">${up.length?up.map(m=>html`<${MatchCard} key=${m.id} m=${m}/>`):html`<div class="mu text-sm">No upcoming matches.</div>`}</div></div>
<div><h2 class="font-bold mb-2 gold">Latest Updates</h2><div class="space-y-2">${DB.news.slice().reverse().map(n=>html`<div key=${n.id} class="card p-3 text-sm"><div class="text-xs mu">${n.date}</div>${n.text}</div>`)}</div></div></div></div>`}

function Fixtures(){const[f,setF]=useState('all'),[st,setSt]=useState('all');
const ms=sortM(DB.matches).filter(m=>(f==='all'||m.status===f)&&(st==='all'||m.stage===st));
return html`<div class="space-y-3"><${Pills} v=${f} set=${setF} items=${[['all','All'],['Upcoming','Upcoming'],['Live','Live'],['FT','Results']]}/><${Pills} v=${st} set=${setSt} items=${[['all','Both stages'],['ward','Stage 1 · Ward'],['main','Stage 2 · Main']]}/>
<div class="grid md:grid-cols-2 gap-3">${ms.map(m=>html`<${MatchCard} key=${m.id} m=${m}/>`)}</div>${!ms.length&&html`<div class="mu text-center py-10">No matches found.</div>`}</div>`}

function Tables(){const[s,setS]=useState('1');const wards=[...new Set(DB.teams.map(t=>t.ward))];const wm=DB.matches.filter(m=>m.stage==='ward');
const qual=qualified(DB.teams,DB.matches);const main=DB.matches.filter(m=>m.stage==='main');const gm=main.filter(m=>m.round==='Group');
const rounds=[...new Set(main.filter(m=>m.round!=='Group').map(m=>m.round))].sort((a,b)=>ORD.indexOf(a)-ORD.indexOf(b));
return html`<div class="space-y-4"><${Pills} v=${s} set=${setS} items=${[['1','Stage 1 · Ward Groups'],['2','Stage 2 · Main Tournament']]}/>
${s==='1'?wards.map(w=>html`<div key=${w}><h2 class="font-bold mb-2 gold">${w}</h2><${Table} rows=${standings(DB.teams.filter(t=>t.ward===w),wm)}/></div>`):html`<div class="space-y-5">
<div><h2 class="font-bold mb-2 gold">Qualified Teams (Top 2 per ward)</h2>${qual.length?html`<div class="grid sm:grid-cols-2 md:grid-cols-4 gap-2">${qual.map(r=>html`<div key=${r.t.id} class="card p-3"><div class="font-semibold text-sm">${r.t.name}</div><div class="text-xs mu">${r.t.ward} · ${r.rank===1?'Winner':'Runner-up'}</div></div>`)}</div>`:html`<div class="mu text-sm">No ward results yet — qualifiers appear automatically once ward matches finish.</div>`}</div>
${gm.length>0&&html`<div><h2 class="font-bold mb-2 gold">Group Stage</h2><${Table} q=${0} rows=${standings(DB.teams.filter(t=>qual.some(r=>r.t.id===t.id)),gm)}/></div>`}
<div><h2 class="font-bold mb-2 gold">Knockout Bracket</h2>${rounds.length?html`<div class="flex gap-4 overflow-x-auto pb-2">${rounds.map(r=>html`<div key=${r} class="min-w-[250px] space-y-3"><div class="text-sm font-bold mu uppercase">${r}</div>${sortM(main.filter(m=>m.round===r)).map(m=>html`<${MatchCard} key=${m.id} m=${m}/>`)}</div>`)}</div>`:html`<div class="mu text-sm">No knockout matches yet. Use Admin → Data → “Generate main fixtures”.</div>`}</div></div>`}</div>`}

function Stats(){const[k,setK]=useState('g');const ps=pstats();
const list=(key,lab)=>{const r=ps.filter(x=>x[key]>0).sort((a,b)=>b[key]-a[key]||a.p.name.localeCompare(b.p.name)).slice(0,15);
return r.length?html`<div class="card divide-y divide-[var(--ln)]">${r.map((x,i)=>html`<div key=${x.p.id} class="flex items-center gap-3 p-3"><div class="w-6 text-center font-bold mu">${i+1}</div><div class="flex-1"><div class="font-semibold text-sm">${x.p.name}</div><div class="text-xs mu">${x.t.name}</div></div><div class="text-xl font-black gold">${x[key]}</div></div>`)}</div>`:html`<div class="mu text-sm">No ${lab} recorded yet.</div>`};
const fp=DB.teams.map(t=>{const p=ps.filter(x=>x.t.id===t.id);const y=p.reduce((a,x)=>a+x.y,0),r=p.reduce((a,x)=>a+x.r,0);return{t,y,r,pts:y+3*r}}).sort((a,b)=>a.pts-b.pts||a.t.name.localeCompare(b.t.name));
return html`<div class="space-y-3"><${Pills} v=${k} set=${setK} items=${[['g','⚽ Golden Boot'],['a','🅰️ Assists'],['m','⭐ Man of the Match'],['f','🟨 Fair Play']]}/>
${k==='g'&&list('g','goals')}${k==='a'&&list('a','assists')}${k==='m'&&list('m','awards')}
${k==='f'&&html`<div class="space-y-4"><div><h2 class="font-bold mb-2 gold">Fair Play Table (lower is better · 🟨=1 🟥=3)</h2><div class="card divide-y divide-[var(--ln)]">${fp.map((x,i)=>html`<div key=${x.t.id} class="flex items-center gap-3 p-3 text-sm"><div class="w-6 text-center mu font-bold">${i+1}</div><div class="flex-1 font-semibold">${x.t.name}</div><div>🟨 ${x.y}</div><div>🟥 ${x.r}</div><div class="w-10 text-right font-black gold">${x.pts}</div></div>`)}</div></div>
<div><h2 class="font-bold mb-2 gold">Most Carded Players</h2>${(()=>{const r=ps.filter(x=>x.y+x.r>0).sort((a,b)=>(b.y+3*b.r)-(a.y+3*a.r)).slice(0,10);return r.length?html`<div class="card divide-y divide-[var(--ln)]">${r.map(x=>html`<div key=${x.p.id} class="flex items-center gap-3 p-3 text-sm"><div class="flex-1"><div class="font-semibold">${x.p.name}</div><div class="text-xs mu">${x.t.name}</div></div><div>🟨 ${x.y}</div><div>🟥 ${x.r}</div></div>`)}</div>`:html`<div class="mu text-sm">No cards yet.</div>`})()}</div></div>`}</div>`}

function Teams(){const[sel,setSel]=useState(null),[w,setW]=useState('all');const wards=[...new Set(DB.teams.map(t=>t.ward))];
const t=DB.teams.find(x=>x.id===sel);
if(t){const ps=pstats().filter(x=>x.t.id===t.id);const ms=sortM(DB.matches.filter(m=>m.home===t.id||m.away===t.id));const row=standings(DB.teams.filter(x=>x.ward===t.ward),DB.matches.filter(m=>m.stage==='ward')).find(r=>r.t.id===t.id);
return html`<div class="space-y-4"><button class="btn2" onClick=${()=>setSel(null)}>← All teams</button>
<div class="card p-5"><h2 class="text-2xl font-black gold">${t.name}</h2><div class="text-sm mu">${t.ward} · Coach: ${t.coach}</div>
<div class="flex items-center gap-2 mt-3"><span class="text-xs mu">Form</span>${formOf(t.id).map((r,i)=>html`<${Chip} key=${i} r=${r}/>`)}${!formOf(t.id).length&&html`<span class="text-xs mu">No matches yet</span>`}</div>
${row&&html`<div class="text-sm mt-3">Ward position: <b>P${row.p} · ${row.pts} pts · GD ${row.gd}</b></div>`}</div>
<div><h3 class="font-bold mb-2 gold">Squad</h3><div class="card overflow-x-auto"><table class="w-full text-sm"><thead class="mu text-xs"><tr><th class="p-2">#</th><th class="p-2 text-left">Player</th><th class="p-2">Pos</th><th class="p-2">⚽</th><th class="p-2">🅰️</th><th class="p-2">🟨</th><th class="p-2">🟥</th><th class="p-2">⭐</th></tr></thead><tbody>${ps.map(x=>html`<tr key=${x.p.id} class="border-t border-[var(--ln)] text-center"><td class="p-2">${x.p.no}</td><td class="p-2 text-left font-semibold whitespace-nowrap">${x.p.name}</td><td class="p-2 mu">${x.p.pos}</td><td class="p-2">${x.g}</td><td class="p-2">${x.a}</td><td class="p-2">${x.y}</td><td class="p-2">${x.r}</td><td class="p-2">${x.m}</td></tr>`)}</tbody></table></div>${!ps.length&&html`<div class="mu text-sm mt-2">No players registered. Add them in Admin.</div>`}</div>
<div><h3 class="font-bold mb-2 gold">Matches</h3><div class="grid md:grid-cols-2 gap-3">${ms.map(m=>html`<${MatchCard} key=${m.id} m=${m}/>`)}</div></div></div>`}
return html`<div class="space-y-3"><${Pills} v=${w} set=${setW} items=${[['all','All wards'],...wards.map(x=>[x,x])]}/>
<div class="grid sm:grid-cols-2 md:grid-cols-3 gap-3">${DB.teams.filter(t=>w==='all'||t.ward===w).map(t=>html`<button key=${t.id} class="card p-4 text-left hover:border-[var(--gold)]" onClick=${()=>setSel(t.id)}><div class="font-bold">${t.name}</div><div class="text-xs mu">${t.ward} · ${t.players.length} players</div><div class="flex gap-1 mt-2">${formOf(t.id).map((r,i)=>html`<${Chip} key=${i} r=${r}/>`)}</div></button>`)}</div></div>`}

function Admin({upd,setDb}){const[sec,setSec]=useState('t');
return html`<div class="space-y-4"><${Pills} v=${sec} set=${setSec} items=${[['t','Teams & Players'],['m','Schedule'],['r','Results & Stats'],['n','News'],['d','Data']]}/>
<div class="text-xs mu">Admin tools are open on this device; all changes save to this browser’s local storage.</div>
${sec==='t'&&html`<${AdminTeams} upd=${upd}/>`}${sec==='m'&&html`<${AdminSchedule} upd=${upd}/>`}${sec==='r'&&html`<${AdminResults} upd=${upd}/>`}${sec==='n'&&html`<${AdminNews} upd=${upd}/>`}${sec==='d'&&html`<${AdminData} upd=${upd} setDb=${setDb}/>`}</div>`}
function AdminTeams({upd}){const[f,b,rs]=useF({name:'',ward:'',coach:''});const[p,pb,prs]=useF({team:'',name:'',pos:'MF',no:''});const wards=[...new Set(DB.teams.map(t=>t.ward))];
return html`<div class="grid md:grid-cols-2 gap-4">
<form class="card p-4 space-y-2" onSubmit=${e=>{e.preventDefault();if(!f.name.trim()||!f.ward.trim())return;upd(d=>{d.teams.push({id:uid(),name:f.name.trim(),ward:f.ward.trim(),coach:f.coach.trim()||'TBA',players:[]})});rs()}}>
<h3 class="font-bold gold">Register Team</h3><${Form} l="Team name"><input class="in" value=${f.name} onChange=${b('name')}/><//><${Form} l="Ward"><input class="in" list="wl" value=${f.ward} onChange=${b('ward')}/><//><datalist id="wl">${wards.map(w=>html`<option key=${w} value=${w}/>`)}</datalist><${Form} l="Coach"><input class="in" value=${f.coach} onChange=${b('coach')}/><//><button class="btn">Add team</button></form>
<form class="card p-4 space-y-2" onSubmit=${e=>{e.preventDefault();const tid=p.team||(DB.teams[0]||{}).id;if(!p.name.trim()||!tid)return;upd(d=>{const t=d.teams.find(x=>x.id===tid);t.players.push({id:uid(),name:p.name.trim(),pos:p.pos,no:+p.no||t.players.length+1})});prs()}}>
<h3 class="font-bold gold">Add Player</h3><${Form} l="Team"><select class="in" value=${p.team||(DB.teams[0]||{}).id} onChange=${pb('team')}>${DB.teams.map(t=>html`<option key=${t.id} value=${t.id}>${t.name} (${t.ward})</option>`)}</select><//><${Form} l="Player name"><input class="in" value=${p.name} onChange=${pb('name')}/><//>
<div class="grid grid-cols-2 gap-2"><${Form} l="Position"><select class="in" value=${p.pos} onChange=${pb('pos')}>${['GK','DF','MF','FW'].map(x=>html`<option key=${x}>${x}</option>`)}</select><//><${Form} l="Shirt no."><input type="number" class="in" value=${p.no} onChange=${pb('no')}/><//></div><button class="btn">Add player</button></form></div>`}
function AdminSchedule({upd}){const[f,b,rs]=useF({stage:'ward',round:'Group',home:'',away:'',date:'2026-11-12',time:'15:00',venue:'Legetio Grounds'});const T=DB.teams;const h=f.home||(T[0]||{}).id,a=f.away||(T[1]||{}).id;
const opts=T.map(t=>html`<option key=${t.id} value=${t.id}>${t.name}</option>`);
return html`<form class="card p-4 grid sm:grid-cols-2 gap-3 max-w-2xl" onSubmit=${e=>{e.preventDefault();if(!h||!a||h===a)return alert('Pick two different teams');upd(d=>{d.matches.push({id:uid(),stage:f.stage,ward:f.stage==='ward'?(d.teams.find(t=>t.id===h)||{}).ward:null,round:f.round||'Group',date:f.date,time:f.time,venue:f.venue,home:h,away:a,hs:null,as:null,status:'Upcoming',events:[],motm:null})});rs()}}>
<h3 class="font-bold gold sm:col-span-2">Schedule Match</h3>
<${Form} l="Stage"><select class="in" value=${f.stage} onChange=${b('stage')}><option value="ward">Stage 1 · Ward</option><option value="main">Stage 2 · Main</option></select><//><${Form} l="Round (Group, Semi-final, Final…)"><input class="in" value=${f.round} onChange=${b('round')}/><//>
<${Form} l="Home"><select class="in" value=${h} onChange=${b('home')}>${opts}</select><//><${Form} l="Away"><select class="in" value=${a} onChange=${b('away')}>${opts}</select><//>
<${Form} l="Date"><input type="date" class="in" value=${f.date} onChange=${b('date')}/><//><${Form} l="Time"><input type="time" class="in" value=${f.time} onChange=${b('time')}/><//>
<div class="sm:col-span-2"><${Form} l="Venue"><input class="in" value=${f.venue} onChange=${b('venue')}/><//></div><button class="btn sm:col-span-2">Add to fixtures</button></form>`}
function AdminResults({upd}){const ms=sortM(DB.matches);const[sel,setSel]=useState('');const[ev,eb]=useF({type:'goal',side:'home',player:'',min:''});
const m=DB.matches.find(x=>x.id===sel)||ms[0];if(!m)return html`<div class="mu">Schedule a match first.</div>`;
const set=(k,v)=>upd(d=>{d.matches.find(x=>x.id===m.id)[k]=v});const tid=ev.side==='home'?m.home:m.away;const pl=(DB.teams.find(t=>t.id===tid)||{players:[]}).players;
const both=[...(DB.teams.find(t=>t.id===m.home)||{players:[]}).players,...(DB.teams.find(t=>t.id===m.away)||{players:[]}).players];
const add=e=>{e.preventDefault();const pid=ev.player&&pl.some(p=>p.id===ev.player)?ev.player:(pl[0]||{}).id;if(!pid)return;
upd(d=>{const x=d.matches.find(y=>y.id===m.id);x.events.push({id:uid(),type:ev.type,team:tid,player:pid,min:+ev.min||1});if(ev.type==='goal'){x.hs=x.hs||0;x.as=x.as||0;tid===x.home?x.hs++:x.as++;if(x.status==='Upcoming')x.status='Live'}})};
return html`<div class="space-y-3 max-w-2xl"><${Form} l="Select match"><select class="in" value=${m.id} onChange=${e=>setSel(e.target.value)}>${ms.map(x=>html`<option key=${x.id} value=${x.id}>${x.date} · ${tn(x.home)} v ${tn(x.away)} (${x.status})</option>`)}</select><//>
<div class="card p-4 space-y-3"><div class="grid grid-cols-3 gap-2 items-end"><${Form} l=${tn(m.home)}><input type="number" min="0" class="in" value=${m.hs===null?'':m.hs} onChange=${e=>set('hs',+e.target.value)}/><//><${Form} l=${tn(m.away)}><input type="number" min="0" class="in" value=${m.as===null?'':m.as} onChange=${e=>set('as',+e.target.value)}/><//><${Form} l="Status"><select class="in" value=${m.status} onChange=${e=>set('status',e.target.value)}><option>Upcoming</option><option>Live</option><option>FT</option></select><//></div>
<${Form} l="Man of the Match"><select class="in" value=${m.motm||''} onChange=${e=>set('motm',e.target.value||null)}><option value="">— none —</option>${both.map(p=>html`<option key=${p.id} value=${p.id}>${p.name}</option>`)}</select><//></div>
<form class="card p-4 grid grid-cols-2 gap-2" onSubmit=${add}><h3 class="font-bold gold col-span-2">Record Player Stat</h3>
<${Form} l="Type"><select class="in" value=${ev.type} onChange=${eb('type')}><option value="goal">⚽ Goal (auto-updates score)</option><option value="assist">🅰️ Assist</option><option value="yellow">🟨 Yellow card</option><option value="red">🟥 Red card</option></select><//>
<${Form} l="Side"><select class="in" value=${ev.side} onChange=${eb('side')}><option value="home">${tn(m.home)}</option><option value="away">${tn(m.away)}</option></select><//>
<${Form} l="Player"><select class="in" value=${pl.some(p=>p.id===ev.player)?ev.player:(pl[0]||{}).id} onChange=${eb('player')}>${pl.map(p=>html`<option key=${p.id} value=${p.id}>${p.name}</option>`)}</select><//><${Form} l="Minute"><input type="number" class="in" value=${ev.min} onChange=${eb('min')}/><//><button class="btn col-span-2">Add event</button></form>
<div class="card divide-y divide-[var(--ln)] text-sm">${m.events.map(e=>html`<div key=${e.id} class="flex items-center p-2 gap-2"><span class="flex-1">${e.min}' ${EI[e.type]} ${pn(e.player)} <span class="mu">(${tn(e.team)})</span></span><button class="btn2" onClick=${()=>upd(d=>{const x=d.matches.find(y=>y.id===m.id);x.events=x.events.filter(y=>y.id!==e.id);if(e.type==='goal')e.team===x.home?x.hs=Math.max(0,x.hs-1):x.as=Math.max(0,x.as-1)})}>✕</button></div>`)}${!m.events.length&&html`<div class="p-3 mu">No events yet.</div>`}</div>
<button class="btn2" onClick=${()=>{if(confirm('Delete this match?')){upd(d=>{d.matches=d.matches.filter(x=>x.id!==m.id)});setSel('')}}}>Delete match</button></div>`}
function AdminNews({upd}){const[t,setT]=useState('');
return html`<div class="max-w-2xl space-y-3"><form class="card p-4 space-y-2" onSubmit=${e=>{e.preventDefault();if(!t.trim())return;upd(d=>{d.news.push({id:uid(),text:t.trim(),date:new Date().toISOString().slice(0,10)})});setT('')}}><${Form} l="Announcement"><textarea class="in" rows="3" value=${t} onChange=${e=>setT(e.target.value)}></textarea><//><button class="btn">Publish</button></form>
${DB.news.slice().reverse().map(n=>html`<div key=${n.id} class="card p-3 text-sm flex gap-2"><span class="flex-1">${n.text}</span><button class="btn2" onClick=${()=>upd(d=>{d.news=d.news.filter(x=>x.id!==n.id)})}>✕</button></div>`)}</div>`}
function AdminData({upd,setDb}){const[txt,setTxt]=useState('');
const gen=()=>{const q=qualified(DB.teams,DB.matches);const g=[...new Set(q.map(x=>x.t.ward))].map(w=>q.filter(x=>x.t.ward===w));const pairs=[];
g.forEach((x,i)=>{const nx=g[(i+1)%g.length];if(x[0]&&nx[1]&&x[0].t.id!==nx[1].t.id)pairs.push([x[0].t,nx[1].t])});
if(!pairs.length)return alert('No qualifiers yet — finish some ward matches first.');
const rd=pairs.length===1?'Final':pairs.length===2?'Semi-final':pairs.length===4?'Quarter-final':'Round of '+pairs.length*2;
const last=DB.matches.reduce((a,m)=>m.date>a?m.date:a,'2026-11-01');const dt=new Date(Date.parse(last)+864e5).toISOString().slice(0,10);
upd(d=>{pairs.forEach(([a,b],i)=>d.matches.push({id:uid(),stage:'main',ward:null,round:rd,date:dt,time:['10:00','13:00','15:30','17:00'][i%4],venue:'Legetio Main Ground',home:a.id,away:b.id,hs:null,as:null,status:'Upcoming',events:[],motm:null}))})};
return html`<div class="max-w-2xl space-y-3"><div class="card p-4 space-y-2"><h3 class="font-bold gold">Stage 2 Draw</h3><p class="text-sm mu">Pairs each ward winner against another ward’s runner-up.</p><button class="btn" onClick=${gen}>Generate main fixtures</button></div>
<div class="card p-4 space-y-2"><h3 class="font-bold gold">Backup & Restore</h3><button class="btn2" onClick=${()=>{setTxt(JSON.stringify(DB));try{navigator.clipboard.writeText(JSON.stringify(DB))}catch(e){}}}>Export JSON (copies)</button><textarea class="in" rows="4" value=${txt} onChange=${e=>setTxt(e.target.value)} placeholder="Paste JSON to import"></textarea><button class="btn2" onClick=${()=>{try{const j=JSON.parse(txt);if(!j.teams||!j.matches)throw 0;setDb({news:[],...j})}catch(e){alert('Invalid data')}}}>Import JSON</button></div>
<div class="card p-4 space-x-2"><button class="btn2" onClick=${()=>confirm('Reset to demo data?')&&setDb(seed())}>Reset to demo data</button><button class="btn2" onClick=${()=>confirm('Erase everything?')&&setDb({teams:[],matches:[],news:[]})}>Clear all</button></div></div>`}

const TABS=[['home','Home'],['fixtures','Fixtures'],['tables','Tables'],['stats','Stats'],['teams','Teams'],['admin','Admin']];
function App(){const[db,setDb]=useState(load);DB=db;const[tab,setTab]=useState(()=>TABS.some(t=>t[0]===location.hash.slice(1))?location.hash.slice(1):'home');
useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}},[db]);
const upd=fn=>setDb(d=>{const c=structuredClone(d);fn(c);return c});
const go=t=>{setTab(t);history.replaceState(null,'','#'+t);window.scrollTo(0,0)};
return html`<div class="min-h-screen"><header class="sticky z-20 border-b border-[var(--ln)] bg-[var(--bg)]" style=${{top:'env(safe-area-inset-top,0px)'}}><div class="max-w-5xl mx-auto px-3 py-2 flex items-center gap-3"><div class="font-black text-sm leading-tight shrink-0">⚽ <span class="gold">LEGETIO</span><span class="hidden sm:inline"> YOUTH TOURNAMENT</span></div><nav class="flex gap-1 overflow-x-auto">${TABS.map(([k,l])=>html`<button key=${k} class=${'pill '+(tab===k?'on':'')} onClick=${()=>go(k)}>${l}</button>`)}</nav></div></header>
<main class="max-w-5xl mx-auto px-3 py-4">${tab==='home'&&html`<${Home} go=${go}/>`}${tab==='fixtures'&&html`<${Fixtures}/>`}${tab==='tables'&&html`<${Tables}/>`}${tab==='stats'&&html`<${Stats}/>`}${tab==='teams'&&html`<${Teams}/>`}${tab==='admin'&&html`<${Admin} upd=${upd} setDb=${setDb}/>`}</main>
<footer class="text-center text-xs mu py-6">Legetio Youth Tournament · data saved locally on this device</footer></div>`}
createRoot(document.getElementById('root')).render(createElement(App));

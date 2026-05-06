// ロト7 AI分析アプリ フロントエンド制御
const charts = {};
let latestWheeling = [];

function showSpinner(on=true){ document.getElementById('globalSpinner').classList.toggle('d-none', !on); }
async function fetchJson(url, options={}){
  const res = await fetch(url, options);
  const data = await res.json();
  if(!res.ok) throw new Error(data.error || 'APIエラー');
  return data;
}
function ball(n, cls=''){ return `<span class="ball ${cls}">${n}</span>`; }
function money(n){ return new Intl.NumberFormat('ja-JP',{style:'currency',currency:'JPY'}).format(n); }
function destroyChart(id){ if(charts[id]){ charts[id].destroy(); delete charts[id]; } }
function barChart(id, labels, data, label, colors=null){
  destroyChart(id);
  charts[id] = new Chart(document.getElementById(id), { type:'bar', data:{labels, datasets:[{label, data, backgroundColor: colors || undefined}]}, options:{responsive:true, plugins:{legend:{labels:{color:'#dbeafe'}}}, scales:{x:{ticks:{color:'#cbd5e1'}}, y:{ticks:{color:'#cbd5e1'}, beginAtZero:true}}} });
}
function lineChart(id, labels, data, label){
  destroyChart(id);
  charts[id] = new Chart(document.getElementById(id), { type:'line', data:{labels, datasets:[{label, data, tension:.25, fill:false}]}, options:{responsive:true, plugins:{legend:{labels:{color:'#dbeafe'}}}, scales:{x:{ticks:{color:'#cbd5e1'}}, y:{ticks:{color:'#cbd5e1'}}}} });
}

async function loadStatus(){
  const s = await fetchJson('/api/status');
  document.getElementById('statusText').textContent = s.status || '-';
  document.getElementById('updatedAt').textContent = s.updated_at || '-';
  document.getElementById('rowsCount').textContent = s.rows || '-';
  document.getElementById('sourceText').textContent = s.source || '-';
  const eb = document.getElementById('errorBox');
  if(s.error){ eb.textContent = '補足: ' + s.error; eb.classList.remove('d-none'); } else { eb.classList.add('d-none'); }
}

async function loadBasic(){
  const d = await fetchJson('/api/basic');
  const labels = d.frequency.map(x=>x.number);
  const colors = d.frequency.map(x=>x.type==='hot'?'#ff8a00':(x.type==='cold'?'#0288d1':'#6c7a93'));
  barChart('freqChart', labels, d.frequency.map(x=>x.count), '出現回数', colors);
  document.getElementById('pairHeatmap').innerHTML = d.top_pairs.map((p,i)=>`<div class="heat-cell" style="background:rgba(255,176,0,${0.12+0.06*(10-i)})"><div>${ball(p.a)} ${ball(p.b)}</div><strong>${p.count}回</strong></div>`).join('');
  const bins = {};
  d.sum_distribution.forEach(s=>{ const k = Math.floor(s/10)*10; bins[k]=(bins[k]||0)+1; });
  barChart('sumChart', Object.keys(bins), Object.values(bins), '合計値分布');
  barChart('oddEvenChart', d.odd_even.map(x=>x.pattern), d.odd_even.map(x=>x.count), '回数');
  function renderPosition(){ const key=document.getElementById('positionSelect').value; barChart('positionChart', d.position[key].map(x=>x.number), d.position[key].map(x=>x.count), key+' 出現回数'); }
  document.getElementById('positionSelect').onchange = renderPosition; renderPosition();
  document.getElementById('skipList').innerHTML = d.skips.sort((a,b)=>b.skip-a.skip).map(x=>`<div class="skip-item">${ball(x.number)} <b>${x.skip}</b>回未出現<br><small>累計 ${x.count}回</small></div>`).join('');
  document.getElementById('recentTable').innerHTML = `<table class="table table-dark table-dark-custom align-middle"><thead><tr><th>抽選回</th><th>抽選日</th><th>本数字</th><th>ボーナス</th></tr></thead><tbody>${d.recent_table.map(r=>`<tr><td>${r.round}</td><td>${r.date}</td><td>${r.numbers.map(n=>ball(n)).join('')}</td><td>${r.bonus.map(n=>ball(n,'bonus')).join('')}</td></tr>`).join('')}</tbody></table>`;
}

async function loadAdvanced(){
  const d = await fetchJson('/api/advanced');
  barChart('deltaChart', ['Δ1','Δ2','Δ3','Δ4','Δ5','Δ6'], d.avg_delta, '平均差分');
  lineChart('fftChart', d.fft.map((_,i)=>i), d.fft, '周波数成分');
  barChart('entropyChart', d.entropy.map(x=>x.number), d.entropy.map(x=>x.entropy), 'エントロピー');
  destroyChart('chaosChart');
  charts.chaosChart = new Chart(document.getElementById('chaosChart'), { type:'scatter', data:{datasets:[{label:'正規化合計値 t→t+1', data:d.chaos}]}, options:{scales:{x:{ticks:{color:'#cbd5e1'}}, y:{ticks:{color:'#cbd5e1'}}}, plugins:{legend:{labels:{color:'#dbeafe'}}}} });
  drawNetwork(d.network);
}

function drawNetwork(net){
  const canvas = document.getElementById('networkCanvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.clientWidth * devicePixelRatio;
  const h = canvas.height = 460 * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.clearRect(0,0,w,h);
  const centerX = canvas.clientWidth/2, centerY = 230;
  const nodes = net.nodes.map((n,i)=>({ ...n, x:centerX + Math.cos(i/net.nodes.length*2*Math.PI)*180, y:centerY + Math.sin(i/net.nodes.length*2*Math.PI)*160 }));
  const byId = Object.fromEntries(nodes.map(n=>[n.id,n]));
  ctx.lineWidth = 1;
  net.edges.slice(0,80).forEach(e=>{ const a=byId[e.source], b=byId[e.target]; if(!a||!b)return; ctx.strokeStyle=`rgba(255,176,0,${Math.min(.45,.05+e.weight/40)})`; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); });
  nodes.forEach(n=>{ const r=9+n.centrality*80; ctx.beginPath(); ctx.fillStyle = n.centrality>.35 ? '#ff8a00' : '#58a6ff'; ctx.arc(n.x,n.y,r,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#fff'; ctx.font='bold 12px sans-serif'; ctx.textAlign='center'; ctx.fillText(n.id,n.x,n.y+4); });
}

async function loadAI(){
  const d = await fetchJson('/api/ai');
  document.getElementById('aiCards').innerHTML = d.predictions.map(r=>`<div class="col-md-6 col-xl-4"><div class="ticket h-100"><h6 class="fw-bold">${r.model}</h6><div>${r.numbers.map(n=>ball(n)).join('')}</div><div class="small text-secondary mt-2">予測スコア ${r.score}% / 精度スコア ${r.accuracy}%</div></div></div>`).join('');
  barChart('aiScoreChart', d.predictions.map(x=>x.model), d.predictions.map(x=>x.score), '予測スコア');
}

async function loadSimulation(){
  const d = await fetchJson('/api/simulation');
  latestWheeling = d.wheeling;
  document.getElementById('wheelingList').innerHTML = latestWheeling.map((t,i)=>`<div class="ticket"><b>#${i+1}</b> ${t.map(n=>ball(n)).join('')}</div>`).join('');
  barChart('markovProbChart', d.markov.map(x=>x.number), d.markov.map(x=>x.prob), '次回相対確率');
}

async function startMonteCarlo(){
  document.getElementById('mcStatus').textContent = 'バックグラウンド計算中...';
  const start = await fetchJson('/api/montecarlo/start', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({draws:1000000})});
  const timer = setInterval(async ()=>{
    const t = await fetchJson('/api/task/'+start.task_id);
    if(t.status==='done'){
      clearInterval(timer);
      document.getElementById('mcStatus').textContent = `${t.result.draws.toLocaleString()}回の仮想抽選が完了しました。`;
      barChart('mcChart', t.result.number_probs.map(x=>x.number), t.result.number_probs.map(x=>x.prob), '出現確率');
    } else if(t.status==='error') { clearInterval(timer); document.getElementById('mcStatus').textContent = 'エラー: '+t.error; }
  }, 1200);
}

async function runHit(tickets){
  const d = await fetchJson('/api/hit', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({tickets})});
  document.getElementById('hitResult').innerHTML = `<div class="row g-3"><div class="col-md-3"><div class="metric-card"><span>購入回数</span><strong>${d.purchase_count.toLocaleString()}口</strong></div></div><div class="col-md-3"><div class="metric-card"><span>投資額</span><strong>${money(d.investment)}</strong></div></div><div class="col-md-3"><div class="metric-card"><span>概算当選額</span><strong>${money(d.estimated_prize)}</strong></div></div><div class="col-md-3"><div class="metric-card"><span>収支</span><strong>${money(d.balance)}</strong></div></div></div><h6 class="mt-3">等級別回数</h6><pre class="bg-black p-3 rounded">${JSON.stringify(d.counts,null,2)}</pre>`;
}

async function init(){
  try{ showSpinner(true); await loadStatus(); await loadBasic(); await loadAdvanced(); await loadAI(); await loadSimulation(); }
  catch(e){ alert('読み込みエラー: '+e.message); }
  finally{ showSpinner(false); }
}

document.getElementById('updateBtn').onclick = async()=>{ try{ showSpinner(true); await fetchJson('/api/update',{method:'POST'}); await init(); }catch(e){alert(e.message)}finally{showSpinner(false);} };
document.getElementById('mcBtn').onclick = startMonteCarlo;
document.getElementById('hitBtn').onclick = ()=>{ const nums=document.getElementById('ticketInput').value.split(/[ ,、]+/).map(Number).filter(Boolean); runHit([nums]); };
document.getElementById('hitWheelBtn').onclick = ()=>{ if(!latestWheeling.length){ alert('先にホイーリングを生成してください'); return; } runHit(latestWheeling); };
window.addEventListener('resize', ()=>{ fetchJson('/api/advanced').then(d=>drawNetwork(d.network)).catch(()=>{}); });
init();

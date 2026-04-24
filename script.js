/* ══════════════════════════════════════════════════
   JADWAL — 5 HARI SEKALI, mulai 25 Apr 2025
   Sistem berulang otomatis setiap 30 hari (6 giliran × 5 hari)
══════════════════════════════════════════════════ */

const GROUPS = [
  {
    persons: ['Jufri', 'Ardi'],
    photos:  ['https://i.imgur.com/YPuXfjB.png', 'https://i.imgur.com/YPuXfjB.png'],
  },
  {
    persons: ['Reonaldo', 'Agus'],
    photos:  ['https://i.imgur.com/sDDUjZQ.png', 'https://i.imgur.com/sDDUjZQ.png'],
  },
  {
    persons: ['Farizi', 'Yope Musang'],
    photos:  ['https://i.imgur.com/JADPNwJ.png', 'https://i.imgur.com/JADPNwJ.png'],
  },
  {
    persons: ['Hasan', 'Geo'],
    photos:  ['https://i.imgur.com/em5Nyuy.png', 'https://i.imgur.com/em5Nyuy.png'],
  },
  {
    persons: ['Aksan', 'Chandra'],
    photos:  ['https://i.imgur.com/sDDUjZQ.png', 'https://i.imgur.com/sDDUjZQ.png'],
  },
  {
    persons: ['Imanuel', 'Dandi'],
    photos:  ['https://i.imgur.com/JADPNwJ.png', 'https://i.imgur.com/JADPNwJ.png'],
  },
];

/* Anchor: tanggal 25 April 2026 = grup index 0 */
const ANCHOR = new Date('2026-04-25');
ANCHOR.setHours(0,0,0,0);
const CYCLE_DAYS = 5;
const CYCLE_TOTAL = GROUPS.length * CYCLE_DAYS; /* 30 hari */

/* Hitung grup untuk tanggal tertentu */
function getGroupForDate(date) {
  const d = new Date(date); d.setHours(0,0,0,0);
  const diff = Math.round((d - ANCHOR) / 86400000);
  if (diff < 0) return null; /* sebelum jadwal dimulai */
  /* hanya hari pertama setiap periode (kelipatan 5) */
  if (diff % CYCLE_DAYS !== 0) return null;
  const groupIdx = Math.floor(diff / CYCLE_DAYS) % GROUPS.length;
  return GROUPS[groupIdx];
}

/* semua anggota */
const ALL_MEMBERS = GROUPS.flatMap(g => g.persons.map((p,i)=>({name:p,photo:g.photos[i]})));

/* ──────────────────────────────────────────
   SLIDER (2 detik)
────────────────────────────────────────── */
(function(){
  const TOTAL=7, INTERVAL=2000;
  const track=document.getElementById('sliderTrack');
  const dots=document.getElementById('sDots');
  const ctr=document.getElementById('sCtr');
  const bar=document.getElementById('sBar');
  let cur=0,timer=null,raf=null,t0=null;

  for(let i=0;i<TOTAL;i++){
    const d=document.createElement('button');
    d.className='dot'+(i===0?' active':'');
    d.onclick=()=>goTo(i,true);
    dots.appendChild(d);
  }

  function ui(){
    track.style.transform=`translateX(-${cur*100}%)`;
    ctr.textContent=`${cur+1} / ${TOTAL}`;
    dots.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('active',i===cur));
  }

  function goTo(i,m){ cur=(i+TOTAL)%TOTAL; ui(); if(m)reset(); }

  function prog(){
    cancelAnimationFrame(raf);
    bar.style.transition='none'; bar.style.width='0%';
    t0=performance.now();
    function step(now){
      const p=Math.min(((now-t0)/INTERVAL)*100,100);
      bar.style.width=p+'%';
      if(p<100) raf=requestAnimationFrame(step);
    }
    raf=requestAnimationFrame(step);
  }

  function start(){ clearInterval(timer); prog(); timer=setInterval(()=>{ cur=(cur+1)%TOTAL; ui(); prog(); },INTERVAL); }
  function reset(){ clearInterval(timer); cancelAnimationFrame(raf); start(); }

  document.getElementById('sPrev').onclick=()=>goTo(cur-1,true);
  document.getElementById('sNext').onclick=()=>goTo(cur+1,true);

  let tx=null;
  const w=document.getElementById('sliderWrap');
  w.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;},{passive:true});
  w.addEventListener('touchend',e=>{
    if(tx===null)return;
    const d=tx-e.changedTouches[0].clientX;
    if(Math.abs(d)>40)goTo(d>0?cur+1:cur-1,true);
    tx=null;
  });
  w.onmouseenter=()=>{clearInterval(timer);cancelAnimationFrame(raf);};
  w.onmouseleave=start;
  ui(); start();
})();

/* ──────────────────────────────────────────
   HELPERS
────────────────────────────────────────── */
const today=new Date(); today.setHours(0,0,0,0);
let weekOffset=0;

const DAY_S=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
const DAY_F=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const MON_S=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const MON_F=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function fmtDate(d){
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

const todayKey=fmtDate(today);

/* localStorage */
const STORE='naga_hitam_v2';
let doneMap={};
function loadLocal(){ try{ doneMap=JSON.parse(localStorage.getItem(STORE))||{}; }catch{ doneMap={}; } }
function saveLocal(){ localStorage.setItem(STORE,JSON.stringify(doneMap)); }
loadLocal();

/* ──────────────────────────────────────────
   CLOCK
────────────────────────────────────────── */
function clock(){
  const n=new Date();
  document.getElementById('live-date').textContent=
    DAY_F[n.getDay()]+', '+n.getDate()+' '+MON_F[n.getMonth()]+' '+n.getFullYear();
  document.getElementById('live-time').textContent=
    String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0')+':'+String(n.getSeconds()).padStart(2,'0');
}
setInterval(clock,1000); clock();

/* ──────────────────────────────────────────
   STRIP
────────────────────────────────────────── */
function renderStrip(){
  const strip=document.getElementById('today-strip');
  const txt=document.getElementById('strip-text');
  strip.className='today-strip';

  if(today.getDay()===0){
    strip.classList.add('holiday');
    txt.textContent='Hari ini Minggu — Libur piket! 🎉';
    return;
  }

  const grp=getGroupForDate(today);
  const done=!!doneMap[todayKey];
  strip.classList.add('on-duty');

  if(grp){
    txt.innerHTML=done
      ? `✅ Piket <strong>${grp.persons.join(' & ')}</strong> sudah selesai!`
      : `🧹 Giliran: <strong>${grp.persons.join(' & ')}</strong> — Semangat!`;
  } else {
    /* cari jadwal terdekat berikutnya */
    let next=null;
    for(let i=1;i<=35;i++){
      const dd=new Date(today); dd.setDate(today.getDate()+i);
      const g=getGroupForDate(dd);
      if(g){ next={date:dd,group:g}; break; }
    }
    txt.innerHTML=next
      ? `📅 Piket berikutnya: <strong>${next.group.persons.join(' & ')}</strong> (${next.date.getDate()} ${MON_S[next.date.getMonth()]})`
      : `📅 Tidak ada jadwal hari ini`;
  }
}

/* ──────────────────────────────────────────
   WEEK DATES
────────────────────────────────────────── */
function getWeekDates(){
  const dow=today.getDay()===0?6:today.getDay()-1;
  const mon=new Date(today);
  mon.setDate(today.getDate()-dow+weekOffset*7);
  return Array.from({length:7},(_,i)=>{
    const d=new Date(mon); d.setDate(mon.getDate()+i); return d;
  });
}

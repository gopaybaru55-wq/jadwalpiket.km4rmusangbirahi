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

const ANCHOR = new Date('2026-04-25');
ANCHOR.setHours(0,0,0,0);
const CYCLE_DAYS = 5;
const CYCLE_TOTAL = GROUPS.length * CYCLE_DAYS;

function getGroupForDate(date) {
  const d = new Date(date); d.setHours(0,0,0,0);
  const diff = Math.round((d - ANCHOR) / 86400000);
  if (diff < 0) return null;
  if (diff % CYCLE_DAYS !== 0) return null;
  const groupIdx = Math.floor(diff / CYCLE_DAYS) % GROUPS.length;
  return GROUPS[groupIdx];
}

const ALL_MEMBERS = GROUPS.flatMap(g => g.persons.map((p,i)=>({name:p,photo:g.photos[i]})));

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

const STORE='naga_hitam_v2';
let doneMap={};
function loadLocal(){ try{ doneMap=JSON.parse(localStorage.getItem(STORE))||{}; }catch{ doneMap={}; } }
function saveLocal(){ localStorage.setItem(STORE,JSON.stringify(doneMap)); }
loadLocal();

/* CLOCK */
function clock(){
  const n=new Date();
  document.getElementById('live-date').textContent=
    DAY_F[n.getDay()]+', '+n.getDate()+' '+MON_F[n.getMonth()]+' '+n.getFullYear();
  document.getElementById('live-time').textContent=
    String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0')+':'+String(n.getSeconds()).padStart(2,'0');
}
setInterval(clock,1000); clock();

/* STRIP */
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
    txt.innerHTML=`📅 Tidak ada jadwal hari ini`;
  }
}

/* SCHEDULE */
function getWeekDates(){
  const dow=today.getDay()===0?6:today.getDay()-1;
  const mon=new Date(today);
  mon.setDate(today.getDate()-dow+weekOffset*7);
  return Array.from({length:7},(_,i)=>{
    const d=new Date(mon); d.setDate(mon.getDate()+i); return d;
  });
}

function renderSchedule(){
  const grid=document.getElementById('sched');
  const dates=getWeekDates();

  let html='';

  dates.forEach((date,idx)=>{
    const dkey=fmtDate(date);
    const isSun=date.getDay()===0;
    const isToday=dkey===todayKey;
    const done=!!doneMap[dkey];
    const grp=getGroupForDate(date);

    let cls='day-card';
    if(isToday) cls+=' is-today live';
    else if(done) cls+=' done-card';
    else cls+=' upcoming';
    if(isSun) cls+=' is-sunday';

    let body='';

    if(isSun){
      body=`<div class="holiday-pill">🔴 Libur — Minggu</div>`;
    } else if(grp){
      const chips=grp.persons.map((p,i)=>`
        <div class="person-chip">
          <div class="avatar-sm ${done?'done-av':''}">
            <img src="${grp.photos[i]}" alt="${p}">
          </div>
          <span class="person-nm">${p}</span>
        </div>`).join('');

      body=`
        <div class="persons-row">
          <div class="persons-list">${chips}</div>
          <div class="done-wrap">
            <input class="done-toggle" type="checkbox" data-dk="${dkey}" ${done?'checked':''}>
          </div>
        </div>`;
    } else {
      body=`<div class="no-sched">Tidak ada jadwal piket hari ini</div>`;
    }

    html+=`<div class="${cls}"><div class="day-row"><div class="card-body">${body}</div></div></div>`;
  });

  grid.innerHTML=html;

  grid.querySelectorAll('.done-toggle').forEach(chk=>{
    chk.addEventListener('change',function(){
      const dk=this.dataset.dk;
      if(this.checked) doneMap[dk]=true;
      else delete doneMap[dk];
      saveLocal();
      renderSchedule();
      renderStrip();
    });
  });
}

/* INIT */
renderStrip();
renderSchedule();

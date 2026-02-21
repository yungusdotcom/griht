import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { supabase } from "./supabase.js";

const P = {
  bg: "#F0EDE8", card: "#FFFFFF", card2: "#E6E2DC",
  bdr: "rgba(30,28,24,0.07)", bdrL: "rgba(30,28,24,0.14)",
  tx: "#1E1C18", tx2: "rgba(30,28,24,0.5)", tx3: "rgba(30,28,24,0.22)",
  acc: "#1E1C18", acc2: "#8A8478",
  cta: "#1E1C18", ctaTx: "#F0EDE8",
  ok: "#2D9F4A", warn: "#C4960E", heavy: "#D47A20", dng: "#C03030",
  ft: "'Outfit',system-ui,sans-serif",
  mn: "'JetBrains Mono',ui-monospace,monospace",
  r: 10,
};

const DB = {
  Chest:{em:"◆",muscles:["chest"],ex:[
    {n:"Barbell Bench Press",w:135,i:5,t:"barbell"},{n:"Incline Barbell Press",w:95,i:5,t:"barbell"},{n:"Dumbbell Bench Press",w:50,i:5,t:"dumbbell"},
    {n:"Incline DB Press",w:40,i:5,t:"dumbbell"},{n:"Dumbbell Flyes",w:25,i:5,t:"dumbbell"},{n:"Cable Crossover",w:30,i:5,t:"cable"},
    {n:"Pec Deck",w:100,i:10,t:"machine"},{n:"Machine Chest Press",w:100,i:10,t:"machine"},{n:"Push-Ups",w:0,i:0,t:"bw"},
    {n:"Weighted Dips (Chest)",w:0,i:10,t:"bw"},{n:"Landmine Press",w:25,i:5,t:"barbell"},
  ]},
  Back:{em:"◇",muscles:["back","lats"],ex:[
    {n:"Deadlift",w:185,i:10,t:"barbell"},{n:"Barbell Row",w:135,i:5,t:"barbell"},{n:"T-Bar Row",w:90,i:10,t:"barbell"},
    {n:"Dumbbell Row",w:50,i:5,t:"dumbbell"},{n:"Seated Cable Row",w:100,i:10,t:"cable"},{n:"Lat Pulldown",w:100,i:10,t:"cable"},
    {n:"Pull-Ups",w:0,i:0,t:"bw"},{n:"Chin-Ups",w:0,i:0,t:"bw"},{n:"Face Pulls",w:40,i:5,t:"cable"},
    {n:"Rack Pulls",w:225,i:10,t:"barbell"},{n:"Hyperextensions",w:0,i:10,t:"bw"},
  ]},
  Shoulders:{em:"△",muscles:["shoulders"],ex:[
    {n:"Overhead Press",w:95,i:5,t:"barbell"},{n:"Seated DB Press",w:40,i:5,t:"dumbbell"},{n:"Arnold Press",w:35,i:5,t:"dumbbell"},
    {n:"Lateral Raises",w:15,i:5,t:"dumbbell"},{n:"Front Raises",w:15,i:5,t:"dumbbell"},{n:"Rear Delt Flyes",w:15,i:5,t:"dumbbell"},
    {n:"Upright Rows",w:65,i:5,t:"barbell"},{n:"Shrugs (BB)",w:135,i:10,t:"barbell"},{n:"Machine Shoulder Press",w:80,i:10,t:"machine"},
  ]},
  Legs:{em:"▽",muscles:["quads","hamstrings","glutes","calves"],ex:[
    {n:"Barbell Squat",w:185,i:10,t:"barbell"},{n:"Front Squat",w:135,i:10,t:"barbell"},{n:"Hack Squat",w:180,i:20,t:"machine"},
    {n:"Leg Press",w:270,i:20,t:"machine"},{n:"Bulgarian Split Squat",w:30,i:5,t:"dumbbell"},{n:"Romanian Deadlift",w:135,i:10,t:"barbell"},
    {n:"Leg Curl",w:80,i:10,t:"machine"},{n:"Leg Extension",w:100,i:10,t:"machine"},{n:"Walking Lunges",w:30,i:5,t:"dumbbell"},
    {n:"Hip Thrust",w:135,i:10,t:"barbell"},{n:"Calf Raises",w:150,i:10,t:"machine"},
  ]},
  Arms:{em:"⬡",muscles:["biceps","triceps","forearms"],ex:[
    {n:"Barbell Curl",w:65,i:5,t:"barbell"},{n:"Dumbbell Curl",w:25,i:5,t:"dumbbell"},{n:"Hammer Curl",w:25,i:5,t:"dumbbell"},
    {n:"Preacher Curl",w:50,i:5,t:"barbell"},{n:"Cable Curl",w:40,i:5,t:"cable"},{n:"Close Grip Bench",w:115,i:5,t:"barbell"},
    {n:"Skull Crushers",w:55,i:5,t:"barbell"},{n:"Tricep Pushdown",w:50,i:5,t:"cable"},{n:"Overhead Tricep Ext",w:40,i:5,t:"cable"},
    {n:"Dips (Tricep)",w:0,i:10,t:"bw"},
  ]},
  Core:{em:"○",muscles:["core"],ex:[
    {n:"Cable Crunch",w:80,i:10,t:"cable"},{n:"Hanging Leg Raise",w:0,i:0,t:"bw"},{n:"Ab Rollout",w:0,i:0,t:"bw"},
    {n:"Plank",w:0,i:0,t:"bw"},{n:"Russian Twist",w:15,i:5,t:"dumbbell"},{n:"Woodchoppers",w:30,i:5,t:"cable"},
    {n:"Pallof Press",w:30,i:5,t:"cable"},{n:"Dead Bug",w:0,i:0,t:"bw"},
  ]},
  Cardio:{em:"♡",muscles:[],ex:[
    {n:"Treadmill Run",w:0,i:0,t:"cardio"},{n:"Incline Walk",w:0,i:0,t:"cardio"},{n:"Stair Master",w:0,i:0,t:"cardio"},
    {n:"Rowing Machine",w:0,i:0,t:"cardio"},{n:"Assault Bike",w:0,i:0,t:"cardio"},{n:"Sled Push",w:90,i:20,t:"sled"},
    {n:"Farmer's Walk",w:50,i:10,t:"dumbbell"},{n:"Battle Ropes",w:0,i:0,t:"cardio"},
  ]},
};
const TB={barbell:"BB",dumbbell:"DB",cable:"CBL",machine:"MCH",bw:"BW",cardio:"CRD",sled:"SLD"};
const RH={chest:48,back:72,lats:72,shoulders:48,quads:72,hamstrings:72,glutes:72,calves:48,biceps:48,triceps:48,forearms:36,core:24};
const AM=["chest","shoulders","back","lats","biceps","triceps","forearms","core","quads","hamstrings","glutes","calves"];
const ld=async(k,uid)=>{
  if(!uid){try{const r=localStorage.getItem(k);return r?JSON.parse(r):null}catch(e){return null}}
  try{const {data}=await supabase.from("workouts").select("data").eq("id",k+"-"+uid).single();return data?.data||null}catch(e){return null}
};
const sv=async(k,d,uid)=>{
  if(!uid){try{localStorage.setItem(k,JSON.stringify(d))}catch(e){console.error(e)}return}
  try{await supabase.from("workouts").upsert({id:k+"-"+uid,user_id:uid,data:d,updated_at:new Date().toISOString()})}catch(e){console.error(e)}
};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const fD=(d)=>new Date(d).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
const fT=(d)=>new Date(d).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
const durF=(ms)=>{const m=Math.floor(ms/60000);return m<60?m+"m":Math.floor(m/60)+"h "+(m%60)+"m"};
const vF=(v)=>v>=1e6?(v/1e6).toFixed(1)+"M":v>=1000?(v/1000).toFixed(v>=1e4?0:1)+"K":String(v);

function calcStrain(wks){
  const now=Date.now(),sm={};
  AM.forEach((m)=>{sm[m]={vol:0,strain:0,hrs:null,rec:100,status:"fresh",sets:0}});
  const gm={};Object.entries(DB).forEach(([g,d])=>{gm[g]=d.muscles});
  wks.filter((w)=>new Date(w.st).getTime()>now-7*86400000).forEach((w)=>{
    const ha=(now-new Date(w.st).getTime())/3600000;
    w.exs.forEach((ex)=>{
      const ms=gm[ex.grp]||[];
      const vol=ex.sets.filter((s)=>s.dn).reduce((a,s)=>a+s.w*s.r,0);
      const sets=ex.sets.filter((s)=>s.dn).length;
      ms.forEach((m)=>{if(!sm[m])return;sm[m].vol+=vol;sm[m].sets+=sets;
        if(sm[m].hrs===null||ha<sm[m].hrs)sm[m].hrs=ha;
        const dc=Math.max(0,1-ha/(RH[m]||48)),it=Math.min(1,vol/5000+sets/8);
        sm[m].strain=Math.min(1,sm[m].strain+it*dc);
      });
    });
  });
  Object.keys(sm).forEach((m)=>{const s=sm[m];if(s.hrs!==null){
    s.rec=Math.min(100,Math.round(s.hrs/(RH[m]||48)*100));
    s.status=s.strain>0.7?"destroyed":s.strain>0.4?"heavy":s.strain>0.15?"moderate":"recovered";
  }});
  return sm;
}
const sClr=(s)=>s>0.7?P.dng:s>0.4?P.heavy:s>0.15?P.warn:P.ok;
const sClrA=(s,a)=>s>0.7?"rgba(192,48,48,"+a+")":s>0.4?"rgba(212,122,32,"+a+")":s>0.15?"rgba(196,150,14,"+a+")":"rgba(45,159,74,"+a+")";

function BodyMap({sm,sel,onSel}){
  const fl=(m)=>{const s=sm[m]?.strain||0;if(s>0.7)return "url(#gS)";if(s>0.4)return "url(#gH)";if(s>0.15)return "url(#gA)";if(s>0.05)return "url(#gF)";return "rgba(30,28,24,0.03)"};
  const st=(m)=>{const s=sm[m]?.strain||0;return sel===m?"rgba(30,28,24,0.5)":s>0.15?sClrA(s,0.3):"rgba(30,28,24,0.08)"};
  const gw=(m)=>{const s=sm[m]?.strain||0;if(sel===m)return "drop-shadow(0 0 4px rgba(30,28,24,0.2))";return s>0.15?"drop-shadow(0 0 "+Math.round(s*6)+"px "+sClrA(s,0.3)+")":"none"};
  const MP=({m,d})=>(
    <path d={d} fill={fl(m)} stroke={st(m)} strokeWidth={sel===m?1.8:0.6} strokeLinejoin="round" style={{cursor:"pointer",filter:gw(m),transition:"all 0.3s",opacity:sm[m]?.strain>0.05||sel===m?1:0.5}} onClick={()=>onSel(sel===m?null:m)} />
  );
  const defs=(
    <defs>
      <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(45,159,74,0.25)"/><stop offset="100%" stopColor="rgba(45,159,74,0.06)"/></linearGradient>
      <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(196,150,14,0.3)"/><stop offset="100%" stopColor="rgba(196,150,14,0.06)"/></linearGradient>
      <linearGradient id="gH" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(212,122,32,0.35)"/><stop offset="100%" stopColor="rgba(212,122,32,0.08)"/></linearGradient>
      <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(192,48,48,0.4)"/><stop offset="100%" stopColor="rgba(192,48,48,0.08)"/></linearGradient>
    </defs>
  );
  const wrap=(label,paths)=>(
    <div style={{textAlign:"center",flex:1}}>
      <div style={{fontSize:8,fontWeight:700,letterSpacing:4,color:P.tx3,marginBottom:6,fontFamily:P.ft}}>{label}</div>
      <svg viewBox="0 0 120 260" width="148" height="300" style={{overflow:"visible"}}>
        {defs}
        <ellipse cx="60" cy="22" rx="14" ry="17" fill="none" stroke="rgba(30,28,24,0.08)" strokeWidth="0.6"/>
        <rect x="54" y="38" width="12" height="10" fill="none" stroke="rgba(30,28,24,0.05)" strokeWidth="0.4" rx="2"/>
        {paths}
      </svg>
    </div>
  );
  return (
    <div style={{display:"flex",justifyContent:"center",gap:4,padding:"12px 0 8px"}}>
      {wrap("ANTERIOR",<>
        <MP m="shoulders" d="M30,52 Q28,48 34,46 L54,48 L54,60 L38,62 Q30,60 30,52Z"/><MP m="shoulders" d="M90,52 Q92,48 86,46 L66,48 L66,60 L82,62 Q90,60 90,52Z"/>
        <MP m="chest" d="M38,62 L54,60 L54,88 Q52,92 46,90 L38,85 Q34,78 38,62Z"/><MP m="chest" d="M82,62 L66,60 L66,88 Q68,92 74,90 L82,85 Q86,78 82,62Z"/>
        <MP m="core" d="M46,90 Q52,93 54,90 L54,130 L46,132 Q42,120 46,90Z"/><MP m="core" d="M74,90 Q68,93 66,90 L66,130 L74,132 Q78,120 74,90Z"/>
        <MP m="biceps" d="M30,64 L38,62 L38,85 L34,100 Q28,98 26,90 L28,72Z"/><MP m="biceps" d="M90,64 L82,62 L82,85 L86,100 Q92,98 94,90 L92,72Z"/>
        <MP m="forearms" d="M26,100 L34,100 L32,130 L28,136 Q22,132 24,118Z"/><MP m="forearms" d="M94,100 L86,100 L88,130 L92,136 Q98,132 96,118Z"/>
        <MP m="quads" d="M42,134 L54,132 L56,185 L48,188 Q40,175 42,134Z"/><MP m="quads" d="M78,134 L66,132 L64,185 L72,188 Q80,175 78,134Z"/>
        <MP m="calves" d="M46,194 L56,190 L55,232 L50,240 L44,236 Q42,215 46,194Z"/><MP m="calves" d="M74,194 L64,190 L65,232 L70,240 L76,236 Q78,215 74,194Z"/>
      </>)}
      {wrap("POSTERIOR",<>
        <MP m="shoulders" d="M30,52 Q28,48 34,46 L54,48 L54,60 L38,62 Q30,60 30,52Z"/><MP m="shoulders" d="M90,52 Q92,48 86,46 L66,48 L66,60 L82,62 Q90,60 90,52Z"/>
        <MP m="back" d="M38,62 L54,60 L54,80 L46,82 Q38,78 38,62Z"/><MP m="back" d="M82,62 L66,60 L66,80 L74,82 Q82,78 82,62Z"/>
        <MP m="lats" d="M38,78 L46,82 L54,80 L54,110 L48,115 Q36,105 38,78Z"/><MP m="lats" d="M82,78 L74,82 L66,80 L66,110 L72,115 Q84,105 82,78Z"/>
        <MP m="back" d="M48,115 L54,110 L54,132 L48,134 Q44,126 48,115Z"/><MP m="back" d="M72,115 L66,110 L66,132 L72,134 Q76,126 72,115Z"/>
        <MP m="triceps" d="M30,64 L38,62 L38,85 L34,100 Q28,98 26,90 L28,72Z"/><MP m="triceps" d="M90,64 L82,62 L82,85 L86,100 Q92,98 94,90 L92,72Z"/>
        <MP m="forearms" d="M26,100 L34,100 L32,130 L28,136 Q22,132 24,118Z"/><MP m="forearms" d="M94,100 L86,100 L88,130 L92,136 Q98,132 96,118Z"/>
        <MP m="glutes" d="M42,134 L54,132 L54,155 L48,158 Q40,150 42,134Z"/><MP m="glutes" d="M78,134 L66,132 L66,155 L72,158 Q80,150 78,134Z"/>
        <MP m="hamstrings" d="M42,155 L48,158 L54,155 L56,190 L48,192 Q40,180 42,155Z"/><MP m="hamstrings" d="M78,155 L72,158 L66,155 L64,190 L72,192 Q80,180 78,155Z"/>
        <MP m="calves" d="M46,194 L56,190 L55,232 L50,240 L44,236 Q42,215 46,194Z"/><MP m="calves" d="M74,194 L64,190 L65,232 L70,240 L76,236 Q78,215 74,194Z"/>
      </>)}
    </div>
  );
}

function Dash({wks,onBack}){
  const [sel,setSel]=useState(null);
  const sm=useMemo(()=>calcStrain(wks),[wks]);
  const s=sel?sm[sel]:null;
  const SL={destroyed:"Destroyed",heavy:"Heavy",moderate:"Active",recovered:"Recovered",fresh:"Fresh"};
  const wv=useMemo(()=>{const n=Date.now();return [0,1,2,3].map((w)=>{
    const st=n-(w+1)*7*86400000,en=n-w*7*86400000;
    return wks.filter((wk)=>{const t=new Date(wk.st).getTime();return t>st&&t<=en}).reduce((a,wk)=>a+wk.exs.reduce((eA,ex)=>eA+ex.sets.filter((ss)=>ss.dn).reduce((sA,s2)=>sA+s2.w*s2.r,0),0),0);
  }).reverse()},[wks]);
  const mx=Math.max(...wv,1);
  const tm=AM.filter((m)=>sm[m]?.hrs!==null);
  const avgR=tm.length?Math.round(tm.reduce((a,m)=>a+sm[m].rec,0)/tm.length):100;
  return (
    <div style={Z.vc}>
      <button style={Z.bk} onClick={onBack}>{"← Back"}</button>
      <h2 style={Z.h2}>Strain Monitor</h2>
      <p style={{fontSize:12,color:P.tx3,margin:"0 0 20px",fontWeight:400}}>7-day rolling analysis</p>
      {wks.length>0&&(
        <div style={{...Z.cd,display:"flex",alignItems:"center",gap:18,marginBottom:14,padding:18}}>
          <div style={{position:"relative",width:64,height:64,flexShrink:0}}>
            <svg viewBox="0 0 72 72" width="64" height="64"><circle cx="36" cy="36" r="30" fill="none" stroke={P.bdr} strokeWidth="4"/><circle cx="36" cy="36" r="30" fill="none" stroke={avgR>=70?P.ok:avgR>=40?P.warn:P.dng} strokeWidth="4" strokeDasharray={avgR*1.885+" 188.5"} strokeLinecap="round" transform="rotate(-90 36 36)"/></svg>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:16,fontWeight:700,fontFamily:P.ft,color:P.tx}}>{avgR}%</div>
          </div>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:P.tx}}>Readiness</div>
            <div style={{fontSize:11,color:P.tx2,marginTop:3,fontWeight:400}}>
              {AM.filter((m)=>sm[m].status==="destroyed").length>0&&<span style={{color:P.dng}}>{AM.filter((m)=>sm[m].status==="destroyed").length}{" sore · "}</span>}
              {AM.filter((m)=>sm[m].status==="heavy").length>0&&<span style={{color:P.heavy}}>{AM.filter((m)=>sm[m].status==="heavy").length}{" heavy · "}</span>}
              <span style={{color:P.ok}}>{AM.filter((m)=>["fresh","recovered"].includes(sm[m].status)).length} ready</span>
            </div>
          </div>
        </div>
      )}
      <div style={{...Z.cd,padding:"18px 10px 14px",marginBottom:14}}>
        <BodyMap sm={sm} sel={sel} onSel={setSel}/>
        <div style={{display:"flex",justifyContent:"center",gap:18,marginTop:10,paddingTop:10,borderTop:"1px solid "+P.bdr}}>
          {[["Fresh",P.ok],["Active",P.warn],["Heavy",P.heavy],["Sore",P.dng]].map(([l,cl])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:6,height:6,borderRadius:3,background:cl}}/><span style={{fontSize:8,color:P.tx3,fontWeight:600,letterSpacing:2}}>{l.toUpperCase()}</span></div>
          ))}
        </div>
      </div>
      {sel&&s&&(
        <div style={{...Z.cd,padding:16,marginBottom:14,border:"1px solid "+sClrA(s.strain,0.15)}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:16,fontWeight:700,color:P.tx,textTransform:"capitalize"}}>{sel}</span>
            <span style={{fontSize:9,fontWeight:700,letterSpacing:2,padding:"4px 10px",borderRadius:20,background:sClrA(s.strain,0.08),color:sClr(s.strain)}}>{SL[s.status]}</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[[s.vol>0?vF(s.vol):"—","Volume"],[s.hrs!==null?Math.round(s.hrs)+"h":"—","Last Hit"],[s.hrs!==null?s.rec+"%":"—","Recovery"]].map(([v,l])=>(
              <div key={l} style={{textAlign:"center",background:P.bg,borderRadius:8,padding:"10px 6px"}}>
                <div style={{fontSize:17,fontWeight:700,color:P.tx,fontFamily:P.mn}}>{v}</div>
                <div style={{fontSize:8,color:P.tx3,fontWeight:600,letterSpacing:2,marginTop:2}}>{l.toUpperCase()}</div>
              </div>
            ))}
          </div>
          {s.hrs!==null&&<div style={{marginTop:10,height:4,background:P.bdr,borderRadius:2}}><div style={{height:"100%",borderRadius:2,width:s.rec+"%",background:s.rec>=80?P.ok:s.rec>=50?P.warn:P.dng,transition:"width 0.5s"}}/></div>}
        </div>
      )}
      <div style={Z.lb}>MUSCLE GROUPS</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:20}}>
        {AM.map((m)=>(
          <button key={m} onClick={()=>setSel(sel===m?null:m)} style={{...Z.cd,padding:"12px 14px",cursor:"pointer",border:"1px solid "+(sel===m?P.bdrL:P.bdr),background:sel===m?P.card:P.card,textAlign:"left"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,fontWeight:600,color:P.tx,textTransform:"capitalize"}}>{m}</span>
              <div style={{width:6,height:6,borderRadius:3,background:sClr(sm[m]?.strain||0)}}/>
            </div>
            <div style={{fontSize:10,color:P.tx3,marginTop:3,fontWeight:400}}>
              {sm[m]?.hrs!==null?(Math.round(sm[m].hrs/24)===0?"Today":Math.round(sm[m].hrs/24)+"d ago"):"—"}
              {sm[m]?.vol>0&&<span style={{color:P.tx2}}>{" · "+vF(sm[m].vol)}</span>}
            </div>
          </button>
        ))}
      </div>
      <div style={Z.lb}>WEEKLY VOLUME</div>
      <div style={{...Z.cd,padding:16}}>
        <div style={{display:"flex",alignItems:"flex-end",gap:8,height:60,marginBottom:8}}>
          {wv.map((v,i)=>(<div key={i} style={{flex:1,display:"flex",flexDirection:"column",height:"100%",justifyContent:"flex-end"}}><div style={{width:"100%",borderRadius:"4px 4px 0 0",background:i===3?P.tx:"rgba(30,28,24,0.08)",height:Math.max(4,(v/mx)*100)+"%",transition:"height 0.5s"}}/></div>))}
        </div>
        <div style={{display:"flex",gap:8}}>
          {["4w","3w","2w","Now"].map((l,i)=>(<div key={l} style={{flex:1,textAlign:"center"}}><div style={{fontSize:9,color:i===3?P.tx:P.tx3,fontWeight:600,letterSpacing:1}}>{l}</div><div style={{fontSize:10,fontWeight:600,color:i===3?P.tx:P.tx2,fontFamily:P.mn,marginTop:2}}>{vF(wv[i])}</div></div>))}
        </div>
      </div>
    </div>
  );
}

/* __SPLIT__ */

function HexMark({size,fg,bg}){
  const s=size||40;
  return (<svg viewBox="0 0 100 100" width={s} height={s}><polygon points="50,10 87,30 87,70 50,90 13,70 13,30" fill={fg||P.tx}/><polygon points="50,32 66,42 66,58 50,68 34,58 34,42" fill={bg||P.bg}/></svg>);
}

export default function App(){
  const [view,setView]=useState(null);
  const [wks,setWks]=useState([]);
  const [aw,setAw]=useState(null);
  const [dw,setDw]=useState(null);
  const [load,setLoad]=useState(true);
  const [el,setEl]=useState(0);
  const [user,setUser]=useState(null);
  const [authLoad,setAuthLoad]=useState(true);
  const tr=useRef(null);

  // Load fonts
  useEffect(()=>{const lk=document.createElement("link");lk.rel="stylesheet";lk.href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap";document.head.appendChild(lk)},[]);

  // Auth listener
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user||null);
      setAuthLoad(false);
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,session)=>{
      setUser(session?.user||null);
    });
    return ()=>subscription.unsubscribe();
  },[]);

  // Determine initial view once auth is resolved
  useEffect(()=>{
    if(authLoad)return;
    if(view===null){
      setView(user?"home":"landing");
    }
  },[authLoad,user]);

  // When user signs in while on landing, go to home
  useEffect(()=>{
    if(user&&view==="landing")setView("home");
  },[user]);

  // Load data when user changes
  useEffect(()=>{
    if(authLoad)return;
    const uid=user?.id||null;
    (async()=>{
      const s=await ld("griht-w",uid);
      const a=await ld("griht-a",uid);
      if(s)setWks(s);
      if(a){setAw(a);setView("active")}
      setLoad(false);
    })();
  },[user,authLoad]);

  // Migrate localStorage to Supabase on first sign-in
  useEffect(()=>{
    if(!user||load)return;
    (async()=>{
      const localW=localStorage.getItem("griht-w");
      const localA=localStorage.getItem("griht-a");
      if(localW){
        const parsed=JSON.parse(localW);
        if(parsed&&parsed.length>0&&wks.length===0){
          setWks(parsed);
          await sv("griht-w",parsed,user.id);
          if(localA){
            const parsedA=JSON.parse(localA);
            if(parsedA){setAw(parsedA);await sv("griht-a",parsedA,user.id)}
          }
          localStorage.removeItem("griht-w");
          localStorage.removeItem("griht-a");
        }
      }
    })();
  },[user,load]);

  useEffect(()=>{if(aw&&view==="active"){tr.current=setInterval(()=>setEl(Date.now()-new Date(aw.st).getTime()),1000)}return()=>clearInterval(tr.current)},[aw,view]);
  const uid2=user?.id||null;
  const pa=useCallback(async(w)=>{setAw(w);await sv("griht-a",w,uid2)},[uid2]);
  const startW=async(nm)=>{const w={id:uid(),nm,st:new Date().toISOString(),exs:[]};await pa(w);setView("active")};
  const finishW=async()=>{if(!aw)return;const x={...aw,et:new Date().toISOString()};const u=[x,...wks];setWks(u);await sv("griht-w",u,uid2);await sv("griht-a",null,uid2);setAw(null);setEl(0);setView("home")};
  const discardW=async()=>{await sv("griht-a",null,uid2);setAw(null);setEl(0);setView("home")};
  const deleteW=async(id)=>{const u=wks.filter((w)=>w.id!==id);setWks(u);await sv("griht-w",u,uid2);setView("history")};
  const signIn=async()=>{await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.origin}})};
  const signOut=async()=>{await supabase.auth.signOut();setUser(null);setWks([]);setAw(null);setView("landing")};

  if(authLoad||load||view===null)return (<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:P.bg,fontFamily:P.ft}}><HexMark size={56}/><div style={{fontSize:32,fontWeight:900,color:P.tx,letterSpacing:6,marginTop:16}}>GRI<span style={{color:P.acc2}}>HT</span></div><div style={{fontSize:9,color:P.tx3,letterSpacing:4,fontWeight:700,marginTop:8}}>PUT IN WORK</div></div>);
  if(view==="landing")return <Landing onLaunch={()=>setView("home")} onSignIn={signIn} user={user}/>;
  return (
    <div style={{fontFamily:P.ft,background:P.bg,color:P.tx,minHeight:"100vh",maxWidth:480,margin:"0 auto"}}>
      {view==="home"&&<Home wks={wks} go={setView} hasAw={!!aw} user={user} onSignIn={signIn} onSignOut={signOut}/>}
      {view==="dashboard"&&<Dash wks={wks} onBack={()=>setView("home")}/>}
      {view==="newWorkout"&&<NewWk onStart={startW} onBack={()=>setView("home")}/>}
      {view==="active"&&aw&&<ActiveWk wk={aw} el={el} onUpd={pa} onFin={finishW} onDis={discardW}/>}
      {view==="history"&&<Hist wks={wks} onBack={()=>setView("home")} onSel={(w)=>{setDw(w);setView("detail")}}/>}
      {view==="detail"&&dw&&<Det wk={dw} onBack={()=>setView("history")} onDel={deleteW}/>}
    </div>
  );
}

function Landing({onLaunch,onSignIn,user}){
  const [vis,setVis]=useState(false);
  useEffect(()=>{setTimeout(()=>setVis(true),100)},[]);
  return (
    <div style={{fontFamily:P.ft,background:P.tx,color:P.bg,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      {/* Hero */}
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 24px 40px",textAlign:"center",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"all 0.8s cubic-bezier(0.16,1,0.3,1)"}}>
        <div style={{marginBottom:32}}>
          <HexMark size={72} fg={P.bg} bg={P.tx}/>
        </div>
        <h1 style={{fontSize:52,fontWeight:900,letterSpacing:8,lineHeight:1,margin:0,color:P.bg}}>
          GRI<span style={{color:P.acc2}}>HT</span>
        </h1>
        <div style={{width:40,height:1,background:"rgba(240,237,232,0.15)",margin:"20px auto"}}/>
        <p style={{fontSize:13,fontWeight:600,letterSpacing:5,color:"rgba(240,237,232,0.35)",margin:0}}>PUT IN WORK</p>
      </div>

      {/* Features */}
      <div style={{padding:"0 24px 40px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(30px)",transition:"all 0.8s 0.2s cubic-bezier(0.16,1,0.3,1)"}}>
        <div style={{display:"flex",flexDirection:"column",gap:12,maxWidth:400,margin:"0 auto"}}>
          {[
            ["Track","Log sets, reps, and weight. Build the record."],
            ["Monitor","Strain heatmap shows what's recovered and what's not."],
            ["Progress","Volume trends across weeks. See the work add up."],
          ].map(([t,d])=>(
            <div key={t} style={{display:"flex",gap:14,alignItems:"flex-start"}}>
              <div style={{width:32,height:32,borderRadius:8,background:"rgba(240,237,232,0.06)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
                <HexMark size={16} fg="rgba(240,237,232,0.4)" bg={P.tx}/>
              </div>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:P.bg,letterSpacing:1}}>{t}</div>
                <div style={{fontSize:12,fontWeight:400,color:"rgba(240,237,232,0.4)",lineHeight:1.5,marginTop:2}}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{padding:"0 24px 20px",maxWidth:400,margin:"0 auto",width:"100%",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(30px)",transition:"all 0.8s 0.4s cubic-bezier(0.16,1,0.3,1)"}}>
        {user?(
          <button onClick={onLaunch} style={{
            width:"100%",padding:18,borderRadius:12,border:"none",cursor:"pointer",
            background:P.bg,color:P.tx,fontSize:14,fontWeight:900,fontFamily:P.ft,letterSpacing:4,
          }}>LAUNCH APP</button>
        ):(
          <button onClick={onSignIn} style={{
            width:"100%",padding:18,borderRadius:12,border:"none",cursor:"pointer",
            background:"#FFFFFF",color:P.tx,fontSize:14,fontWeight:700,fontFamily:P.ft,letterSpacing:2,
            display:"flex",alignItems:"center",justifyContent:"center",gap:10,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            SIGN IN WITH GOOGLE
          </button>
        )}

        {!user&&(
          <button onClick={onLaunch} style={{
            width:"100%",padding:14,marginTop:10,borderRadius:12,border:"1px solid rgba(240,237,232,0.12)",cursor:"pointer",
            background:"transparent",color:"rgba(240,237,232,0.4)",fontSize:12,fontWeight:600,fontFamily:P.ft,letterSpacing:3,
          }}>CONTINUE WITHOUT ACCOUNT</button>
        )}

        <div style={{textAlign:"center",marginTop:16}}>
          <span style={{fontSize:10,color:"rgba(240,237,232,0.2)",letterSpacing:2,fontWeight:600}}>
            {user?"Signed in as "+user.email:"SIGN IN TO SYNC ACROSS DEVICES"}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div style={{padding:"20px 24px",borderTop:"1px solid rgba(240,237,232,0.06)",textAlign:"center"}}>
        <span style={{fontSize:9,color:"rgba(240,237,232,0.15)",letterSpacing:3,fontWeight:600}}>GRIHT © 2026</span>
      </div>
    </div>
  );
}
function Home({wks,go,hasAw,user,onSignIn,onSignOut}){
  const tot=wks.length,tw=wks.filter((w)=>(Date.now()-new Date(w.st).getTime())/86400000<=7).length;
  const tv=wks.reduce((a,w)=>a+w.exs.reduce((eA,ex)=>eA+ex.sets.reduce((sA,s)=>sA+s.w*s.r,0),0),0);
  const sm=useMemo(()=>calcStrain(wks),[wks]);

  // Smart suggestions engine
  const suggest=useMemo(()=>{
    const now=Date.now();
    const ready=AM.filter((m)=>!sm[m]?.hrs||sm[m].rec>=70);
    const sore=AM.filter((m)=>sm[m]?.strain>0.7);
    const heavy=AM.filter((m)=>sm[m]?.strain>0.4&&sm[m]?.strain<=0.7);
    const active=AM.filter((m)=>sm[m]?.hrs!==null);
    const daysSinceLast=wks.length>0?Math.round((now-new Date(wks[0].st).getTime())/86400000):null;
    const consec=wks.filter((w,i)=>{if(i>4)return false;const d=(now-new Date(w.st).getTime())/86400000;return d<=i+1.5}).length;

    // Rest day logic
    const needsRest=sore.length>=4||consec>=5||(heavy.length>=6&&sore.length>=2);
    
    // Group muscles into workout suggestions
    const groups={push:["chest","shoulders","triceps"],pull:["back","lats","biceps"],legs:["quads","hamstrings","glutes","calves"],upper:["chest","back","shoulders","biceps","triceps"],core:["core"]};
    const groupScores=Object.entries(groups).map(([name,muscles])=>{
      const avgRec=muscles.reduce((a,m)=>a+(sm[m]?.rec??100),0)/muscles.length;
      const avgStrain=muscles.reduce((a,m)=>a+(sm[m]?.strain??0),0)/muscles.length;
      const lastHit=Math.min(...muscles.map((m)=>sm[m]?.hrs??999));
      return {name,muscles,avgRec:Math.round(avgRec),avgStrain,lastHit,ready:avgRec>=60};
    }).sort((a,b)=>b.avgRec-a.avgRec);

    const topPick=needsRest?null:groupScores.find((g)=>g.ready&&g.name!=="core");
    const labels={push:"Push Day",pull:"Pull Day",legs:"Leg Day",upper:"Upper Body",core:"Core"};

    // Cooldown recs based on what was last worked
    const lastWk=wks[0];
    const lastMuscles=lastWk?[...new Set(lastWk.exs.flatMap((e)=>DB[e.grp]?.muscles||[]))]:[];
    const cooldowns=[];
    if(lastMuscles.some((m)=>["chest","shoulders","triceps"].includes(m)))cooldowns.push({area:"Upper Push",tip:"Chest doorway stretch, shoulder dislocates, tricep overhead stretch — 30s each"});
    if(lastMuscles.some((m)=>["back","lats","biceps"].includes(m)))cooldowns.push({area:"Upper Pull",tip:"Cat-cow stretch, lat hang, bicep wall stretch — 30s each"});
    if(lastMuscles.some((m)=>["quads","hamstrings","glutes","calves"].includes(m)))cooldowns.push({area:"Lower Body",tip:"Couch stretch, RDL stretch, pigeon pose, calf drops — 45s each"});
    if(lastMuscles.includes("core"))cooldowns.push({area:"Core",tip:"Cobra stretch, child's pose, seated twist — 30s each"});

    return {ready,sore,heavy,needsRest,groupScores,topPick,labels,daysSinceLast,consec,cooldowns,lastMuscles};
  },[wks,sm]);

  const avgR=useMemo(()=>{const tm=AM.filter((m)=>sm[m]?.hrs!==null);return tm.length?Math.round(tm.reduce((a,m)=>a+sm[m].rec,0)/tm.length):100},[sm]);

  return (
    <div style={Z.vc}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <HexMark size={24}/>
          <span style={{fontSize:20,fontWeight:900,letterSpacing:4,color:P.tx,lineHeight:1}}>GRI<span style={{color:P.acc2}}>HT</span></span>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <button onClick={()=>go("history")} style={{width:32,height:32,borderRadius:8,background:P.card,border:"1px solid "+P.bdr,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:P.tx2}}>☰</button>
          <button onClick={()=>go("dashboard")} style={{width:32,height:32,borderRadius:8,background:P.card,border:"1px solid "+P.bdr,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:P.tx2}}>◎</button>
          {user?(
            <button onClick={onSignOut} style={{width:32,height:32,borderRadius:16,border:"1px solid "+P.bdr,cursor:"pointer",overflow:"hidden",padding:0,background:P.card}}>
              {user.user_metadata?.avatar_url?(<img src={user.user_metadata.avatar_url} width={32} height={32} style={{borderRadius:16}}/>):(<div style={{width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:P.tx2}}>{(user.email||"?")[0].toUpperCase()}</div>)}
            </button>
          ):(
            <button onClick={onSignIn} style={{height:32,padding:"0 10px",borderRadius:8,background:P.card,border:"1px solid "+P.bdr,cursor:"pointer",fontSize:9,fontWeight:700,color:P.acc2,letterSpacing:1,fontFamily:P.ft}}>SIGN IN</button>
          )}
        </div>
      </div>

      {/* Resume active */}
      {hasAw&&(<button style={{...Z.cd,width:"100%",padding:14,cursor:"pointer",marginBottom:12,border:"1px solid rgba(45,159,74,0.2)",background:"rgba(45,159,74,0.03)",display:"flex",alignItems:"center",gap:10}} onClick={()=>go("active")}><div style={{width:8,height:8,borderRadius:4,background:P.ok,animation:"pulse 2s infinite"}}/><span style={{fontSize:13,fontWeight:600,letterSpacing:1}}>Resume Session</span><span style={{marginLeft:"auto",color:P.ok,fontWeight:700}}>{"→"}</span></button>)}

      {/* Readiness ring + stats */}
      <div style={{...Z.cd,padding:16,marginBottom:10,display:"flex",alignItems:"center",gap:16}}>
        <div style={{position:"relative",width:56,height:56,flexShrink:0}}>
          <svg viewBox="0 0 56 56" width="56" height="56"><circle cx="28" cy="28" r="23" fill="none" stroke={P.bdr} strokeWidth="3.5"/><circle cx="28" cy="28" r="23" fill="none" stroke={avgR>=70?P.ok:avgR>=40?P.warn:P.dng} strokeWidth="3.5" strokeDasharray={avgR*1.445+" 144.5"} strokeLinecap="round" transform="rotate(-90 28 28)"/></svg>
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:14,fontWeight:900,fontFamily:P.mn,color:P.tx}}>{avgR}%</div>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:P.tx}}>Readiness</div>
          <div style={{fontSize:11,color:P.tx2,marginTop:2}}>
            {suggest.sore.length>0&&<span style={{color:P.dng}}>{suggest.sore.length} sore </span>}
            {suggest.heavy.length>0&&<span style={{color:P.heavy}}>{suggest.heavy.length} heavy </span>}
            <span style={{color:P.ok}}>{suggest.ready.length} ready</span>
          </div>
          <div style={{display:"flex",gap:2,marginTop:6}}>{AM.map((m)=>(<div key={m} style={{flex:1,height:4,borderRadius:2,background:sClrA(sm[m]?.strain||0,Math.max(0.12,sm[m]?.strain||0))}}/>))}</div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        {[[tot,"TOTAL"],[tw,"THIS WK"],[tv>0?vF(tv):"—","VOL"]].map(([v,l])=>(<div key={l} style={{flex:1,...Z.cd,padding:"10px 6px",textAlign:"center"}}><div style={{fontSize:17,fontWeight:900,color:P.tx}}>{v}</div><div style={{fontSize:7,fontWeight:700,color:P.tx3,marginTop:2,letterSpacing:2}}>{l}</div></div>))}
      </div>

      {/* Smart suggestion or rest day */}
      {suggest.needsRest?(
        <div style={{...Z.cd,padding:16,marginBottom:12,border:"1px solid rgba(192,48,48,0.1)",background:"rgba(192,48,48,0.02)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <div style={{width:28,height:28,borderRadius:7,background:"rgba(192,48,48,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⏸</div>
            <div style={{fontSize:14,fontWeight:700,color:P.dng}}>Rest Day Recommended</div>
          </div>
          <div style={{fontSize:12,color:P.tx2,lineHeight:1.6}}>
            {suggest.sore.length>=4?"Multiple muscle groups are still recovering. ":""}
            {suggest.consec>=5?"You've trained "+suggest.consec+" days in a row. ":""}
            Active recovery — walk, stretch, or light mobility work.
          </div>
        </div>
      ):suggest.topPick?(
        <div style={{...Z.cd,padding:16,marginBottom:12,border:"1px solid rgba(45,159,74,0.1)",background:"rgba(45,159,74,0.02)"}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:3,color:P.ok,marginBottom:6}}>SUGGESTED</div>
          <div style={{fontSize:16,fontWeight:700,color:P.tx,marginBottom:4}}>{suggest.labels[suggest.topPick.name]}</div>
          <div style={{fontSize:11,color:P.tx2,marginBottom:10}}>
            {suggest.topPick.muscles.map((m)=>m.charAt(0).toUpperCase()+m.slice(1)).join(", ")} — {suggest.topPick.avgRec}% recovered
          </div>
          <button style={{...Z.pri,marginBottom:0,padding:12,fontSize:12}} onClick={()=>go("newWorkout")}>{suggest.labels[suggest.topPick.name].toUpperCase()} →</button>
        </div>
      ):(
        <button style={Z.pri} onClick={()=>go("newWorkout")}>START WORKOUT</button>
      )}

      {!suggest.topPick&&!suggest.needsRest&&<button style={Z.pri} onClick={()=>go("newWorkout")}>START WORKOUT</button>}

      {/* Muscle group quick view */}
      <div style={{...Z.cd,padding:14,marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontSize:9,fontWeight:700,letterSpacing:3,color:P.tx3}}>MUSCLE STATUS</span>
          <button onClick={()=>go("dashboard")} style={{background:"none",border:"none",color:P.acc2,fontSize:10,fontWeight:600,cursor:"pointer",letterSpacing:1}}>DETAIL →</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4}}>
          {AM.map((m)=>{
            const s=sm[m];const hrs=s?.hrs;const rec=s?.rec??100;
            return (<div key={m} style={{padding:"8px 6px",borderRadius:6,background:P.bg,textAlign:"center"}}>
              <div style={{width:6,height:6,borderRadius:3,background:sClr(s?.strain||0),margin:"0 auto 4px"}}/>
              <div style={{fontSize:9,fontWeight:600,color:P.tx,textTransform:"capitalize",lineHeight:1}}>{m.length>8?m.slice(0,7)+"…":m}</div>
              <div style={{fontSize:8,color:P.tx3,marginTop:2,fontFamily:P.mn}}>{hrs!==null?rec+"%":"—"}</div>
            </div>);
          })}
        </div>
      </div>

      {/* Cooldown recs */}
      {suggest.cooldowns.length>0&&(
        <div style={{...Z.cd,padding:14,marginBottom:10}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:3,color:P.tx3,marginBottom:8}}>RECOVERY — LAST SESSION</div>
          {suggest.cooldowns.map((cd)=>(
            <div key={cd.area} style={{marginBottom:8}}>
              <div style={{fontSize:12,fontWeight:600,color:P.tx}}>{cd.area}</div>
              <div style={{fontSize:11,color:P.tx2,marginTop:2,lineHeight:1.5}}>{cd.tip}</div>
            </div>
          ))}
        </div>
      )}

      {/* Other suggestions */}
      {suggest.groupScores.filter((g)=>g.ready&&g.name!=="core"&&g.name!==suggest.topPick?.name).length>0&&(
        <div style={{...Z.cd,padding:14,marginBottom:10}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:3,color:P.tx3,marginBottom:8}}>ALSO GOOD TODAY</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {suggest.groupScores.filter((g)=>g.ready&&g.name!=="core"&&g.name!==suggest.topPick?.name).map((g)=>(
              <button key={g.name} onClick={()=>go("newWorkout")} style={{padding:"8px 14px",borderRadius:8,background:P.bg,border:"1px solid "+P.bdr,cursor:"pointer",color:P.tx,fontSize:11,fontWeight:600}}>
                {suggest.labels[g.name]} <span style={{color:P.ok,fontFamily:P.mn,fontSize:10}}>{g.avgRec}%</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      {wks.length>0&&(<div style={{marginTop:4}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:9,fontWeight:700,letterSpacing:3,color:P.tx3}}>RECENT</span>
          <button onClick={()=>go("history")} style={{background:"none",border:"none",color:P.acc2,fontSize:10,fontWeight:600,cursor:"pointer",letterSpacing:1}}>ALL →</button>
        </div>
        {wks.slice(0,3).map((w)=>(<div key={w.id} style={{...Z.cd,padding:"10px 14px",marginBottom:5}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:P.tx}}>{w.nm}</div>
              <div style={{fontSize:10,color:P.tx3,marginTop:2}}>{fD(w.st)}{w.et&&" · "+durF(new Date(w.et)-new Date(w.st))}</div>
            </div>
            <div style={{fontSize:11,color:P.tx2,fontFamily:P.mn}}>{vF(w.exs.reduce((a,ex)=>a+ex.sets.filter((s)=>s.dn).reduce((sA,s)=>sA+s.w*s.r,0),0))}</div>
          </div>
        </div>))}
      </div>)}
    </div>
  );
}
function NewWk({onStart,onBack}){
  const [n,setN]=useState("");
  const ps=["Push Day","Pull Day","Leg Day","Upper Body","Lower Body","Full Body","Arms","Chest & Back","Custom"];
  return (
    <div style={Z.vc}>
      <button style={Z.bk} onClick={onBack}>{"← Back"}</button>
      <h2 style={Z.h2}>New Session</h2>
      <div style={{...Z.lb,marginTop:16}}>QUICK START</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:20}}>
        {ps.map((p)=>(<button key={p} onClick={()=>setN(p==="Custom"?"":p)} style={{...Z.cd,padding:"10px 6px",cursor:"pointer",border:"1px solid "+(n===p?P.bdrL:P.bdr),background:n===p?P.bg:P.card,fontSize:11,fontWeight:n===p?700:400,textAlign:"center",color:n===p?P.tx:P.tx2}}>{p}</button>))}
      </div>
      <div style={Z.lb}>CUSTOM NAME</div>
      <input style={Z.inp} value={n} onChange={(e)=>setN(e.target.value)} placeholder="Morning Push..." maxLength={40}/>
      <button style={{...Z.pri,opacity:n.trim()?1:0.4}} onClick={()=>n.trim()&&onStart(n.trim())} disabled={!n.trim()}>BEGIN</button>
    </div>
  );
}
function ActiveWk({wk,el,onUpd,onFin,onDis}){
  const [pick,setPick]=useState(false);
  const [exp,setExp]=useState(null);
  const [conf,setConf]=useState(null);
  const addEx=(e,g)=>{const ne={id:uid(),nm:e.n,grp:g,t:e.t,dw:e.w,inc:e.i,sets:[{id:uid(),w:e.w,r:10,dn:false}]};onUpd({...wk,exs:[...wk.exs,ne]});setPick(false);setExp(ne.id)};
  const uS=(eid,sid,f,v)=>onUpd({...wk,exs:wk.exs.map((e)=>e.id===eid?{...e,sets:e.sets.map((s)=>s.id===sid?{...s,[f]:v}:s)}:e)});
  const aS=(eid)=>{const e=wk.exs.find((x)=>x.id===eid);const l=e.sets[e.sets.length-1];onUpd({...wk,exs:wk.exs.map((x)=>x.id===eid?{...x,sets:[...x.sets,{id:uid(),w:l?.w||0,r:l?.r||10,dn:false}]}:x)})};
  const rS=(eid,sid)=>onUpd({...wk,exs:wk.exs.map((e)=>e.id===eid?{...e,sets:e.sets.filter((s)=>s.id!==sid)}:e)});
  const rE=(eid)=>onUpd({...wk,exs:wk.exs.filter((e)=>e.id!==eid)});
  const tv=wk.exs.reduce((a,ex)=>a+ex.sets.filter((s)=>s.dn).reduce((sA,s)=>sA+s.w*s.r,0),0);
  const ts=wk.exs.reduce((a,ex)=>a+ex.sets.filter((s)=>s.dn).length,0);
  const m=Math.floor(el/60000),sc=Math.floor((el%60000)/1000);
  return (
    <div style={Z.vc}>
      <div style={{marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><div style={{width:8,height:8,borderRadius:4,background:P.ok}}/><span style={{fontSize:16,fontWeight:700,color:P.tx}}>{wk.nm}</span></div>
        <div style={{fontSize:28,fontWeight:700,fontFamily:P.mn,color:P.tx,letterSpacing:2}}>{String(Math.floor(m/60)).padStart(2,"0")}:{String(m%60).padStart(2,"0")}:{String(sc).padStart(2,"0")}</div>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:16}}>
        {[[wk.exs.length,"EXERCISES"],[ts,"SETS"],[vF(tv),"VOLUME"]].map(([v,l])=>(<div key={l} style={{flex:1,...Z.cd,padding:"10px 6px",textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:P.tx}}>{v}</div><div style={{fontSize:7,color:P.tx3,fontWeight:700,letterSpacing:2}}>{l}</div></div>))}
      </div>
      {wk.exs.map((ex,i)=>(<ExCard key={ex.id} ex={ex} i={i} isExp={exp===ex.id} onTog={()=>setExp(exp===ex.id?null:ex.id)} onUS={(sid,f,v)=>uS(ex.id,sid,f,v)} onAS={()=>aS(ex.id)} onRS={(sid)=>rS(ex.id,sid)} onRm={()=>rE(ex.id)}/>))}
      <button style={{...Z.cd,width:"100%",padding:12,cursor:"pointer",marginTop:8,marginBottom:16,border:"1px dashed "+P.bdrL,background:"transparent",color:P.acc2,fontSize:12,fontWeight:700,textAlign:"center",letterSpacing:2}} onClick={()=>setPick(true)}>+ ADD EXERCISE</button>
      <div style={{display:"flex",gap:8}}>
        <button style={{flex:1,...Z.cd,padding:12,cursor:"pointer",border:"1px solid rgba(192,48,48,0.12)",color:P.dng,fontSize:11,fontWeight:600,textAlign:"center",background:P.card,letterSpacing:2}} onClick={()=>setConf("d")}>DISCARD</button>
        <button style={{flex:2,padding:12,cursor:"pointer",borderRadius:P.r,border:"none",background:P.cta,color:P.ctaTx,fontSize:12,fontWeight:700,textAlign:"center",letterSpacing:3}} onClick={()=>setConf("f")}>COMPLETE SESSION</button>
      </div>
      {pick&&<Picker onSel={addEx} onClose={()=>setPick(false)}/>}
      {conf==="f"&&<Mdl t="Complete?" msg={wk.exs.length+" exercises · "+ts+" sets · "+vF(tv)+" lbs"} onOk={()=>{setConf(null);onFin()}} onNo={()=>setConf(null)} ok="Confirm"/>}
      {conf==="d"&&<Mdl t="Discard?" msg="All progress will be lost." onOk={()=>{setConf(null);onDis()}} onNo={()=>setConf(null)} ok="Discard" isDng/>}
    </div>
  );
}
function ExCard({ex,i,isExp,onTog,onUS,onAS,onRS,onRm}){
  const cd=ex.sets.filter((s)=>s.dn).length;const ic=ex.t==="cardio";
  return (
    <div style={{...Z.cd,marginBottom:6,overflow:"hidden"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",cursor:"pointer"}} onClick={onTog}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:24,height:24,borderRadius:4,background:P.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:P.acc2,fontFamily:P.mn}}>{i+1}</div>
          <div><div style={{fontSize:13,fontWeight:600,color:P.tx}}>{ex.nm}</div><div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}><span style={{fontSize:9,fontWeight:600,color:P.tx3,background:P.bg,padding:"1px 5px",borderRadius:3,letterSpacing:1}}>{TB[ex.t]||"?"}</span><span style={{fontSize:10,color:P.tx3}}>{cd}/{ex.sets.length}</span></div></div>
        </div>
        <span style={{fontSize:16,color:P.tx3,transition:"transform 0.2s",transform:isExp?"rotate(90deg)":"rotate(0deg)"}}>{"›"}</span>
      </div>
      {isExp&&(
        <div style={{padding:"0 14px 14px",borderTop:"1px solid "+P.bdr}}>
          <div style={{display:"grid",gridTemplateColumns:"28px 1fr "+(ic?"":"1fr ")+"36px 24px",gap:4,padding:"10px 0 4px"}}>
            <span style={{fontSize:8,fontWeight:700,letterSpacing:2,color:P.tx3,textAlign:"center"}}>SET</span>
            {!ic&&<span style={{fontSize:8,fontWeight:700,letterSpacing:2,color:P.tx3,textAlign:"center"}}>LBS</span>}
            <span style={{fontSize:8,fontWeight:700,letterSpacing:2,color:P.tx3,textAlign:"center"}}>{ic?"MIN":"REPS"}</span>
            <span style={{fontSize:8,fontWeight:700,letterSpacing:2,color:P.tx3,textAlign:"center"}}>{"✓"}</span><span/>
          </div>
          {ex.sets.map((s,si)=>(<SRow key={s.id} s={s} i={si} inc={ex.inc} ic={ic} onU={(f,v)=>onUS(s.id,f,v)} onR={()=>onRS(s.id)}/>))}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:10}}>
            <button style={{padding:"6px 12px",borderRadius:6,background:"transparent",fontSize:10,fontWeight:700,cursor:"pointer",color:P.acc2,border:"1px solid "+P.bdr,letterSpacing:1}} onClick={onAS}>+ SET</button>
            <button style={{padding:"6px 12px",borderRadius:6,background:"transparent",fontSize:10,fontWeight:700,cursor:"pointer",color:P.dng,border:"1px solid rgba(192,48,48,0.1)",letterSpacing:1}} onClick={onRm}>REMOVE</button>
          </div>
        </div>
      )}
    </div>
  );
}
function SRow({s,i,inc,ic,onU,onR}){
  return (
    <div style={{display:"grid",gridTemplateColumns:"28px 1fr "+(ic?"":"1fr ")+"36px 24px",gap:4,alignItems:"center",marginBottom:4,opacity:s.dn?0.45:1}}>
      <span style={{fontSize:11,color:P.tx3,textAlign:"center",fontWeight:600,fontFamily:P.mn}}>{i+1}</span>
      {!ic&&(<div style={Z.ig}><button style={Z.ib} onClick={()=>onU("w",Math.max(0,s.w-(inc||5)))}>{"−"}</button><input style={Z.ni} type="number" value={s.w} onChange={(e)=>onU("w",Math.max(0,parseInt(e.target.value)||0))}/><button style={Z.ib} onClick={()=>onU("w",s.w+(inc||5))}>{"+"}</button></div>)}
      <div style={Z.ig}><button style={Z.ib} onClick={()=>onU("r",Math.max(0,s.r-1))}>{"−"}</button><input style={Z.ni} type="number" value={s.r} onChange={(e)=>onU("r",Math.max(0,parseInt(e.target.value)||0))}/><button style={Z.ib} onClick={()=>onU("r",s.r+1)}>{"+"}</button></div>
      <button style={{width:36,height:32,borderRadius:6,background:s.dn?"rgba(45,159,74,0.08)":P.card,border:"1px solid "+(s.dn?"rgba(45,159,74,0.2)":P.bdr),color:s.dn?P.ok:P.tx3,fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>onU("dn",!s.dn)}>{s.dn?"✓":""}</button>
      <button style={{width:24,height:32,background:"transparent",border:"none",color:P.tx3,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onR}>{"×"}</button>
    </div>
  );
}
function Picker({onSel,onClose}){
  const [q,setQ]=useState("");const [sg,setSg]=useState(null);
  const gs=Object.keys(DB);
  const fl=sg?DB[sg].ex.filter((e)=>e.n.toLowerCase().includes(q.toLowerCase())):[];
  const af=q.trim()?gs.flatMap((g)=>DB[g].ex.filter((e)=>e.n.toLowerCase().includes(q.toLowerCase())).map((e)=>({...e,grp:g}))):[];
  return (
    <div style={Z.ov}><div style={{width:"100%",maxWidth:480,maxHeight:"88vh",background:P.card,borderRadius:"14px 14px 0 0",padding:"18px 16px",overflowY:"auto",borderTop:"1px solid "+P.bdrL}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h3 style={{fontSize:18,fontWeight:900,color:P.tx,margin:0,letterSpacing:1}}>Add Exercise</h3>
        <button style={{background:P.bg,border:"none",color:P.tx2,width:30,height:30,borderRadius:15,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>{"✕"}</button>
      </div>
      <input style={{...Z.inp,marginBottom:12}} value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search exercises..." autoFocus/>
      {!q.trim()&&!sg&&(<div style={{display:"flex",flexDirection:"column",gap:5}}>{gs.map((g)=>(<button key={g} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:P.bg,borderRadius:P.r,border:"1px solid "+P.bdr,color:P.tx,fontSize:14,cursor:"pointer",textAlign:"left"}} onClick={()=>setSg(g)}><span style={{fontSize:14,color:P.acc2}}>{DB[g].em}</span><span style={{flex:1,fontWeight:600}}>{g}</span><span style={{fontSize:11,color:P.tx3}}>{DB[g].ex.length}</span><span style={{color:P.tx3}}>{"›"}</span></button>))}</div>)}
      {!q.trim()&&sg&&(<><button style={Z.bk} onClick={()=>setSg(null)}>{"← All Groups"}</button><div style={{display:"flex",flexDirection:"column",gap:5}}>{fl.map((e)=>(<PI key={e.n} e={e} g={sg} onSel={onSel}/>))}</div></>)}
      {q.trim()&&(<div style={{display:"flex",flexDirection:"column",gap:5}}>{af.length===0&&<div style={{textAlign:"center",color:P.tx3,fontSize:12,padding:40}}>No matches</div>}{af.map((e)=>(<PI key={e.grp+"-"+e.n} e={e} g={e.grp} onSel={onSel} showG/>))}</div>)}
    </div></div>
  );
}
function PI({e,g,onSel,showG}){
  return (
    <button style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:P.card,borderRadius:P.r,border:"1px solid "+P.bdr,cursor:"pointer",textAlign:"left",color:P.tx,width:"100%"}} onClick={()=>onSel(e,g)}>
      <div><div style={{fontSize:13,fontWeight:600}}>{e.n}</div><div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}><span style={{fontSize:9,fontWeight:600,color:P.tx3,background:P.bg,padding:"1px 5px",borderRadius:3,letterSpacing:1}}>{TB[e.t]||"?"}</span>{showG&&<span style={{fontSize:10,color:P.tx3}}>{g}</span>}{e.w>0&&<span style={{fontSize:10,color:P.tx3}}>{e.w}lbs</span>}</div></div>
      <div style={{width:24,height:24,borderRadius:12,background:P.bg,display:"flex",alignItems:"center",justifyContent:"center",color:P.acc2,fontSize:14,fontWeight:700}}>{"+"}</div>
    </button>
  );
}
function Hist({wks,onBack,onSel}){
  return (
    <div style={Z.vc}>
      <button style={Z.bk} onClick={onBack}>{"← Home"}</button>
      <h2 style={Z.h2}>History</h2>
      {wks.length===0?(<div style={{textAlign:"center",padding:"60px 20px"}}><div style={{fontSize:16,color:P.tx3,fontWeight:600}}>No sessions yet</div></div>):(
        <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:12}}>{wks.map((w)=>{
          const d=w.et?durF(new Date(w.et)-new Date(w.st)):"—";
          const v=w.exs.reduce((a,ex)=>a+ex.sets.filter((s)=>s.dn).reduce((sA,s)=>sA+s.w*s.r,0),0);
          return (<button key={w.id} style={{...Z.cd,padding:14,cursor:"pointer",width:"100%",textAlign:"left",border:"1px solid "+P.bdr}} onClick={()=>onSel(w)}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:14,fontWeight:600}}>{w.nm}</span><span style={{fontSize:10,color:P.tx3}}>{fD(w.st)}</span></div><div style={{display:"flex",gap:6,marginTop:4,fontSize:11,color:P.tx2}}><span>{w.exs.length} ex</span><span style={{color:P.tx3}}>·</span><span>{d}</span><span style={{color:P.tx3}}>·</span><span>{vF(v)} lbs</span></div></button>);
        })}</div>
      )}
    </div>
  );
}
function Det({wk,onBack,onDel}){
  const [sd,setSd]=useState(false);
  const d=wk.et?durF(new Date(wk.et)-new Date(wk.st)):"—";
  const tv=wk.exs.reduce((a,ex)=>a+ex.sets.filter((s)=>s.dn).reduce((sA,s)=>sA+s.w*s.r,0),0);
  const ts=wk.exs.reduce((a,ex)=>a+ex.sets.filter((s)=>s.dn).length,0);
  return (
    <div style={Z.vc}>
      <button style={Z.bk} onClick={onBack}>{"← History"}</button>
      <h2 style={Z.h2}>{wk.nm}</h2>
      <div style={{fontSize:11,color:P.tx3,marginBottom:16}}>{fD(wk.st)}{" · "}{fT(wk.st)}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:20}}>
        {[[d,"DURATION"],[ts,"SETS"],[vF(tv),"VOLUME"]].map(([v,l])=>(<div key={l} style={{...Z.cd,padding:"12px 8px",textAlign:"center"}}><div style={{fontSize:17,fontWeight:700,color:P.tx,fontFamily:P.mn}}>{v}</div><div style={{fontSize:7,color:P.tx3,fontWeight:700,letterSpacing:2,marginTop:2}}>{l}</div></div>))}
      </div>
      {wk.exs.map((ex,i)=>(
        <div key={ex.id} style={{...Z.cd,padding:"12px 14px",marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <div style={{width:20,height:20,borderRadius:4,background:P.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:P.acc2,fontFamily:P.mn}}>{i+1}</div>
            <span style={{fontSize:13,fontWeight:600,color:P.tx,flex:1}}>{ex.nm}</span>
            <span style={{fontSize:9,fontWeight:600,color:P.tx3,background:P.bg,padding:"1px 5px",borderRadius:3,letterSpacing:1}}>{TB[ex.t]}</span>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
            {ex.sets.map((s,si)=>(<div key={s.id} style={{padding:"4px 8px",borderRadius:4,fontSize:11,fontFamily:P.mn,fontWeight:500,...(s.dn?{background:"rgba(45,159,74,0.06)",border:"1px solid rgba(45,159,74,0.12)",color:P.ok}:{background:P.bg,border:"1px solid "+P.bdr,color:P.tx3})}}>{"S"+(si+1)}{ex.t!=="cardio"&&" "+s.w+"lb"}{" ×"+s.r}</div>))}
          </div>
        </div>
      ))}
      <button style={{width:"100%",padding:12,marginTop:20,borderRadius:P.r,background:P.card,border:"1px solid rgba(192,48,48,0.1)",color:P.dng,fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:2}} onClick={()=>setSd(true)}>DELETE SESSION</button>
      {sd&&<Mdl t="Delete?" msg="Cannot be undone." onOk={()=>{setSd(false);onDel(wk.id)}} onNo={()=>setSd(false)} ok="Delete" isDng/>}
    </div>
  );
}
function Mdl({t,msg,onOk,onNo,ok,isDng}){
  return (
    <div style={{...Z.ov,alignItems:"center"}}>
      <div style={{width:"90%",maxWidth:340,background:P.card,borderRadius:14,padding:24,textAlign:"center",border:"1px solid "+P.bdr}}>
        <h3 style={{fontSize:18,fontWeight:900,color:P.tx,margin:"0 0 6px"}}>{t}</h3>
        <p style={{fontSize:12,color:P.tx2,margin:"0 0 20px"}}>{msg}</p>
        <div style={{display:"flex",gap:8}}>
          <button style={{flex:1,padding:12,borderRadius:P.r,background:P.bg,border:"none",color:P.tx2,fontSize:12,fontWeight:600,cursor:"pointer",letterSpacing:2}} onClick={onNo}>CANCEL</button>
          <button style={{flex:1,padding:12,borderRadius:P.r,border:"none",color:isDng?"#fff":P.ctaTx,fontSize:12,fontWeight:700,cursor:"pointer",background:isDng?P.dng:P.cta,letterSpacing:2}} onClick={onOk}>{ok.toUpperCase()}</button>
        </div>
      </div>
    </div>
  );
}

const Z={
  vc:{padding:"20px 16px 100px"},
  cd:{background:P.card,borderRadius:P.r,border:"1px solid "+P.bdr},
  bk:{background:"none",border:"none",color:P.tx2,fontFamily:P.ft,fontSize:12,fontWeight:600,cursor:"pointer",padding:"8px 0",marginBottom:10,display:"block",letterSpacing:1},
  h2:{fontSize:22,fontWeight:900,color:P.tx,margin:"0 0 4px",fontFamily:P.ft,letterSpacing:1},
  lb:{fontSize:9,fontWeight:700,color:P.tx3,marginBottom:8,letterSpacing:3},
  pri:{width:"100%",padding:14,borderRadius:P.r,background:P.cta,border:"none",color:P.ctaTx,fontFamily:P.ft,fontSize:13,fontWeight:700,cursor:"pointer",marginBottom:10,letterSpacing:3},
  sec:{width:"100%",padding:12,borderRadius:P.r,background:"transparent",border:"1px solid "+P.bdrL,color:P.tx,fontFamily:P.ft,fontSize:12,fontWeight:600,cursor:"pointer",marginBottom:8,letterSpacing:2},
  inp:{width:"100%",padding:"12px 14px",borderRadius:P.r,background:P.card,border:"1px solid "+P.bdr,color:P.tx,fontFamily:P.ft,fontSize:14,fontWeight:400,outline:"none",boxSizing:"border-box",marginBottom:14},
  ov:{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(30,28,24,0.5)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100},
  ig:{display:"flex",alignItems:"center",gap:2},
  ib:{width:30,height:32,borderRadius:6,background:P.card,border:"1px solid "+P.bdr,color:P.tx,fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:P.mn},
  ni:{width:"100%",minWidth:0,height:32,textAlign:"center",borderRadius:6,background:P.card,border:"1px solid "+P.bdr,color:P.tx,fontFamily:P.mn,fontSize:13,fontWeight:600,outline:"none"},
};

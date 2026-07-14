import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { getAdminToken } from "../../auth/services/adminSession";
import { createAdminTest } from "../services/adminTestsApi";
import type {
  ExamType, ListeningPart1Question, ListeningPart2Question,
  ListeningPart3Question, ListeningPart4Question,
  ListeningPart5Question, ListeningPart6Question, ListeningPartAudio, ListeningTest,
} from "../types/adminTypes";
import { createId } from "../utils/adminFormatters";
import AdminSectionTitle from "../components/AdminSectionTitle";

const LEVELS = ["A1","A2","B1","B2","C1","C2"];
const EXAM_LABELS: Record<string,string> = {cefr:"CEFR",ielts:"IELTS",toefl:"TOEFL",sat:"SAT"};

const inp: React.CSSProperties = {width:"100%",minHeight:"44px",border:"1px solid #e2e8f0",borderRadius:"10px",padding:"0 14px",font:"inherit",fontSize:"var(--adm-fs-body)",background:"#f8fafc",color:"#0f172a",outline:"none",boxSizing:"border-box"};
const ta: React.CSSProperties = {...inp,minHeight:"90px",padding:"10px 14px",resize:"vertical"} as React.CSSProperties;
const fs: React.CSSProperties = {border:"1px solid #e2e8f0",borderRadius:"12px",padding:"18px 20px",margin:0};
const lg: React.CSSProperties = {fontSize:"var(--adm-fs-sm)",fontWeight:900,color:"#0f172a",padding:"0 8px"};
const lb: React.CSSProperties = {fontSize:"var(--adm-fs-sm)",fontWeight:800,color:"#334155",display:"block",marginBottom:"6px"};
const er: React.CSSProperties = {color:"#be123c",fontSize:"var(--adm-fs-tag)",fontWeight:700,marginTop:"4px",display:"block"};

type PartNum = 1|2|3|4|5|6;

function Btn({l,active,onClick}:{l:string;active:boolean;onClick:()=>void}){
  return <button type="button" onClick={onClick} style={{minWidth:"38px",minHeight:"38px",border:`2px solid ${active?"#2563eb":"#e2e8f0"}`,borderRadius:"8px",background:active?"#2563eb":"#f8fafc",color:active?"#fff":"#334155",fontWeight:900,fontSize:"var(--adm-fs-sm)",cursor:"pointer",transition:"all 120ms"}}>{l}</button>;
}

function AudioPicker({audio,onChange}:{audio:ListeningPartAudio;onChange:(a:ListeningPartAudio)=>void}){
  const ref=useRef<HTMLInputElement>(null);
  return(
    <div>
      <p style={{...lb,marginBottom:"8px"}}>Audio fayl *</p>
      <div onClick={()=>ref.current?.click()} onKeyDown={(e)=>e.key==="Enter"&&ref.current?.click()} role="button" tabIndex={0} aria-label="Audio yuklash"
        style={{cursor:"pointer",border:"2px dashed #93c5fd",borderRadius:"12px",background:audio.audioFileName?"#eff6ff":"#f8fafc",display:"flex",alignItems:"center",gap:"14px",padding:"14px 18px"}}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={audio.audioFileName?"#2563eb":"#93c5fd"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
        </svg>
        <span style={{color:audio.audioFileName?"#1d4ed8":"#64748b",fontWeight:800,fontSize:"var(--adm-fs-sm)"}}>
          {audio.audioFileName?`${audio.audioFileName} (${Math.round(audio.audioFileSize/1024)} KB)`:"Audio yuklash (MP3, WAV, M4A)"}
        </span>
      </div>
      <input ref={ref} type="file" accept="audio/*" style={{display:"none"}}
        onChange={(e)=>{const f=e.target.files?.[0];if(!f)return;const reader=new FileReader();reader.onload=(event)=>onChange({audioFileName:f.name,audioFileSize:f.size,audioDataUrl:event.target?.result as string});reader.readAsDataURL(f);}}/>
    </div>
  );
}

function ImagePicker({value,onChange}:{value:string;onChange:(b:string)=>void}){
  const ref=useRef<HTMLInputElement>(null);
  function load(file?:File){if(!file)return;const r=new FileReader();r.onload=(e)=>onChange(e.target?.result as string);r.readAsDataURL(file);}
  return(
    <div>
      <p style={{...lb,marginBottom:"8px"}}>Rasm *</p>
      <div onClick={()=>ref.current?.click()} onKeyDown={(e)=>e.key==="Enter"&&ref.current?.click()} role="button" tabIndex={0} aria-label="Rasm yuklash"
        style={{cursor:"pointer",border:"2px dashed #93c5fd",borderRadius:"12px",background:value?"transparent":"#eff6ff",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"10px",minHeight:"140px",overflow:"hidden",position:"relative"}}>
        {value?(
          <><img src={value} alt="part4" style={{maxHeight:"130px",maxWidth:"100%",objectFit:"contain",borderRadius:"8px"}}/>
          <span style={{position:"absolute",bottom:"8px",right:"8px",background:"rgba(15,23,42,0.6)",color:"#fff",fontSize:"var(--adm-fs-tag)",fontWeight:800,padding:"3px 8px",borderRadius:"6px"}}>O'zgartirish</span></>
        ):(
          <><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
          <span style={{color:"#64748b",fontSize:"var(--adm-fs-sm)",fontWeight:700}}>Rasm yuklash (PNG, JPG)</span></>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={(e)=>load(e.target.files?.[0])}/>
    </div>
  );
}

const emptyAudio:ListeningPartAudio={audioFileName:"",audioFileSize:0};

// State types
type P1S={audio:ListeningPartAudio;questions:ListeningPart1Question[]};
type P2S={audio:ListeningPartAudio;passage:string;questions:ListeningPart2Question[]};
type P3S={audio:ListeningPartAudio;optionA:string;optionB:string;optionC:string;optionD:string;optionE:string;optionF:string;questions:ListeningPart3Question[]};
type P4S={audio:ListeningPartAudio;imageBase64:string;statementText:string;optionA:string;optionB:string;optionC:string;optionD:string;optionE:string;optionF:string;optionG:string;optionH:string;optionI:string;optionJ:string;optionK:string;questions:ListeningPart4Question[]};
type P5S={audio:ListeningPartAudio;questions:ListeningPart5Question[]};
type P6S={audio:ListeningPartAudio;passage:string;questions:ListeningPart6Question[]};

const mkP1=():P1S=>({audio:{...emptyAudio},questions:Array.from({length:8},()=>({id:createId(),questionText:"",optionA:"",optionB:"",optionC:"",correctAnswer:"A" as const}))});
const mkP2=():P2S=>({audio:{...emptyAudio},passage:"",questions:Array.from({length:6},()=>({id:createId(),answer:""}))});
const mkP3=():P3S=>({audio:{...emptyAudio},optionA:"",optionB:"",optionC:"",optionD:"",optionE:"",optionF:"",questions:Array.from({length:4},()=>({id:createId(),statementText:"",correctAnswer:"A" as const}))});
const mkP4=():P4S=>({audio:{...emptyAudio},imageBase64:"",statementText:"",optionA:"",optionB:"",optionC:"",optionD:"",optionE:"",optionF:"",optionG:"",optionH:"",optionI:"",optionJ:"",optionK:"",questions:Array.from({length:5},()=>({id:createId(),correctAnswer:"A" as const}))});
const mkP5=():P5S=>({audio:{...emptyAudio},questions:Array.from({length:6},()=>({id:createId(),statementText:"",optionA:"",optionB:"",optionC:"",hasD:false,optionD:"",correctAnswer:"A" as const}))});
const mkP6=():P6S=>({audio:{...emptyAudio},passage:"",questions:Array.from({length:6},()=>({id:createId(),answer:""}))});

// ─── Part 1 Editor ────────────────────────────────────────────────
function Part1Editor({s,set}:{s:P1S;set:(v:P1S)=>void}){
  function upQ(i:number,p:Partial<ListeningPart1Question>){set({...s,questions:s.questions.map((q,idx)=>idx===i?{...q,...p}:q)});}
  return(
    <div style={{display:"grid",gap:"20px"}}>
      <AudioPicker audio={s.audio} onChange={(a)=>set({...s,audio:a})}/>
      {s.questions.map((q,i)=>(
        <fieldset key={q.id} style={fs}>
          <legend style={lg}>Savol {i+1}</legend>
          <div style={{display:"grid",gap:"12px",marginTop:"8px"}}>
            <div><label style={lb}>Savol matni *</label><input style={inp} value={q.questionText} placeholder="Savol matni" onChange={(e)=>upQ(i,{questionText:e.target.value})}/></div>
            <div className="admin-form-grid">
              {(["A","B","C"] as const).map((o)=>(
                <div key={o}><label style={lb}>Variant {o} *</label>
                <input style={inp} value={q[`option${o}` as "optionA"|"optionB"|"optionC"]} placeholder={`Variant ${o}`} onChange={(e)=>upQ(i,{[`option${o}`]:e.target.value} as Partial<ListeningPart1Question>)}/></div>
              ))}
            </div>
            <div><p style={{...lb,marginBottom:"8px"}}>To'g'ri javob *</p><div style={{display:"flex",gap:"8px"}}>{(["A","B","C"] as const).map((o)=><Btn key={o} l={o} active={q.correctAnswer===o} onClick={()=>upQ(i,{correctAnswer:o})}/>)}</div></div>
          </div>
        </fieldset>
      ))}
    </div>
  );
}

// ─── Part 2 Editor ────────────────────────────────────────────────
function Part2Editor({s,set}:{s:P2S;set:(v:P2S)=>void}){
  return(
    <div style={{display:"grid",gap:"20px"}}>
      <AudioPicker audio={s.audio} onChange={(a)=>set({...s,audio:a})}/>
      <div><label style={lb}>Matn (passage) *</label><textarea style={ta} rows={5} value={s.passage} placeholder="Listening matni…" onChange={(e)=>set({...s,passage:e.target.value})}/></div>
      <div><p style={{...lb,marginBottom:"12px"}}>Javoblar (6 ta so'z) *</p>
        <div className="admin-form-grid">{s.questions.map((q,i)=>(
          <div key={q.id}><label style={lb}>Bo'sh joy {i+1} *</label>
          <input style={inp} value={q.answer} placeholder="Javob so'z" onChange={(e)=>set({...s,questions:s.questions.map((x,idx)=>idx===i?{...x,answer:e.target.value}:x)})}/></div>
        ))}</div>
      </div>
    </div>
  );
}

// ─── Part 3 Editor ────────────────────────────────────────────────
const P3K=["optionA","optionB","optionC","optionD","optionE","optionF"] as const;
function Part3Editor({s,set}:{s:P3S;set:(v:P3S)=>void}){
  function upQ(i:number,p:Partial<ListeningPart3Question>){set({...s,questions:s.questions.map((q,idx)=>idx===i?{...q,...p}:q)});}
  const OPTS=["A","B","C","D","E","F"] as const;
  return(
    <div style={{display:"grid",gap:"20px"}}>
      <AudioPicker audio={s.audio} onChange={(a)=>set({...s,audio:a})}/>
      <fieldset style={fs}><legend style={lg}>Umumiy variantlar (A–F)</legend>
        <div className="admin-form-grid" style={{marginTop:"8px"}}>{P3K.map((k)=>(
          <div key={k}><label style={lb}>Variant {k.replace("option","")} *</label>
          <input style={inp} value={s[k]} placeholder={`Variant ${k.replace("option","")}`} onChange={(e)=>set({...s,[k]:e.target.value} as P3S)}/></div>
        ))}</div>
      </fieldset>
      {s.questions.map((q,i)=>(
        <fieldset key={q.id} style={fs}><legend style={lg}>Savol {i+1}</legend>
          <div style={{display:"grid",gap:"12px",marginTop:"8px"}}>
            <div><label style={lb}>Ko'rsatma matni *</label><input style={inp} value={q.statementText} placeholder="Ko'rsatma" onChange={(e)=>upQ(i,{statementText:e.target.value})}/></div>
            <div><p style={{...lb,marginBottom:"8px"}}>To'g'ri javob *</p>
              <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>{OPTS.map((o)=><Btn key={o} l={o} active={q.correctAnswer===o} onClick={()=>upQ(i,{correctAnswer:o})}/>)}</div>
            </div>
          </div>
        </fieldset>
      ))}
    </div>
  );
}

// ─── Part 4 Editor ────────────────────────────────────────────────
const P4K=["optionA","optionB","optionC","optionD","optionE","optionF","optionG","optionH","optionI","optionJ","optionK"] as const;
function Part4Editor({s,set}:{s:P4S;set:(v:P4S)=>void}){
  function upQ(i:number,p:Partial<ListeningPart4Question>){set({...s,questions:s.questions.map((q,idx)=>idx===i?{...q,...p}:q)});}
  const OPTS=["A","B","C","D","E","F","G","H","I","J","K"] as const;
  return(
    <div style={{display:"grid",gap:"20px"}}>
      <AudioPicker audio={s.audio} onChange={(a)=>set({...s,audio:a})}/>
      <ImagePicker value={s.imageBase64} onChange={(v)=>set({...s,imageBase64:v})}/>
      <div><label style={lb}>Umumiy shart matni *</label><textarea style={ta} rows={4} value={s.statementText} placeholder="Shart/ko'rsatma matni…" onChange={(e)=>set({...s,statementText:e.target.value})}/></div>
      <fieldset style={fs}><legend style={lg}>Variantlar (A–K)</legend>
        <div className="admin-form-grid" style={{marginTop:"8px"}}>{P4K.map((k)=>(
          <div key={k}><label style={lb}>Variant {k.replace("option","")} *</label>
          <input style={inp} value={s[k]} placeholder={`Variant ${k.replace("option","")}`} onChange={(e)=>set({...s,[k]:e.target.value} as P4S)}/></div>
        ))}</div>
      </fieldset>
      {s.questions.map((q,i)=>(
        <fieldset key={q.id} style={fs}><legend style={lg}>Savol {i+1}</legend>
          <div style={{marginTop:"8px"}}><p style={{...lb,marginBottom:"8px"}}>To'g'ri javob *</p>
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>{OPTS.map((o)=><Btn key={o} l={o} active={q.correctAnswer===o} onClick={()=>upQ(i,{correctAnswer:o})}/>)}</div>
          </div>
        </fieldset>
      ))}
    </div>
  );
}

// ─── Part 5 Editor ────────────────────────────────────────────────
function Part5Editor({s,set}:{s:P5S;set:(v:P5S)=>void}){
  function upQ(i:number,p:Partial<ListeningPart5Question>){set({...s,questions:s.questions.map((q,idx)=>idx===i?{...q,...p}:q)});}
  return(
    <div style={{display:"grid",gap:"20px"}}>
      <AudioPicker audio={s.audio} onChange={(a)=>set({...s,audio:a})}/>
      {s.questions.map((q,i)=>(
        <fieldset key={q.id} style={fs}><legend style={lg}>Savol {i+1}</legend>
          <div style={{display:"grid",gap:"12px",marginTop:"8px"}}>
            <div><label style={lb}>Ko'rsatma matni *</label><textarea style={ta} rows={2} value={q.statementText} placeholder="Ko'rsatma" onChange={(e)=>upQ(i,{statementText:e.target.value})}/></div>
            <div className="admin-form-grid">
              {(["A","B","C"] as const).map((o)=>(
                <div key={o}><label style={lb}>Variant {o} *</label>
                <input style={inp} value={o==="A"?q.optionA:o==="B"?q.optionB:q.optionC} placeholder={`Variant ${o}`} onChange={(e)=>upQ(i,{[`option${o}`]:e.target.value} as Partial<ListeningPart5Question>)}/></div>
              ))}
            </div>
            <label style={{display:"flex",alignItems:"center",gap:"10px",fontSize:"var(--adm-fs-sm)",fontWeight:800,color:"#334155",cursor:"pointer"}}>
              <input type="checkbox" checked={q.hasD} onChange={(e)=>upQ(i,{hasD:e.target.checked})} style={{width:"18px",height:"18px",accentColor:"#2563eb",cursor:"pointer"}}/>D varianti mavjud
            </label>
            {q.hasD&&<div><label style={lb}>Variant D *</label><input style={inp} value={q.optionD} placeholder="Variant D" onChange={(e)=>upQ(i,{optionD:e.target.value})}/></div>}
            <div><p style={{...lb,marginBottom:"8px"}}>To'g'ri javob *</p>
              <div style={{display:"flex",gap:"8px"}}>{(["A","B","C","D"] as const).filter((o)=>o!=="D"||q.hasD).map((o)=><Btn key={o} l={o} active={q.correctAnswer===o} onClick={()=>upQ(i,{correctAnswer:o})}/>)}</div>
            </div>
          </div>
        </fieldset>
      ))}
    </div>
  );
}

// ─── Part 6 Editor ────────────────────────────────────────────────
function Part6Editor({s,set}:{s:P6S;set:(v:P6S)=>void}){
  return(
    <div style={{display:"grid",gap:"20px"}}>
      <AudioPicker audio={s.audio} onChange={(a)=>set({...s,audio:a})}/>
      <div>
        <label style={lb}>Matn (passage) *</label>
        <textarea style={ta} rows={6} value={s.passage}
          placeholder="Bu yerga tinglovchi eshitadigan matni kiriting. Bo'sh joylar ___ bilan belgilanadi…"
          onChange={(e)=>set({...s,passage:e.target.value})}/>
      </div>
      <div>
        <p style={{...lb,marginBottom:"12px"}}>Audiodan eshitilgan so'zlar (6 ta) *</p>
        <div className="admin-form-grid">
          {s.questions.map((q,i)=>(
            <div key={q.id}>
              <label style={lb}>So'z {i+1} *</label>
              <input style={inp} value={q.answer}
                placeholder={`Masalan: environment`}
                onChange={(e)=>set({...s,questions:s.questions.map((x,idx)=>idx===i?{...x,answer:e.target.value}:x)})}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
function AddListeningTestPage(){
  const navigate=useNavigate();
  const {examType:etp="cefr"}=useParams<{examType:string}>();
  const backPath=`/admin/tests/${etp}/listening`;
  const examLabel=EXAM_LABELS[etp.toLowerCase()]??etp.toUpperCase();

  const [testName,setTestName]=useState("");
  const [level,setLevel]=useState("");
  const [activePart,setActivePart]=useState<PartNum>(1);
  const [p1,setP1]=useState<P1S>(mkP1);
  const [p2,setP2]=useState<P2S>(mkP2);
  const [p3,setP3]=useState<P3S>(mkP3);
  const [p4,setP4]=useState<P4S>(mkP4);
  const [p5,setP5]=useState<P5S>(mkP5);
  const [p6,setP6]=useState<P6S>(mkP6);
  const [errors,setErrors]=useState<Record<string,string>>({});
  const [saving,setSaving]=useState(false);
  const [done,setDone]=useState(false);

  const errKeys=Object.keys(errors).filter(v=>v!=="");
  function pErrCount(pn:PartNum){return errKeys.filter((k)=>k.startsWith(`p${pn}`)||k===`audio${pn}`).length;}

  function validate():boolean{
    const e:Record<string,string>={};
    if(!testName.trim())e.testName="Test nomini kiriting";
    if(!level)e.level="Darajani tanlang";

    // Faqat aktiv partni tekshir
    const audioMap:{[k in PartNum]:ListeningPartAudio}={1:p1.audio,2:p2.audio,3:p3.audio,4:p4.audio,5:p5.audio,6:p6.audio};
    if(!audioMap[activePart].audioFileName)e[`audio${activePart}`]=`Part ${activePart} audio faylini tanlang`;

    if(activePart===1){
      p1.questions.forEach((q,i)=>{if(!q.questionText.trim())e[`p1q${i}t`]=`Part 1, Savol ${i+1}`;if(!q.optionA.trim()||!q.optionB.trim()||!q.optionC.trim())e[`p1q${i}o`]=`Part 1, Savol ${i+1} variantlar`;});
    }
    if(activePart===2){
      if(!p2.passage.trim())e.p2passage="Part 2 matni";
      p2.questions.forEach((q,i)=>{if(!q.answer.trim())e[`p2q${i}`]=`Part 2, Bo'sh joy ${i+1}`;});
    }
    if(activePart===3){
      P3K.forEach((k)=>{if(!p3[k].trim())e[`p3${k}`]=`Part 3 variant ${k.replace("option","")}`;});
      p3.questions.forEach((q,i)=>{if(!q.statementText.trim())e[`p3q${i}`]=`Part 3, Savol ${i+1}`;});
    }
    if(activePart===4){
      if(!p4.imageBase64)e.p4image="Part 4 rasm";
      if(!p4.statementText.trim())e.p4stmt="Part 4 shart";
      P4K.forEach((k)=>{if(!p4[k].trim())e[`p4${k}`]=`Part 4 variant ${k.replace("option","")}`;});
    }
    if(activePart===5){
      p5.questions.forEach((q,i)=>{if(!q.statementText.trim()||!q.optionA.trim()||!q.optionB.trim()||!q.optionC.trim())e[`p5q${i}`]=`Part 5, Savol ${i+1}`;if(q.hasD&&!q.optionD.trim())e[`p5q${i}d`]=`Part 5, Savol ${i+1} D`;});
    }
    if(activePart===6){
      if(!p6.passage.trim())e.p6passage="Part 6 matni";
      p6.questions.forEach((q,i)=>{if(!q.answer.trim())e[`p6q${i}`]=`Part 6, So'z ${i+1}`;});
    }

    setErrors(e);
    return Object.keys(e).length===0;
  }

  async function handleSave(){
    if(!validate())return;
    setSaving(true);
    try{
      const exam=examLabel as ExamType;
      const partMap={
        1:{type:"part1" as const,audio:p1.audio,questions:p1.questions},
        2:{type:"part2" as const,audio:p2.audio,passage:p2.passage,questions:p2.questions},
        3:{type:"part3" as const,audio:p3.audio,optionA:p3.optionA,optionB:p3.optionB,optionC:p3.optionC,optionD:p3.optionD,optionE:p3.optionE,optionF:p3.optionF,questions:p3.questions},
        4:{type:"part4" as const,audio:p4.audio,imageBase64:p4.imageBase64,statementText:p4.statementText,optionA:p4.optionA,optionB:p4.optionB,optionC:p4.optionC,optionD:p4.optionD,optionE:p4.optionE,optionF:p4.optionF,optionG:p4.optionG,optionH:p4.optionH,optionI:p4.optionI,optionJ:p4.optionJ,optionK:p4.optionK,questions:p4.questions},
        5:{type:"part5" as const,audio:p5.audio,questions:p5.questions},
        6:{type:"part6" as const,audio:p6.audio,passage:p6.passage,questions:p6.questions},
      };
      const token = getAdminToken();
      if (!token) {
        setErrors({ auth: "Admin token topilmadi. Qayta login qiling." });
        return;
      }
      const newTest={examType:exam,testName:testName.trim(),level,part:partMap[activePart]};
      await createAdminTest<ListeningTest>(token, "listening", newTest);
      setDone(true);
      setTimeout(()=>navigate(backPath),1400);
    }finally{setSaving(false);}
  }

  function handleReset(){
    setTestName("");setLevel("");setActivePart(1);
    setP1(mkP1());setP2(mkP2());setP3(mkP3());setP4(mkP4());setP5(mkP5());setP6(mkP6());
    setErrors({});setDone(false);
  }

  return(
    <section className="admin-table-section admin-test-editor">
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"16px",flexWrap:"wrap"}}>
        <AdminSectionTitle title={`Yangi ${examLabel} Listening testi`} description="Barcha qismlarni to'ldiring va saqlang." meta={examLabel}/>
        <div style={{padding:"18px 20px 0 0"}}>
          <button type="button" onClick={()=>navigate(backPath)} style={{minHeight:"42px",padding:"0 18px",border:"1px solid #e2e8f0",borderRadius:"10px",background:"#f8fafc",cursor:"pointer",fontWeight:800,fontSize:"var(--adm-fs-sm)",color:"#475569"}}>← Orqaga</button>
        </div>
      </div>

      {done&&<div style={{margin:"16px 20px 0",padding:"14px 18px",borderRadius:"10px",background:"#dcfce7",border:"1px solid #86efac",color:"#166534",fontSize:"var(--adm-fs-body)",fontWeight:800}}>✓ Test muvaffaqiyatli saqlandi! Yo'naltirilmoqda…</div>}
      {!done&&errKeys.length>0&&<div style={{margin:"16px 20px 0",padding:"12px 18px",borderRadius:"10px",background:"#fef2f2",border:"1px solid #fca5a5",color:"#be123c",fontSize:"var(--adm-fs-sm)",fontWeight:800}}>⚠ {errKeys.length} ta maydon to'ldirilmagan.</div>}

      <div style={{padding:"24px 20px",display:"grid",gap:"28px"}}>
        <fieldset style={fs}><legend style={lg}>Test ma'lumotlari</legend>
          <div className="admin-form-grid" style={{marginTop:"8px"}}>
            <div><label style={lb}>Test nomi *</label>
              <input style={{...inp,borderColor:errors.testName?"#cf6d6dff":undefined}} value={testName} placeholder="Test nomi" onChange={(e)=>{setTestName(e.target.value);setErrors((p)=>({...p,testName:""}));}}/>
              {errors.testName&&<span style={er}>{errors.testName}</span>}
            </div>
            <div><label style={lb}>Daraja *</label>
              <select style={{...inp,cursor:"pointer",borderColor:errors.level?"#e68181ff":undefined}} value={level} onChange={(e)=>{setLevel(e.target.value);setErrors((p)=>({...p,level:""}));}}>
                <option value="">— Darajani tanlang —</option>
                {LEVELS.map((l)=><option key={l} value={l}>{l}</option>)}
              </select>
              {errors.level&&<span style={er}>{errors.level}</span>}
            </div>
          </div>
        </fieldset>

        <div>
          <p style={{fontSize:"var(--adm-fs-sm)",fontWeight:900,color:"#334155",marginBottom:"10px"}}>Qismni tanlang</p>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            {([1,2,3,4,5,6] as PartNum[]).map((pn)=>{
              const ec=pErrCount(pn);const active=activePart===pn;
              return(<button key={pn} type="button" onClick={()=>setActivePart(pn)} style={{position:"relative",minHeight:"44px",padding:"0 22px",border:`2px solid ${active?"#2563eb":ec>0?"#fca5a5":"#e2e8f0"}`,borderRadius:"10px",background:active?"#2563eb":ec>0?"#fef2f2":"#f8fafc",color:active?"#fff":ec>0?"#be123c":"#334155",fontWeight:900,fontSize:"var(--adm-fs-body)",cursor:"pointer",transition:"all 150ms"}}>
                Part {pn}
                {ec>0&&<span style={{position:"absolute",top:"-8px",right:"-8px",minWidth:"20px",height:"20px",padding:"0 5px",borderRadius:"999px",background:"#be123c",color:"#fff",fontSize:"11px",fontWeight:900,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>{ec}</span>}
              </button>);
            })}
          </div>
        </div>

        <div>
          {activePart===1&&<fieldset style={fs}><legend style={lg}>Part 1 — MCQ (8 ta savol, A/B/C)</legend><div style={{marginTop:"8px"}}><Part1Editor s={p1} set={setP1}/></div></fieldset>}
          {activePart===2&&<fieldset style={fs}><legend style={lg}>Part 2 — Gap fill (6 ta so'z)</legend><div style={{marginTop:"8px"}}><Part2Editor s={p2} set={setP2}/></div></fieldset>}
          {activePart===3&&<fieldset style={fs}><legend style={lg}>Part 3 — Matching (4 ta savol, 6 ta variant)</legend><div style={{marginTop:"8px"}}><Part3Editor s={p3} set={setP3}/></div></fieldset>}
          {activePart===4&&<fieldset style={fs}><legend style={lg}>Part 4 — Rasm (5 ta savol, A–K)</legend><div style={{marginTop:"8px"}}><Part4Editor s={p4} set={setP4}/></div></fieldset>}
          {activePart===5&&<fieldset style={fs}><legend style={lg}>Part 5 — MCQ+ (6 ta savol, A/B/C/D)</legend><div style={{marginTop:"8px"}}><Part5Editor s={p5} set={setP5}/></div></fieldset>}
          {activePart===6&&<fieldset style={fs}><legend style={lg}>Part 6 — So'z kiritish (6 ta savol)</legend><div style={{marginTop:"8px"}}><Part6Editor s={p6} set={setP6}/></div></fieldset>}
        </div>

        <div style={{display:"flex",gap:"12px",justifyContent:"flex-end",paddingTop:"8px",borderTop:"1px solid #e2e8f0"}}>
          <button type="button" onClick={handleReset} style={{minHeight:"46px",padding:"0 24px",border:"1px solid #e2e8f0",borderRadius:"10px",background:"#d5e5f5ff",cursor:"pointer",fontWeight:800,fontSize:"var(--adm-fs-body)",color:"#475569"}}>Tozalash</button>
          <button type="button" onClick={()=>navigate(backPath)} style={{minHeight:"46px",padding:"0 24px",border:"1px solid #e2e8f0",borderRadius:"10px",background:"#f8fafc",cursor:"pointer",fontWeight:800,fontSize:"var(--adm-fs-body)",color:"#475569"}}>Bekor qilish</button>
          <button type="button" onClick={handleSave} disabled={saving||done} style={{minHeight:"46px",padding:"0 32px",border:"none",borderRadius:"10px",background:saving||done?"#1168ccff":"#07215aff",color:"#f3eaeaff",cursor:saving||done?"not-allowed":"pointer",fontWeight:900,fontSize:"var(--adm-fs-body)",transition:"background 150ms"}}>
            {saving?"Saqlanmoqda…":done?"Saqlandi ✓":"Testni saqlash"}
          </button>
        </div>
      </div>
    </section>
  );
}  
export default AddListeningTestPage;

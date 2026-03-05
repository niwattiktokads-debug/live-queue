import { useState, useCallback } from "react";
const DAYS = ["จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์","อาทิตย์"];
const DAYS_SHORT = ["จ","อ","พ","พฤ","ศ","ส","อา"];
const TIME_SLOTS = [
  "9.00-11.00","11.00-13.00","13.00-15.00","15.00-17.00",
  "17.00-19.00","19.00-20.00","20.00-22.00","22.00-24.00",
];
const SLOT_COLORS = ["#FFE0E0","#FFF3D0","#D0F0FF","#E0FFE0","#F0E0FF","#FFE8D0","#D0FFE8","#FFD0E8"];
const MC_COLORS   = ["#FFEAA7","#81ECEC","#A29BFE","#FF7675","#74B9FF","#55EFC4","#FDCB6E","#FD79A8"];
const INIT_MC = [
  { id:1, name:"คุณนิดยา",   size:"2XL", rate:"100", time:"20.00-22.00 น.", note:"(ทุกวัน) พฤ ได้ทั้งวัน", color:"#FFEAA7", username:"nidya",   password:"1234" },
  { id:2, name:"คุณมิ้น",    size:"XL",  rate:"100", time:"13.00-18.00 น.", note:"(พฤ-อาทิตย์)",           color:"#81ECEC", username:"min",     password:"1234" },
  { id:3, name:"คุณการ์ตูน", size:"XL",  rate:"120", time:"9.00-17.00 น.",  note:"(จ-ศ)",                  color:"#A29BFE", username:"cartoon", password:"1234" },
  { id:4, name:"คุณแอน",     size:"S",   rate:"150", time:"9.00-18.00 น.",  note:"(ทุกวัน)",               color:"#FF7675", username:"ann",     password:"1234" },
  { id:5, name:"คุณฟ้าใส",   size:"M",   rate:"200", time:"9.00-11.00/17.00-20.00", note:"(ทุกวัน)",       color:"#74B9FF", username:"fahsai",  password:"1234" },
  { id:6, name:"คุณฝน",      size:"M",   rate:"250", time:"20.00-22.00 น.", note:"(ทุกวัน)",               color:"#55EFC4", username:"fon",     password:"1234" },
];
const ADMIN = { username:"admin", password:"admin1234", role:"admin", displayName:"แอดมิน" };
function getWeekDates() {
  const today = new Date();
  const day = today.getDay();
  const offset = day === 0 ? 1 : -(day - 1);
  const monday = new Date(today);
  monday.setDate(today.getDate() + offset);
  monday.setHours(0,0,0,0);
  return Array.from({ length:7 }, (_,i) => { const d=new Date(monday); d.setDate(monday.getDate()+i); return d; });
}
function isPastDay(date) {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(date); d.setHours(0,0,0,0);
  return d < today;
}
const fmt  = d => `${d.getDate()}/${d.getMonth()+1}`;
const dKey = d => d.toISOString().split("T")[0];
const inp  = (ex={}) => ({ width:"100%", padding:"12px 14px", borderRadius:12, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box", ...ex });
/* ── Login Modal ─────────────────────────────────────── */
function LoginModal({ mcList, onLogin, onClose, message="" }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const handle = () => {
    if (username.trim().toLowerCase() === ADMIN.username && password === ADMIN.password) { onLogin({ ...ADMIN }); return; }
    const mc = mcList.find(m => m.username === username.trim().toLowerCase() && m.password === password);
    if (mc) { onLogin({ role:"mc", displayName:mc.name, mcId:mc.id }); return; }
    setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"); setTimeout(()=>setError(""), 2500);
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(10px)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:2000 }}
      onClick={e => { if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:"linear-gradient(160deg,#1e1e3a,#2a1a40)", borderRadius:"24px 24px 0 0", padding:"28px 24px 36px", width:"100%", maxWidth:480, border:"1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ width:40, height:4, borderRadius:2, background:"rgba(255,255,255,0.2)", margin:"0 auto 24px" }}/>
        <div style={{ textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🔐</div>
          <h2 style={{ margin:0, fontSize:20, fontWeight:800, background:"linear-gradient(135deg,#C4B5FD,#F9A8D4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>เข้าสู่ระบบ</h2>
          {message && <p style={{ margin:"6px 0 0", fontSize:13, color:"rgba(255,255,255,0.4)" }}>{message}</p>}
        </div>
        {error && <div style={{ padding:"10px 14px", borderRadius:10, marginBottom:12, background:"rgba(239,68,68,0.15)", color:"#FCA5A5", fontSize:13, fontWeight:600, textAlign:"center" }}>{error}</div>}
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" onKeyDown={e=>e.key==="Enter"&&handle()} style={{ ...inp(), marginBottom:10 }}/>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" onKeyDown={e=>e.key==="Enter"&&handle()} style={{ ...inp(), marginBottom:18 }}/>
        <button onClick={handle} style={{ width:"100%", padding:16, borderRadius:14, background:"linear-gradient(135deg,#8B5CF6,#EC4899)", border:"none", color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>เข้าสู่ระบบ</button>
        <p style={{ textAlign:"center", marginTop:12, fontSize:11, color:"rgba(255,255,255,0.25)" }}>Admin: admin / admin1234</p>
      </div>
    </div>
  );
}
/* ── Main ────────────────────────────────────────────── */
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [weekDates]   = useState(getWeekDates);
  const [bookings, setBookings]   = useState({});
  const [mcList, setMcList]       = useState(INIT_MC);
  const [showLogin, setShowLogin] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [pendingSlot, setPendingSlot]   = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingName, setBookingName]   = useState("");
  const [selectedMC, setSelectedMC]     = useState("");
  const [clothingSize, setClothingSize] = useState("M");
  const [showBookModal, setShowBookModal]   = useState(false);
  const [showSlotDetail, setShowSlotDetail] = useState(null);
  const [viewMode, setViewMode] = useState("schedule");
  const [adminTab, setAdminTab] = useState("mc");
  const [showMcModal, setShowMcModal] = useState(false);
  const [editingMc, setEditingMc]     = useState(null);
  const [mcForm, setMcForm] = useState({ name:"",size:"M",rate:"",time:"",note:"",username:"",password:"" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const isAdmin = currentUser?.role === "admin";
  const weekRange = weekDates.length ? `${fmt(weekDates[0])} - ${fmt(weekDates[6])}` : "";
  const currentMcData = !isAdmin && currentUser ? mcList.find(m => m.name === currentUser.displayName) : null;
  const showToast = useCallback((msg, type="error") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); }, []);
  const handleLogin = (user) => {
    setCurrentUser(user); setShowLogin(false);
    if (pendingSlot) {
      setSelectedSlot(pendingSlot);
      setBookingName(user.displayName);
      setShowBookModal(true);
      setPendingSlot(null);
    }
  };
  const countDay  = (name, dk) => Object.entries(bookings).filter(([k,v])=>k.startsWith(dk)&&v.name===name).length;
  const countWeek = name => Object.values(bookings).filter(b=>b.name===name).length;
  const handleSlotClick = (di, si) => {
    const dk = dKey(weekDates[di]); const key = `${dk}_slot${si}`;
    if (bookings[key]) {
      if (isAdmin) { setShowSlotDetail({ key, booking:bookings[key] }); return; }
      showToast("สล็อตนี้ถูกจองแล้ว!"); return;
    }
    if (!currentUser) { setPendingSlot({di,si,key,dk}); setLoginMessage("กรุณาเข้าสู่ระบบเพื่อจองคิวไลฟ์ 📅"); setShowLogin(true); return; }
    setSelectedSlot({di,si,key,dk}); setBookingName(currentUser.displayName); setShowBookModal(true);
  };
  const handleBook = () => {
    if (!bookingName.trim()) { showToast("กรุณากรอกชื่อผู้จอง"); return; }
    const mcName = isAdmin ? selectedMC : currentUser.displayName;
    const mcSize = isAdmin ? clothingSize : (currentMcData?.size || "M");
    if (!mcName) { showToast("กรุณาเลือก MC"); return; }
    if (countDay(bookingName.trim(), selectedSlot.dk) >= 2) { showToast("จองได้สูงสุด 2 ครั้ง/วัน!"); return; }
    if (countWeek(bookingName.trim()) >= 14) { showToast("จองเต็มโควต้าแล้ว!"); return; }
    setBookings(prev => ({ ...prev, [selectedSlot.key]:{ name:bookingName.trim(), mc:mcName, size:mcSize, day:DAYS[selectedSlot.di], time:TIME_SLOTS[selectedSlot.si], date:fmt(weekDates[selectedSlot.di]), bookedBy:currentUser.displayName } }));
    showToast("จองสำเร็จ! 🎉","success");
    setShowBookModal(false); setBookingName(""); setSelectedMC("");
  };
  const handleCancelBooking = key => {
    const b = bookings[key];
    if (!isAdmin && b.bookedBy !== currentUser?.displayName) { showToast("ไม่สามารถยกเลิกของคนอื่นได้"); return; }
    setBookings(prev => { const n={...prev}; delete n[key]; return n; });
    setShowSlotDetail(null); showToast("ยกเลิกการจองแล้ว","success");
  };
  const openAddMc  = () => { setEditingMc(null); setMcForm({name:"",size:"M",rate:"",time:"",note:"",username:"",password:""}); setShowMcModal(true); };
  const openEditMc = mc => { setEditingMc(mc); setMcForm({name:mc.name,size:mc.size,rate:mc.rate,time:mc.time,note:mc.note,username:mc.username,password:mc.password}); setShowMcModal(true); };
  const saveMc = () => {
    if (!mcForm.name.trim()||!mcForm.username.trim()||!mcForm.password.trim()) { showToast("กรุณากรอกข้อมูลให้ครบ"); return; }
    if (!/^\d{10}$/.test(mcForm.password)) { showToast("เบอร์โทรต้องเป็นตัวเลข 10 หลักเท่านั้น"); return; }
    if (editingMc) { setMcList(prev => prev.map(m => m.id===editingMc.id ? {...m,...mcForm} : m)); showToast("แก้ไขสำเร็จ","success"); }
    else { setMcList(prev => [...prev, { id:Date.now(),...mcForm, color:MC_COLORS[mcList.length%MC_COLORS.length] }]); showToast("เพิ่ม MC สำเร็จ 🎉","success"); }
    setShowMcModal(false);
  };
  const myBookings = currentUser ? (isAdmin ? bookings : Object.fromEntries(Object.entries(bookings).filter(([_,b])=>b.bookedBy===currentUser.displayName))) : {};
  const navItems = [
    { key:"schedule",    icon:"📅", label:"ตาราง" },
    { key:"mc_info",     icon:"🎤", label:"MC" },
    ...(currentUser ? [{ key:"my_bookings", icon:"📋", label: isAdmin?"การจอง":"ของฉัน" }] : []),
    ...(isAdmin      ? [{ key:"admin",      icon:"⚙️", label:"หลังบ้าน" }] : []),
  ];
  /* ── CELL SIZE ── 44px square ── */
  const CELL = 44;
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0c0c1d,#1a1a3e,#2d1b4e)", fontFamily:"'Sarabun','Noto Sans Thai',sans-serif", color:"#E8E8F0", display:"flex", justifyContent:"center" }}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap" rel="stylesheet"/>
      {/* Phone shell */}
      <div style={{ width:"100%", maxWidth:420, minHeight:"100vh", display:"flex", flexDirection:"column", position:"relative", background:"linear-gradient(160deg,#0c0c1d,#1a1a3e,#2d1b4e)" }}>
        {/* Toast */}
        {toast && (
          <div style={{ position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", zIndex:9999, padding:"11px 22px", borderRadius:20, background:toast.type==="success"?"linear-gradient(135deg,#10B981,#059669)":"linear-gradient(135deg,#EF4444,#DC2626)", color:"#fff", fontWeight:700, fontSize:13, boxShadow:"0 4px 20px rgba(0,0,0,0.4)", whiteSpace:"nowrap" }}>
            {toast.msg}
          </div>
        )}
        {/* ── TOP BAR ── */}
        <div style={{ padding:"14px 18px 10px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(0,0,0,0.25)", backdropFilter:"blur(12px)", position:"sticky", top:0, zIndex:100 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:20 }}>📺</span>
            <div>
              <div style={{ fontWeight:800, fontSize:14, background:"linear-gradient(135deg,#C4B5FD,#F9A8D4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", lineHeight:1.2 }}>Weekly Live Queue</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>สัปดาห์ {weekRange}</div>
            </div>
          </div>
          {!currentUser ? (
            <button onClick={() => { setLoginMessage(""); setShowLogin(true); }}
              style={{ padding:"8px 16px", borderRadius:20, background:"linear-gradient(135deg,#8B5CF6,#7C3AED)", border:"none", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 2px 10px rgba(139,92,246,0.4)" }}>
              🔑 เข้าสู่ระบบ
            </button>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              <div style={{ padding:"6px 12px", borderRadius:20, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", fontSize:12, fontWeight:700, color: isAdmin?"#FBBF24":"#C4B5FD" }}>
                {isAdmin?"👑":"🎤"} {currentUser.displayName}
              </div>
              <button onClick={() => { setCurrentUser(null); setViewMode("schedule"); }}
                style={{ width:32, height:32, borderRadius:16, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)", fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
            </div>
          )}
        </div>
        {/* ── CONTENT ── */}
        <div style={{ flex:1, overflowY:"auto", paddingBottom:80 }}>
          {/* ══ SCHEDULE ══ */}
          {viewMode==="schedule" && (
            <div style={{ padding:"14px 0 8px" }}>
              {/* Note */}
              <div style={{ margin:"0 16px 12px", display:"flex", alignItems:"center", gap:8, padding:"9px 14px", borderRadius:12, background:"rgba(251,191,36,0.08)", border:"1px solid rgba(251,191,36,0.2)" }}>
                <span style={{ fontSize:14 }}>📌</span>
                <span style={{ fontSize:12, color:"#FCD34D", fontWeight:600 }}>แต่ละวันจองได้สูงสุด 2 รอบ / คน</span>
              </div>
              {/* Grid — scrollable horizontally */}
              <div style={{ overflowX:"auto", paddingBottom:4 }}>
                <div style={{ display:"inline-flex", flexDirection:"column", minWidth:"100%", paddingLeft:16 }}>
                  {/* Time header */}
                  <div style={{ display:"flex", marginBottom:2 }}>
                    <div style={{ width:48, flexShrink:0 }}/>
                    {TIME_SLOTS.map((s,i) => (
                      <div key={i} style={{ width:CELL, flexShrink:0, textAlign:"center", fontSize:7, fontWeight:600, color:"rgba(255,255,255,0.35)", padding:"0 1px", lineHeight:1.3 }}>{s}</div>
                    ))}
                  </div>
                  {/* Rows */}
                  {DAYS.map((day,di) => {
                    const past = isPastDay(weekDates[di]);
                    return (
                      <div key={day} style={{ display:"flex", marginBottom:3 }}>
                        {/* Day label */}
                        <div style={{ width:48, flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", opacity: past?0.4:1 }}>
                          <div style={{ fontSize:11, fontWeight:700 }}>{DAYS_SHORT[di]}</div>
                          <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)" }}>{fmt(weekDates[di])}</div>
                        </div>
                        {/* Cells */}
                        {TIME_SLOTS.map((_,si) => {
                          const key = `${dKey(weekDates[di])}_slot${si}`;
                          const b   = bookings[key];
                          const mcColor = INIT_MC.find(m=>m.name===b?.mc)?.color;
                          const sc  = mcColor || SLOT_COLORS[(di+si)%SLOT_COLORS.length];
                          return (
                            <div key={si} onClick={() => !past && handleSlotClick(di,si)}
                              style={{ width:CELL, height:CELL, flexShrink:0, margin:"0 1.5px", borderRadius:10, cursor:past?"not-allowed":"pointer", background: past?"rgba(255,255,255,0.03)": b?sc:"rgba(255,255,255,0.05)", border: past?"1px solid rgba(255,255,255,0.04)": b?`1px solid ${sc}`:"1px solid rgba(255,255,255,0.08)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", transition:"all 0.15s", opacity:past?0.4:1, boxSizing:"border-box" }}
                              onMouseEnter={e => { if(!past&&!b) e.currentTarget.style.background="rgba(139,92,246,0.2)"; }}
                              onMouseLeave={e => { if(!past&&!b) e.currentTarget.style.background="rgba(255,255,255,0.05)"; }}>
                              {past ? (
                                <span style={{ fontSize:12, opacity:0.4 }}>🔒</span>
                              ) : b ? (
                                <>
                                  <div style={{ fontSize:8, fontWeight:800, color:"#1a1a2e", textAlign:"center", lineHeight:1.2, wordBreak:"break-word", padding:"0 2px" }}>{b.name.replace("คุณ","")}</div>
                                  <div style={{ fontSize:7, color:"rgba(0,0,0,0.5)", marginTop:1 }}>{b.size}</div>
                                </>
                              ) : (
                                <span style={{ fontSize:16, color:"rgba(255,255,255,0.15)" }}>+</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Legend */}
              <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:10, fontSize:10, color:"rgba(255,255,255,0.3)" }}>
                <span>⬜ ว่าง</span><span>🟩 จองแล้ว</span><span>🔒 ผ่านแล้ว</span>
              </div>
            </div>
          )}
          {/* ══ MC INFO ══ */}
          {viewMode==="mc_info" && (
            <div style={{ padding:"14px 16px" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {mcList.map(mc => (
                  <div key={mc.id} style={{ background:"rgba(255,255,255,0.04)", borderRadius:16, padding:"14px 16px", border:"1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:44, height:44, borderRadius:12, background:mc.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, color:"#1a1a2e", flexShrink:0 }}>{mc.name.replace("คุณ","").charAt(0)}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:15 }}>{mc.name}</div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:1 }}>Size {mc.size} • {mc.time}</div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:1 }}>📞 {mc.password}</div>
                      </div>
                      {(isAdmin || currentUser?.displayName === mc.name) && (
                        <div style={{ fontSize:13, fontWeight:700, color:"#FBBF24" }}>{mc.rate}/ชม</div>
                      )}
                    </div>
                    <div style={{ marginTop:8, padding:"5px 10px", borderRadius:8, background:"rgba(139,92,246,0.1)", fontSize:11, color:"rgba(255,255,255,0.5)", textAlign:"center" }}>{mc.note}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* ══ MY BOOKINGS ══ */}
          {viewMode==="my_bookings" && currentUser && (
            <div style={{ padding:"14px 16px" }}>
              {(() => {
                const entries = Object.entries(myBookings);
                // คำนวณชั่วโมงจาก time slot เช่น "9.00-11.00" = 2 ชม
                const calcHours = (timeStr) => {
                  const parts = timeStr.replace(/\s/g,"").split("-");
                  if (parts.length < 2) return 1;
                  const toNum = s => { const [h,m="0"] = s.split("."); return parseFloat(h) + parseFloat(m)/60; };
                  return Math.max(toNum(parts[1]) - toNum(parts[0]), 0);
                };
                // ยอดรวมของแต่ละ booking
                const totalEarning = entries.reduce((sum,[_,b]) => {
                  const mc = mcList.find(m => m.name === b.mc);
                  const rate = parseFloat(mc?.rate || "0");
                  const hrs  = calcHours(b.time);
                  return sum + (rate * hrs);
                }, 0);
                return (
                  <>
                    {entries.length === 0
                      ? <div style={{ textAlign:"center", padding:48, color:"rgba(255,255,255,0.3)" }}><div style={{ fontSize:40, marginBottom:10 }}>📭</div>ยังไม่มีการจอง</div>
                      : <>
                          {/* ยอดรวม */}
                          <div style={{ background:"linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.1))", border:"1px solid rgba(16,185,129,0.3)", borderRadius:16, padding:"16px 18px", marginBottom:14 }}>
                            <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:4 }}>💰 ยอดรวมที่คาดว่าจะได้รับ</div>
                            <div style={{ fontSize:28, fontWeight:800, color:"#34D399", lineHeight:1 }}>
                              {totalEarning.toLocaleString()} <span style={{ fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.5)" }}>บาท</span>
                            </div>
                            <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:6 }}>จาก {entries.length} การจอง สัปดาห์นี้</div>
                          </div>
                          {/* รายการ */}
                          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                            {entries.map(([key,b]) => {
                              const mc   = mcList.find(m => m.name === b.mc);
                              const rate = parseFloat(mc?.rate || "0");
                              const hrs  = calcHours(b.time);
                              const earn = rate * hrs;
                              return (
                                <div key={key} style={{ background:"rgba(255,255,255,0.04)", borderRadius:14, padding:"14px 16px", border:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", gap:12 }}>
                                  <div style={{ width:8, height:52, borderRadius:4, background:mc?.color||"#8B5CF6", flexShrink:0 }}/>
                                  <div style={{ flex:1 }}>
                                    <div style={{ fontWeight:700, fontSize:14 }}>{b.name} <span style={{ fontSize:10, padding:"2px 7px", background:"rgba(139,92,246,0.2)", borderRadius:5, color:"#C4B5FD" }}>{b.size}</span></div>
                                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginTop:2 }}>{b.day} {b.date} • {b.time} น.</div>
                                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:1 }}>🎤 {b.mc} • {hrs} ชม × {rate} บาท</div>
                                  </div>
                                  <div style={{ textAlign:"right", flexShrink:0 }}>
                                    <div style={{ fontSize:15, fontWeight:800, color:"#34D399" }}>{earn.toLocaleString()}</div>
                                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", marginBottom:6 }}>บาท</div>
                                    <button onClick={()=>handleCancelBooking(key)} style={{ padding:"6px 10px", borderRadius:9, background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.25)", color:"#FCA5A5", fontWeight:600, fontSize:10, cursor:"pointer", fontFamily:"inherit" }}>ยกเลิก</button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                    }
                  </>
                );
              })()}
            </div>
          )}
          {/* ══ ADMIN PANEL ══ */}
          {viewMode==="admin" && isAdmin && (
            <div style={{ padding:"14px 16px" }}>
              {/* sub tabs */}
              <div style={{ display:"flex", gap:6, marginBottom:16, overflowX:"auto", paddingBottom:4 }}>
                {[{key:"mc",label:"🎤 MC"},{key:"users",label:"👥 Login"},{key:"bookings",label:"📋 การจอง"}].map(t=>(
                  <button key={t.key} onClick={()=>setAdminTab(t.key)} style={{ padding:"9px 16px", borderRadius:20, border:adminTab===t.key?"1px solid rgba(245,158,11,0.4)":"1px solid transparent", background:adminTab===t.key?"rgba(245,158,11,0.15)":"rgba(255,255,255,0.05)", color:adminTab===t.key?"#FBBF24":"rgba(255,255,255,0.45)", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>{t.label}</button>
                ))}
              </div>
              {/* MC tab */}
              {adminTab==="mc" && (
                <div>
                  <button onClick={openAddMc} style={{ width:"100%", padding:14, borderRadius:14, background:"linear-gradient(135deg,#8B5CF6,#7C3AED)", border:"none", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit", marginBottom:14 }}>➕ เพิ่ม MC ใหม่</button>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {mcList.map(mc=>(
                      <div key={mc.id} style={{ background:"rgba(255,255,255,0.04)", borderRadius:14, padding:"14px 16px", border:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:40, height:40, borderRadius:10, background:mc.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:"#1a1a2e", flexShrink:0 }}>{mc.name.replace("คุณ","").charAt(0)}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:700, fontSize:14 }}>{mc.name}</div>
                          <div style={{ fontSize:11, color:"#FBBF24" }}>💰 {mc.rate}/ชม • 🔑 @{mc.username}</div>
                        </div>
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={()=>openEditMc(mc)} style={{ padding:"7px 12px", borderRadius:9, background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.3)", color:"#C4B5FD", fontWeight:600, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>แก้ไข</button>
                          <button onClick={()=>setDeleteConfirm({type:"mc",id:mc.id,name:mc.name})} style={{ padding:"7px 12px", borderRadius:9, background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.25)", color:"#FCA5A5", fontWeight:600, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>ลบ</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Users tab */}
              {adminTab==="users" && (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <div style={{ background:"rgba(245,158,11,0.08)", borderRadius:14, padding:"14px 16px", border:"1px solid rgba(245,158,11,0.2)" }}>
                    <div style={{ fontWeight:700, fontSize:14, color:"#FBBF24", marginBottom:4 }}>👑 แอดมิน</div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontFamily:"monospace" }}>admin / admin1234</div>
                  </div>
                  {mcList.map(mc=>(
                    <div key={mc.id} style={{ background:"rgba(255,255,255,0.04)", borderRadius:14, padding:"14px 16px", border:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:9, background:mc.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:800, color:"#1a1a2e", flexShrink:0 }}>{mc.name.replace("คุณ","").charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:13 }}>{mc.name}</div>
                        <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", fontFamily:"monospace" }}>{mc.username} / {mc.password}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Bookings tab */}
              {adminTab==="bookings" && (
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div style={{ fontSize:14, fontWeight:700 }}>ทั้งหมด {Object.keys(bookings).length} รายการ</div>
                    {Object.keys(bookings).length>0&&<button onClick={()=>setDeleteConfirm({type:"allBookings"})} style={{ padding:"8px 14px", borderRadius:10, background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.25)", color:"#FCA5A5", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>🗑️ ล้างทั้งหมด</button>}
                  </div>
                  {Object.keys(bookings).length===0
                    ? <div style={{ textAlign:"center", padding:40, color:"rgba(255,255,255,0.3)" }}>📭 ไม่มีการจอง</div>
                    : <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                        {Object.entries(bookings).map(([key,b])=>{
                          const mc = mcList.find(m=>m.name===b.mc);
                          return (
                            <div key={key} style={{ background:"rgba(255,255,255,0.04)", borderRadius:12, padding:"12px 14px", border:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", gap:10 }}>
                              <div style={{ width:6, height:40, borderRadius:3, background:mc?.color||"#8B5CF6", flexShrink:0 }}/>
                              <div style={{ flex:1 }}>
                                <div style={{ fontWeight:700, fontSize:13 }}>{b.name} <span style={{ fontSize:9, padding:"2px 6px", background:"rgba(139,92,246,0.2)", borderRadius:4, color:"#C4B5FD" }}>{b.size}</span></div>
                                <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:1 }}>{b.day} {b.date} • {b.time}</div>
                                <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:1 }}>🎤 {b.mc}</div>
                              </div>
                              <button onClick={()=>handleCancelBooking(key)} style={{ padding:"6px 12px", borderRadius:8, background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.25)", color:"#FCA5A5", fontWeight:600, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>ลบ</button>
                            </div>
                          );
                        })}
                      </div>
                  }
                </div>
              )}
            </div>
          )}
        </div>
        {/* ── BOTTOM NAV ── */}
        <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:420, background:"rgba(10,10,28,0.95)", backdropFilter:"blur(16px)", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", zIndex:100, paddingBottom:"env(safe-area-inset-bottom)" }}>
          {navItems.map(item => (
            <button key={item.key} onClick={() => setViewMode(item.key)}
              style={{ flex:1, padding:"12px 4px 10px", border:"none", background:"none", cursor:"pointer", fontFamily:"inherit", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
              <span style={{ fontSize:20 }}>{item.icon}</span>
              <span style={{ fontSize:10, fontWeight:600, color: viewMode===item.key?"#C4B5FD":"rgba(255,255,255,0.3)" }}>{item.label}</span>
              {viewMode===item.key && <div style={{ width:16, height:3, borderRadius:2, background:"linear-gradient(135deg,#8B5CF6,#EC4899)", marginTop:1 }}/>}
            </button>
          ))}
        </div>
        {/* ══ MODALS ══ */}
        {/* Login */}
        {showLogin && <LoginModal mcList={mcList} onLogin={handleLogin} onClose={()=>{setShowLogin(false);setPendingSlot(null);}} message={loginMessage}/>}
        {/* Book Slot */}
        {showBookModal && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:1000 }}
            onClick={e=>{if(e.target===e.currentTarget)setShowBookModal(false);}}>
            <div style={{ background:"linear-gradient(160deg,#1e1e3a,#2a1a40)", borderRadius:"24px 24px 0 0", padding:"20px 20px 36px", width:"100%", maxWidth:480, border:"1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ width:40, height:4, borderRadius:2, background:"rgba(255,255,255,0.2)", margin:"0 auto 20px" }}/>
              <h2 style={{ margin:"0 0 4px", fontSize:18, fontWeight:800, color:"#C4B5FD" }}>จองคิวไลฟ์</h2>
              <p style={{ margin:"0 0 16px", fontSize:12, color:"rgba(255,255,255,0.4)" }}>{selectedSlot&&`${DAYS[selectedSlot.di]} ${fmt(weekDates[selectedSlot.di])} • ${TIME_SLOTS[selectedSlot.si]} น.`}</p>
              {!isAdmin && currentMcData && (
                <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:12, background:`${currentMcData.color}22`, border:`1px solid ${currentMcData.color}55`, marginBottom:16 }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:currentMcData.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:800, color:"#1a1a2e", flexShrink:0 }}>{currentMcData.name.replace("คุณ","").charAt(0)}</div>
                  <div><div style={{ fontWeight:700, fontSize:14 }}>{currentMcData.name}</div><div style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>Size {currentMcData.size} • {currentMcData.time}</div></div>
                </div>
              )}
              <label style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.5)", marginBottom:6, display:"block" }}>ชื่อผู้จอง</label>
              <input value={bookingName} onChange={e=>setBookingName(e.target.value)} readOnly={!isAdmin} style={{ ...inp(), marginBottom:16, opacity:isAdmin?1:0.7 }}/>
              {isAdmin && (<>
                <label style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.5)", marginBottom:6, display:"block" }}>เลือก MC</label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
                  {mcList.map(mc=><button key={mc.id} onClick={()=>setSelectedMC(mc.name)} style={{ padding:"7px 12px", borderRadius:9, background:selectedMC===mc.name?mc.color:"rgba(255,255,255,0.06)", border:selectedMC===mc.name?`2px solid ${mc.color}`:"1px solid rgba(255,255,255,0.08)", color:selectedMC===mc.name?"#1a1a2e":"rgba(255,255,255,0.6)", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>{mc.name}</button>)}
                </div>
                <label style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.5)", marginBottom:6, display:"block" }}>ไซส์เสื้อผ้า</label>
                <div style={{ display:"flex", gap:6, marginBottom:18 }}>
                  {["S","M","L","XL","2XL"].map(s=><button key={s} onClick={()=>setClothingSize(s)} style={{ flex:1, padding:"9px 0", borderRadius:9, background:clothingSize===s?"linear-gradient(135deg,#8B5CF6,#7C3AED)":"rgba(255,255,255,0.06)", border:"none", color:clothingSize===s?"#fff":"rgba(255,255,255,0.45)", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>{s}</button>)}
                </div>
              </>)}
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setShowBookModal(false)} style={{ flex:1, padding:14, borderRadius:13, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.45)", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>ยกเลิก</button>
                <button onClick={handleBook} style={{ flex:2, padding:14, borderRadius:13, background:"linear-gradient(135deg,#8B5CF6,#EC4899)", border:"none", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>ยืนยัน ✨</button>
              </div>
            </div>
          </div>
        )}
        {/* Slot Detail */}
        {showSlotDetail && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:1000 }}
            onClick={e=>{if(e.target===e.currentTarget)setShowSlotDetail(null);}}>
            <div style={{ background:"linear-gradient(160deg,#1e1e3a,#2a1a40)", borderRadius:"24px 24px 0 0", padding:"20px 20px 36px", width:"100%", maxWidth:480, border:"1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ width:40, height:4, borderRadius:2, background:"rgba(255,255,255,0.2)", margin:"0 auto 20px" }}/>
              <h2 style={{ margin:"0 0 16px", fontSize:18, fontWeight:800, color:"#C4B5FD" }}>รายละเอียดการจอง</h2>
              {[["👤 ผู้จอง",showSlotDetail.booking.name],["🎤 MC",showSlotDetail.booking.mc],["👗 ไซส์",showSlotDetail.booking.size],["📅 วัน",`${showSlotDetail.booking.day} ${showSlotDetail.booking.date}`],["⏰ เวลา",showSlotDetail.booking.time],["🔑 โดย",showSlotDetail.booking.bookedBy]].map(([l,v])=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", fontSize:14 }}>
                  <span style={{ color:"rgba(255,255,255,0.4)" }}>{l}</span><span style={{ fontWeight:700 }}>{v}</span>
                </div>
              ))}
              <div style={{ display:"flex", gap:8, marginTop:20 }}>
                <button onClick={()=>setShowSlotDetail(null)} style={{ flex:1, padding:14, borderRadius:13, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.45)", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>ปิด</button>
                <button onClick={()=>handleCancelBooking(showSlotDetail.key)} style={{ flex:1, padding:14, borderRadius:13, background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)", color:"#FCA5A5", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>🗑️ ยกเลิก</button>
              </div>
            </div>
          </div>
        )}
        {/* Add/Edit MC */}
        {showMcModal && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:1000 }}
            onClick={e=>{if(e.target===e.currentTarget)setShowMcModal(false);}}>
            <div style={{ background:"linear-gradient(160deg,#1e1e3a,#2a1a40)", borderRadius:"24px 24px 0 0", padding:"20px 20px 36px", width:"100%", maxWidth:480, border:"1px solid rgba(255,255,255,0.08)", maxHeight:"90vh", overflowY:"auto" }}>
              <div style={{ width:40, height:4, borderRadius:2, background:"rgba(255,255,255,0.2)", margin:"0 auto 20px" }}/>
              <h2 style={{ margin:"0 0 18px", fontSize:18, fontWeight:800, color:"#C4B5FD" }}>{editingMc?"✏️ แก้ไข MC":"➕ เพิ่ม MC ใหม่"}</h2>
              {[{label:"ชื่อ MC *",k:"name",ph:"เช่น คุณสมหญิง"},{label:"เวลาทำงาน",k:"time",ph:"เช่น 9.00-17.00 น."},{label:"หมายเหตุ",k:"note",ph:"เช่น (จ-ศ)"},{label:"ราคา/ชม (บาท)",k:"rate",ph:"เช่น 150"}].map(f=>(
                <div key={f.k} style={{ marginBottom:12 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.45)", marginBottom:5, display:"block" }}>{f.label}</label>
                  <input value={mcForm[f.k]} onChange={e=>setMcForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={inp()}/>
                </div>
              ))}
              <div style={{ marginBottom:12 }}>
                <label style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.45)", marginBottom:5, display:"block" }}>ไซส์</label>
                <div style={{ display:"flex", gap:6 }}>
                  {["S","M","L","XL","2XL"].map(s=><button key={s} onClick={()=>setMcForm(p=>({...p,size:s}))} style={{ flex:1, padding:"9px 0", borderRadius:9, background:mcForm.size===s?"linear-gradient(135deg,#8B5CF6,#7C3AED)":"rgba(255,255,255,0.06)", border:"none", color:mcForm.size===s?"#fff":"rgba(255,255,255,0.4)", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>{s}</button>)}
                </div>
              </div>
              <div style={{ padding:"12px 14px", borderRadius:12, background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.15)", marginBottom:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#C4B5FD", marginBottom:10 }}>🔑 ข้อมูล Login</div>
                {[{label:"Username *",k:"username",ph:"เช่น somying"},{label:"เบอร์โทร * (ใช้เป็น Password)",k:"password",ph:"ตัวเลข 10 หลัก เช่น 0812345678"}].map((f,i)=>(
                  <div key={f.k} style={{ marginBottom:i===0?10:0 }}>
                    <label style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.4)", marginBottom:4, display:"block" }}>{f.label}</label>
                    <input value={mcForm[f.k]}
                      onChange={e => {
                        const val = f.k==="password" ? e.target.value.replace(/\D/g,"").slice(0,10) : e.target.value;
                        setMcForm(p=>({...p,[f.k]:val}));
                      }}
                      placeholder={f.ph}
                      inputMode={f.k==="password"?"numeric":"text"}
                      maxLength={f.k==="password"?10:undefined}
                      style={{ ...inp(), borderColor: f.k==="password" && mcForm.password.length>0 && mcForm.password.length<10 ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.12)" }}
                    />
                    {f.k==="password" && mcForm.password.length>0 && (
                      <div style={{ fontSize:10, marginTop:4, color: mcForm.password.length===10 ? "#10B981" : "rgba(239,68,68,0.8)", fontWeight:600 }}>
                        {mcForm.password.length===10 ? "✅ เบอร์โทรครบ 10 หลัก" : `⚠️ ยังขาดอีก ${10-mcForm.password.length} หลัก`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setShowMcModal(false)} style={{ flex:1, padding:14, borderRadius:13, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.45)", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>ยกเลิก</button>
                <button onClick={saveMc} style={{ flex:2, padding:14, borderRadius:13, background:"linear-gradient(135deg,#8B5CF6,#7C3AED)", border:"none", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>{editingMc?"💾 บันทึก":"✅ เพิ่ม MC"}</button>
              </div>
            </div>
          </div>
        )}
        {/* Confirm Delete */}
        {deleteConfirm && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:2000 }}>
            <div style={{ background:"linear-gradient(160deg,#1e1e3a,#2a1a40)", borderRadius:"24px 24px 0 0", padding:"20px 20px 36px", width:"100%", maxWidth:480, border:"1px solid rgba(239,68,68,0.2)", textAlign:"center" }}>
              <div style={{ width:40, height:4, borderRadius:2, background:"rgba(255,255,255,0.2)", margin:"0 auto 20px" }}/>
              <div style={{ fontSize:36, marginBottom:10 }}>⚠️</div>
              <h3 style={{ margin:"0 0 8px", fontSize:16, fontWeight:700, color:"#FCA5A5" }}>ยืนยันการลบ</h3>
              <p style={{ margin:"0 0 20px", fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.6 }}>
                {deleteConfirm.type==="mc"?`ลบ "${deleteConfirm.name}" ออกจากระบบ?`:"ล้างการจองทั้งหมด?"}
              </p>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setDeleteConfirm(null)} style={{ flex:1, padding:14, borderRadius:13, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.45)", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>ยกเลิก</button>
                <button onClick={()=>deleteConfirm.type==="mc"?(setMcList(p=>p.filter(m=>m.id!==deleteConfirm.id)),setDeleteConfirm(null),showToast("ลบ MC แล้ว","success")):(setBookings({}),setDeleteConfirm(null),showToast("ล้างแล้ว","success"))}
                  style={{ flex:1, padding:14, borderRadius:13, background:"linear-gradient(135deg,#EF4444,#DC2626)", border:"none", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>ยืนยันลบ</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

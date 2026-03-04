"use client"
import { useState, useCallback, useEffect } from "react"
import {
  getMCs, addMC, updateMC, deleteMC,
  getBookings, addBooking, deleteBooking, clearAllBookings,
  type MC, type Booking
} from "@/lib/supabase"

const DAYS = ["จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์","อาทิตย์"]
const TIME_SLOTS = [
  "9.00 - 11.00 น.","11.00 - 13.00 น.","13.00 - 15.00 น.","15.00 - 17.00 น.",
  "17.00 - 19.00 น.","19.00 - 20.00 น.","20.00 - 22.00 น.","22.00 - 24.00 น.",
]
const SLOT_COLORS = ["#FFE0E0","#FFF3D0","#D0F0FF","#E0FFE0","#F0E0FF","#FFE8D0","#D0FFE8","#FFD0E8"]
const MC_COLORS   = ["#FFEAA7","#81ECEC","#A29BFE","#FF7675","#74B9FF","#55EFC4","#FDCB6E","#FD79A8"]
const ADMIN = { username:"admin", password:"admin1234", role:"admin", displayName:"แอดมิน" }

const inp = (extra = {}) => ({
  width:"100%", padding:"10px 14px", borderRadius:10,
  background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)",
  color:"#fff", fontSize:13, fontFamily:"inherit", outline:"none",
  boxSizing:"border-box" as const, ...extra,
})

function getWeekDates() {
  const today = new Date()
  const day = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() + ((1 - day + 7) % 7 || 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i); return d
  })
}
const fmt  = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`
const dKey = (d: Date) => d.toISOString().split("T")[0]

type User = { username:string; password:string; role:string; displayName:string; mcId?:number }

function LoginScreen({ mcList, onLogin }: { mcList: MC[]; onLogin: (u: User) => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")

  const handle = () => {
    if (username.trim().toLowerCase() === ADMIN.username && password === ADMIN.password) {
      onLogin({ ...ADMIN }); return
    }
    const mc = mcList.find(m => m.username === username.trim().toLowerCase() && m.password === password)
    if (mc) { onLogin({ role:"mc", displayName:mc.name, username:mc.username, password:mc.password, mcId:mc.id }); return }
    setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")
    setTimeout(() => setError(""), 3000)
  }

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0c0c1d,#1a1a3e,#2d1b4e)", fontFamily:"'Sarabun',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap" rel="stylesheet"/>
      <div style={{ background:"#1e1e3a", borderRadius:28, padding:"44px 32px", width:"100%", maxWidth:360, border:"1px solid rgba(255,255,255,0.08)", textAlign:"center" }}>
        <div style={{ fontSize:44, marginBottom:14 }}>📺</div>
        <h1 style={{ margin:"0 0 6px", fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#C4B5FD,#F9A8D4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Weekly Live Queue</h1>
        <p style={{ margin:"0 0 24px", fontSize:12, color:"rgba(255,255,255,0.4)" }}>เข้าสู่ระบบเพื่อจองคิวไลฟ์</p>
        {error && <div style={{ padding:"9px 14px", borderRadius:10, marginBottom:12, background:"rgba(239,68,68,0.15)", color:"#FCA5A5", fontSize:12, fontWeight:600 }}>{error}</div>}
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username"
          onKeyDown={e => e.key==="Enter" && handle()} style={{ ...inp(), marginBottom:10 }}/>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
          onKeyDown={e => e.key==="Enter" && handle()} style={{ ...inp(), marginBottom:20 }}/>
        <button onClick={handle} style={{ width:"100%", padding:14, borderRadius:14, background:"linear-gradient(135deg,#8B5CF6,#EC4899)", border:"none", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>
          เข้าสู่ระบบ
        </button>
        <p style={{ marginTop:16, fontSize:11, color:"rgba(255,255,255,0.25)" }}>Admin: admin / admin1234</p>
      </div>
    </div>
  )
}

export default function App() {
  const [currentUser, setCurrentUser]   = useState<User | null>(null)
  const [weekDates]                     = useState(getWeekDates)
  const [bookings, setBookings]         = useState<Record<string, Booking>>({})
  const [mcList, setMcList]             = useState<MC[]>([])
  const [loading, setLoading]           = useState(false)

  // schedule
  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const [bookingName, setBookingName]   = useState("")
  const [selectedMC, setSelectedMC]     = useState("")
  const [clothingSize, setClothingSize] = useState("M")
  const [showBookModal, setShowBookModal] = useState(false)
  const [showSlotDetail, setShowSlotDetail] = useState<any>(null)

  // admin
  const [viewMode, setViewMode]   = useState("schedule")
  const [adminTab, setAdminTab]   = useState("mc")
  const [showMcModal, setShowMcModal] = useState(false)
  const [editingMc, setEditingMc] = useState<MC | null>(null)
  const [mcForm, setMcForm]       = useState({ name:"", size:"M", rate:"", time:"", note:"", username:"", password:"" })
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null)
  const [toast, setToast]         = useState<{ msg:string; type:string } | null>(null)

  const isAdmin    = currentUser?.role === "admin"
  const weekRange  = weekDates.length ? `${fmt(weekDates[0])} - ${fmt(weekDates[6])}` : ""

  const showToast = useCallback((msg: string, type = "error") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    getMCs().then(setMcList)
  }, [])

  useEffect(() => {
    if (currentUser) {
      setLoading(true)
      getBookings().then(data => { setBookings(data); setLoading(false) })
    }
  }, [currentUser])

  const countDay  = (name: string, dk: string) => Object.entries(bookings).filter(([k,v]) => k.startsWith(dk) && v.name===name).length
  const countWeek = (name: string) => Object.values(bookings).filter(b => b.name===name).length

  // ── Booking handlers ──────────────────────────
  const handleSlotClick = (di: number, si: number) => {
    const dk  = dKey(weekDates[di])
    const key = `${dk}_slot${si}`
    if (bookings[key]) {
      if (isAdmin) { setShowSlotDetail({ key, booking: bookings[key] }); return }
      showToast("สล็อตนี้ถูกจองแล้ว!"); return
    }
    setSelectedSlot({ di, si, key, dk })
    if (!isAdmin) setBookingName(currentUser!.displayName)
    setShowBookModal(true)
  }

  const handleBook = async () => {
    if (!bookingName.trim()) { showToast("กรุณากรอกชื่อผู้จอง"); return }
    if (!selectedMC)          { showToast("กรุณาเลือก MC"); return }
    if (countDay(bookingName.trim(), selectedSlot.dk) >= 2) { showToast("จองได้สูงสุด 2 ครั้ง/วัน!"); return }
    if (countWeek(bookingName.trim()) >= 14)                { showToast("จองเต็มโควต้าแล้ว!"); return }
    const b: Booking = {
      slot_key: selectedSlot.key, name: bookingName.trim(), mc: selectedMC,
      size: clothingSize, day: DAYS[selectedSlot.di], time_slot: TIME_SLOTS[selectedSlot.si],
      date: fmt(weekDates[selectedSlot.di]), booked_by: currentUser!.displayName,
    }
    const ok = await addBooking(b)
    if (ok) { setBookings(prev => ({ ...prev, [selectedSlot.key]: b })); showToast("จองสำเร็จ! 🎉", "success") }
    else showToast("เกิดข้อผิดพลาด กรุณาลองใหม่")
    setShowBookModal(false); setBookingName(""); setSelectedMC("")
  }

  const handleCancelBooking = async (key: string) => {
    const b = bookings[key]
    if (!isAdmin && b.booked_by !== currentUser!.displayName) { showToast("ไม่สามารถยกเลิกของคนอื่นได้"); return }
    const ok = await deleteBooking(key)
    if (ok) { setBookings(prev => { const n={...prev}; delete n[key]; return n }); setShowSlotDetail(null); showToast("ยกเลิกแล้ว","success") }
  }

  const handleClearAll = async () => {
    const ok = await clearAllBookings()
    if (ok) { setBookings({}); setDeleteConfirm(null); showToast("ล้างการจองทั้งหมดแล้ว","success") }
  }

  // ── MC handlers ───────────────────────────────
  const openAddMc = () => {
    setEditingMc(null)
    setMcForm({ name:"", size:"M", rate:"", time:"", note:"", username:"", password:"" })
    setShowMcModal(true)
  }
  const openEditMc = (mc: MC) => {
    setEditingMc(mc)
    setMcForm({ name:mc.name, size:mc.size, rate:mc.rate, time:mc.time, note:mc.note, username:mc.username, password:mc.password })
    setShowMcModal(true)
  }
  const saveMc = async () => {
    if (!mcForm.name.trim())     { showToast("กรุณากรอกชื่อ MC"); return }
    if (!mcForm.username.trim()) { showToast("กรุณากรอก Username"); return }
    if (!mcForm.password.trim()) { showToast("กรุณากรอก Password"); return }
    if (editingMc) {
      const ok = await updateMC(editingMc.id, { ...mcForm, username: mcForm.username.trim().toLowerCase() })
      if (ok) { setMcList(prev => prev.map(m => m.id===editingMc.id ? { ...m, ...mcForm } : m)); showToast("แก้ไขสำเร็จ","success") }
    } else {
      const color = MC_COLORS[mcList.length % MC_COLORS.length]
      const ok = await addMC({ ...mcForm, username: mcForm.username.trim().toLowerCase(), color })
      if (ok) { const updated = await getMCs(); setMcList(updated); showToast("เพิ่ม MC สำเร็จ 🎉","success") }
      else { showToast("เกิดข้อผิดพลาด กรุณาลองใหม่") }
      else { showToast("เกิดข้อผิดพลาด ไม่สามารถเพิ่ม MC ได้") }
    }
    setShowMcModal(false)
  }
  const confirmDeleteMc = async (id: number) => {
    const ok = await deleteMC(id)
    if (ok) { setMcList(prev => prev.filter(m => m.id!==id)); setDeleteConfirm(null); showToast("ลบ MC แล้ว","success") }
  }

  if (!currentUser) return <LoginScreen mcList={mcList} onLogin={setCurrentUser}/>

  const myBookings = isAdmin ? bookings : Object.fromEntries(Object.entries(bookings).filter(([_,b]) => b.booked_by===currentUser.displayName))
  const mainTabs   = [
    { key:"schedule",    label:"📅 ตารางไลฟ์" },
    { key:"mc_info",     label:"🎤 รายชื่อ MC" },
    { key:"my_bookings", label: isAdmin ? "📋 การจองทั้งหมด" : "📋 ของฉัน" },
    ...(isAdmin ? [{ key:"admin", label:"⚙️ หลังบ้าน" }] : []),
  ]
  const adminTabs = [
    { key:"mc",       label:"🎤 จัดการ MC" },
    { key:"users",    label:"👥 Login" },
    { key:"bookings", label:"📋 การจอง" },
  ]

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0c0c1d,#1a1a3e,#2d1b4e)", fontFamily:"'Sarabun',sans-serif", color:"#E8E8F0" }}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap" rel="stylesheet"/>

      {toast && <div style={{ position:"fixed", top:18, left:"50%", transform:"translateX(-50%)", zIndex:9999, padding:"11px 26px", borderRadius:12, background: toast.type==="success" ? "linear-gradient(135deg,#10B981,#059669)" : "linear-gradient(135deg,#EF4444,#DC2626)", color:"#fff", fontWeight:700, fontSize:13, whiteSpace:"nowrap" }}>{toast.msg}</div>}

      {/* Topbar */}
      <div style={{ padding:"12px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:32, height:32, borderRadius:9, background: isAdmin ? "linear-gradient(135deg,#F59E0B,#D97706)" : "linear-gradient(135deg,#8B5CF6,#EC4899)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>
            {isAdmin ? "👑" : "🎤"}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:13 }}>{currentUser.displayName}</div>
            <div style={{ fontSize:9, color: isAdmin ? "#FBBF24" : "rgba(255,255,255,0.35)", fontWeight:600, textTransform:"uppercase" }}>{isAdmin ? "ADMIN" : "MC LIVE"}</div>
          </div>
        </div>
        <button onClick={() => { setCurrentUser(null); setViewMode("schedule") }} style={{ padding:"6px 12px", borderRadius:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>ออก</button>
      </div>

      {/* Header */}
      <div style={{ padding:"16px 18px 8px", textAlign:"center" }}>
        <h1 style={{ margin:0, fontSize:20, fontWeight:800, background:"linear-gradient(135deg,#C4B5FD,#F9A8D4)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Weekly Live Queue</h1>
        <p style={{ margin:"3px 0 0", fontSize:11, color:"rgba(255,255,255,0.35)" }}>สัปดาห์ {weekRange} {loading && "⏳"}</p>
      </div>

      {/* Main Tabs */}
      <div style={{ display:"flex", justifyContent:"center", gap:5, padding:"8px 14px 14px", flexWrap:"wrap" }}>
        {mainTabs.map(t => (
          <button key={t.key} onClick={() => setViewMode(t.key)} style={{ padding:"8px 14px", borderRadius:10, border:"none", background: viewMode===t.key ? "linear-gradient(135deg,#8B5CF6,#7C3AED)" : "rgba(255,255,255,0.06)", color: viewMode===t.key ? "#fff" : "rgba(255,255,255,0.5)", fontWeight:600, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>{t.label}</button>
        ))}
      </div>

      {/* Schedule */}
      {viewMode==="schedule" && (
        <div style={{ padding:"0 10px 28px", overflowX:"auto" }}>
          <div style={{ minWidth:860, background:"rgba(255,255,255,0.03)", borderRadius:16, border:"1px solid rgba(255,255,255,0.06)", overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"84px repeat(8,1fr)", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ padding:"10px 6px", textAlign:"center", fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.4)", background:"rgba(139,92,246,0.08)" }}>วัน/เวลา</div>
              {TIME_SLOTS.map((s,i) => <div key={i} style={{ padding:"10px 3px", textAlign:"center", fontSize:8, fontWeight:600, color:"rgba(255,255,255,0.45)", background:"rgba(139,92,246,0.05)", borderLeft:"1px solid rgba(255,255,255,0.04)" }}>{s}</div>)}
            </div>
            {DAYS.map((day,di) => (
              <div key={day} style={{ display:"grid", gridTemplateColumns:"84px repeat(8,1fr)", borderBottom: di<6 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <div style={{ padding:"12px 5px", textAlign:"center", fontWeight:700, fontSize:11, background:"rgba(139,92,246,0.06)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:1 }}>
                  <span>{day}</span><span style={{ fontSize:9, color:"rgba(255,255,255,0.3)", fontWeight:400 }}>{fmt(weekDates[di])}</span>
                </div>
                {TIME_SLOTS.map((_,si) => {
                  const key = `${dKey(weekDates[di])}_slot${si}`
                  const b   = bookings[key]
                  const sc  = SLOT_COLORS[(di+si)%SLOT_COLORS.length]
                  return (
                    <div key={si} onClick={() => handleSlotClick(di,si)}
                      style={{ padding:"5px 3px", borderLeft:"1px solid rgba(255,255,255,0.04)", cursor:"pointer", background: b?`${sc}18`:"transparent", minHeight:52, display:"flex", alignItems:"center", justifyContent:"center" }}
                      onMouseEnter={e => { if(!b)(e.currentTarget as HTMLElement).style.background="rgba(139,92,246,0.1)" }}
                      onMouseLeave={e => { if(!b)(e.currentTarget as HTMLElement).style.background="transparent" }}>
                      {b ? (
                        <div style={{ background:sc, borderRadius:7, padding:"4px 5px", width:"92%" }}>
                          <div style={{ fontSize:9, fontWeight:700, color:"#1a1a2e" }}>{b.name}</div>
                          <div style={{ fontSize:7, color:"#444", marginTop:1 }}>{b.mc}•{b.size}</div>
                        </div>
                      ) : <div style={{ width:22, height:22, borderRadius:5, border:"2px dashed rgba(255,255,255,0.09)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"rgba(255,255,255,0.1)" }}>+</div>}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MC Info */}
      {viewMode==="mc_info" && (
        <div style={{ padding:"0 18px 28px", maxWidth:700, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:9 }}>
            {mcList.map(mc => (
              <div key={mc.id} style={{ background:"rgba(255,255,255,0.04)", borderRadius:13, padding:"14px 16px", border:"1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:9 }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:mc.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:800, color:"#1a1a2e" }}>{mc.name.charAt(mc.name.length-1)}</div>
                  <div><div style={{ fontWeight:700, fontSize:13 }}>{mc.name}</div><div style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>Size {mc.size}</div></div>
                </div>
                <div style={{ fontSize:11, display:"flex", flexDirection:"column", gap:4 }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ color:"rgba(255,255,255,0.4)" }}>⏰</span><span>{mc.time}</span></div>
                  {isAdmin && <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ color:"rgba(255,255,255,0.4)" }}>💰</span><span style={{ color:"#FBBF24", fontWeight:700 }}>{mc.rate} / ชม</span></div>}
                  <div style={{ padding:"4px 8px", borderRadius:7, background:"rgba(139,92,246,0.1)", fontSize:10, color:"rgba(255,255,255,0.5)", textAlign:"center" }}>{mc.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Bookings */}
      {viewMode==="my_bookings" && (
        <div style={{ padding:"0 18px 28px", maxWidth:580, margin:"0 auto" }}>
          {Object.keys(myBookings).length===0
            ? <div style={{ textAlign:"center", padding:44, color:"rgba(255,255,255,0.3)" }}>📭 ยังไม่มีการจอง</div>
            : <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {Object.entries(myBookings).map(([key,b]) => (
                  <div key={key} style={{ background:"rgba(255,255,255,0.04)", borderRadius:12, padding:"12px 16px", border:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13 }}>{b.name} <span style={{ fontSize:9, padding:"2px 6px", background:"rgba(139,92,246,0.2)", borderRadius:5, color:"#C4B5FD" }}>{b.size}</span></div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{b.day} ({b.date}) • {b.time_slot}</div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:1 }}>MC: {b.mc}{isAdmin && ` • โดย: ${b.booked_by}`}</div>
                    </div>
                    <button onClick={() => handleCancelBooking(key)} style={{ padding:"6px 12px", borderRadius:8, background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.25)", color:"#FCA5A5", fontWeight:600, fontSize:10, cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>ยกเลิก</button>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* Admin Panel */}
      {viewMode==="admin" && isAdmin && (
        <div style={{ padding:"0 18px 28px", maxWidth:780, margin:"0 auto" }}>
          <div style={{ display:"flex", gap:5, marginBottom:16, flexWrap:"wrap" }}>
            {adminTabs.map(t => (
              <button key={t.key} onClick={() => setAdminTab(t.key)} style={{ padding:"8px 14px", borderRadius:9, border: adminTab===t.key ? "1px solid rgba(245,158,11,0.35)" : "1px solid transparent", background: adminTab===t.key ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)", color: adminTab===t.key ? "#FBBF24" : "rgba(255,255,255,0.4)", fontWeight:600, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>{t.label}</button>
            ))}
          </div>

          {adminTab==="mc" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <h2 style={{ margin:0, fontSize:15, fontWeight:700 }}>จัดการ MC ({mcList.length} คน)</h2>
                <button onClick={openAddMc} style={{ padding:"9px 16px", borderRadius:10, background:"linear-gradient(135deg,#8B5CF6,#7C3AED)", border:"none", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>➕ เพิ่ม MC</button>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {mcList.map(mc => (
                  <div key={mc.id} style={{ background:"rgba(255,255,255,0.04)", borderRadius:12, padding:"12px 16px", border:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:36, height:36, borderRadius:9, background:mc.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:800, color:"#1a1a2e", flexShrink:0 }}>{mc.name.charAt(mc.name.length-1)}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:13 }}>{mc.name} <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>Size {mc.size}</span></div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:2 }}>{mc.time} • {mc.note}</div>
                      <div style={{ fontSize:10, color:"#FBBF24", marginTop:1 }}>💰 {mc.rate}/ชม • 🔑 @{mc.username}</div>
                    </div>
                    <div style={{ display:"flex", gap:5, flexShrink:0 }}>
                      <button onClick={() => openEditMc(mc)} style={{ padding:"6px 12px", borderRadius:8, background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.3)", color:"#C4B5FD", fontWeight:600, fontSize:10, cursor:"pointer", fontFamily:"inherit" }}>แก้ไข</button>
                      <button onClick={() => setDeleteConfirm({ type:"mc", id:mc.id, name:mc.name })} style={{ padding:"6px 12px", borderRadius:8, background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.25)", color:"#FCA5A5", fontWeight:600, fontSize:10, cursor:"pointer", fontFamily:"inherit" }}>ลบ</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {adminTab==="users" && (
            <div>
              <h2 style={{ margin:"0 0 12px", fontSize:15, fontWeight:700 }}>ข้อมูล Login ทั้งหมด</h2>
              <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:12, border:"1px solid rgba(255,255,255,0.06)", overflow:"hidden" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 70px", borderBottom:"1px solid rgba(255,255,255,0.08)", padding:"9px 14px" }}>
                  {["ชื่อ","Username","Password","Role"].map((h,i) => <div key={i} style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.4)" }}>{h}</div>)}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 70px", padding:"10px 14px", borderBottom:"1px solid rgba(255,255,255,0.04)", background:"rgba(245,158,11,0.05)" }}>
                  <div style={{ fontSize:12, fontWeight:700 }}>แอดมิน</div>
                  <div style={{ fontSize:12, fontFamily:"monospace", color:"rgba(255,255,255,0.55)" }}>admin</div>
                  <div style={{ fontSize:12, fontFamily:"monospace", color:"rgba(255,255,255,0.55)" }}>admin1234</div>
                  <div style={{ fontSize:10, color:"#FBBF24", fontWeight:700 }}>Admin</div>
                </div>
                {mcList.map((mc,i) => (
                  <div key={mc.id} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 70px", padding:"10px 14px", borderBottom: i<mcList.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <div style={{ fontSize:12, fontWeight:600 }}>{mc.name}</div>
                    <div style={{ fontSize:12, fontFamily:"monospace", color:"rgba(255,255,255,0.55)" }}>{mc.username}</div>
                    <div style={{ fontSize:12, fontFamily:"monospace", color:"rgba(255,255,255,0.55)" }}>{mc.password}</div>
                    <div style={{ fontSize:10, color:"#A29BFE", fontWeight:600 }}>MC</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {adminTab==="bookings" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <h2 style={{ margin:0, fontSize:15, fontWeight:700 }}>การจองทั้งหมด ({Object.keys(bookings).length})</h2>
                {Object.keys(bookings).length>0 && <button onClick={() => setDeleteConfirm({ type:"allBookings" })} style={{ padding:"8px 14px", borderRadius:9, background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.25)", color:"#FCA5A5", fontWeight:700, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>🗑️ ล้างทั้งหมด</button>}
              </div>
              {Object.keys(bookings).length===0
                ? <div style={{ textAlign:"center", padding:36, color:"rgba(255,255,255,0.3)" }}>📭 ไม่มีการจอง</div>
                : <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                    {Object.entries(bookings).map(([key,b]) => (
                      <div key={key} style={{ background:"rgba(255,255,255,0.04)", borderRadius:11, padding:"11px 14px", border:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:12 }}>{b.name} <span style={{ fontSize:9, padding:"1px 5px", background:"rgba(139,92,246,0.2)", borderRadius:4, color:"#C4B5FD" }}>{b.size}</span></div>
                          <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{b.day} ({b.date}) • {b.time_slot}</div>
                          <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", marginTop:1 }}>MC: {b.mc} • โดย: {b.booked_by}</div>
                        </div>
                        <button onClick={() => handleCancelBooking(key)} style={{ padding:"5px 10px", borderRadius:7, background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.25)", color:"#FCA5A5", fontWeight:600, fontSize:10, cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>ลบ</button>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}
        </div>
      )}

      {/* Modal: Book */}
      {showBookModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}
          onClick={e => { if(e.target===e.currentTarget) setShowBookModal(false) }}>
          <div style={{ background:"linear-gradient(160deg,#1e1e3a,#2a1a40)", borderRadius:20, padding:"24px 22px", width:"100%", maxWidth:390, border:"1px solid rgba(255,255,255,0.08)" }}>
            <h2 style={{ margin:"0 0 4px", fontSize:17, fontWeight:800, color:"#C4B5FD" }}>จองคิวไลฟ์</h2>
            <p style={{ margin:"0 0 18px", fontSize:11, color:"rgba(255,255,255,0.4)" }}>{selectedSlot && `${DAYS[selectedSlot.di]} (${fmt(weekDates[selectedSlot.di])}) • ${TIME_SLOTS[selectedSlot.si]}`}</p>
            <label style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.5)", marginBottom:5, display:"block" }}>ชื่อผู้จอง</label>
            <input value={bookingName} readOnly style={{ ...inp(), marginBottom:12, opacity:0.7, cursor:"default" }}/>
            <label style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.5)", marginBottom:5, display:"block" }}>เลือก MC</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
              {mcList.map(mc => <button key={mc.id} onClick={() => { setSelectedMC(mc.name); setClothingSize(mc.size || ""); }} style={{ padding:"6px 11px", borderRadius:8, background: selectedMC===mc.name?mc.color:"rgba(255,255,255,0.06)", border: selectedMC===mc.name?`2px solid ${mc.color}`:"1px solid rgba(255,255,255,0.08)", color: selectedMC===mc.name?"#1a1a2e":"rgba(255,255,255,0.6)", fontWeight:600, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>{mc.name}</button>)}
            </div>
            <label style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.5)", marginBottom:5, display:"block" }}>ไซส์เสื้อผ้า</label>
            <div style={{ marginBottom:20, padding:"8px 12px", borderRadius:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", fontSize:12, color: clothingSize ? "#C4B5FD" : "rgba(255,255,255,0.3)", fontWeight:600 }}>
              {clothingSize ? `👗 ${clothingSize}` : "— เลือก MC ก่อน —"}
            </div>
            <div style={{ display:"flex", gap:7 }}>
              <button onClick={() => setShowBookModal(false)} style={{ flex:1, padding:12, borderRadius:11, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.45)", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>ยกเลิก</button>
              <button onClick={handleBook} style={{ flex:2, padding:12, borderRadius:11, background:"linear-gradient(135deg,#8B5CF6,#EC4899)", border:"none", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>ยืนยัน ✨</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Slot Detail */}
      {showSlotDetail && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}
          onClick={e => { if(e.target===e.currentTarget) setShowSlotDetail(null) }}>
          <div style={{ background:"linear-gradient(160deg,#1e1e3a,#2a1a40)", borderRadius:20, padding:"24px 22px", width:"100%", maxWidth:340, border:"1px solid rgba(255,255,255,0.08)" }}>
            <h2 style={{ margin:"0 0 16px", fontSize:17, fontWeight:800, color:"#C4B5FD" }}>รายละเอียดการจอง</h2>
            {[["👤 ผู้จอง",showSlotDetail.booking.name],["🎤 MC",showSlotDetail.booking.mc],["👗 ไซส์",showSlotDetail.booking.size],["📅 วัน",`${showSlotDetail.booking.day} (${showSlotDetail.booking.date})`],["⏰ เวลา",showSlotDetail.booking.time_slot],["🔑 จองโดย",showSlotDetail.booking.booked_by]].map(([l,v]) => (
              <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:9, fontSize:12 }}><span style={{ color:"rgba(255,255,255,0.4)" }}>{l}</span><span style={{ fontWeight:600 }}>{v}</span></div>
            ))}
            <div style={{ display:"flex", gap:7, marginTop:18 }}>
              <button onClick={() => setShowSlotDetail(null)} style={{ flex:1, padding:11, borderRadius:10, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.45)", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>ปิด</button>
              <button onClick={() => handleCancelBooking(showSlotDetail.key)} style={{ flex:1, padding:11, borderRadius:10, background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)", color:"#FCA5A5", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>🗑️ ยกเลิก</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit MC */}
      {showMcModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}
          onClick={e => { if(e.target===e.currentTarget) setShowMcModal(false) }}>
          <div style={{ background:"linear-gradient(160deg,#1e1e3a,#2a1a40)", borderRadius:20, padding:"24px 22px", width:"100%", maxWidth:400, border:"1px solid rgba(255,255,255,0.08)", maxHeight:"88vh", overflowY:"auto" }}>
            <h2 style={{ margin:"0 0 18px", fontSize:17, fontWeight:800, color:"#C4B5FD" }}>{editingMc ? "✏️ แก้ไข MC" : "➕ เพิ่ม MC ใหม่"}</h2>
            {[{ label:"ชื่อ MC *",k:"name",ph:"เช่น คุณสมหญิง"},{ label:"เวลาทำงาน",k:"time",ph:"เช่น 9.00-17.00 น."},{ label:"หมายเหตุ",k:"note",ph:"เช่น (จ-ศ)"},{ label:"ราคา / ชม (บาท)",k:"rate",ph:"เช่น 150"}].map(f => (
              <div key={f.k} style={{ marginBottom:10 }}>
                <label style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.45)", marginBottom:4, display:"block" }}>{f.label}</label>
                <input value={(mcForm as any)[f.k]} onChange={e => setMcForm(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.ph} style={inp()}/>
              </div>
            ))}
            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.45)", marginBottom:4, display:"block" }}>ไซส์</label>
              <div style={{ display:"flex", gap:5 }}>
                {["S","M","L","XL","2XL"].map(s => <button key={s} onClick={() => setMcForm(p => ({ ...p, size:s }))} style={{ flex:1, padding:"7px 0", borderRadius:8, background: mcForm.size===s?"linear-gradient(135deg,#8B5CF6,#7C3AED)":"rgba(255,255,255,0.06)", border:"none", color: mcForm.size===s?"#fff":"rgba(255,255,255,0.4)", fontWeight:600, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>{s}</button>)}
              </div>
            </div>
            <div style={{ padding:"10px 12px", borderRadius:10, background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.15)", marginBottom:10 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#C4B5FD", marginBottom:8 }}>🔑 ข้อมูล Login</div>
              {[{ label:"Username *",k:"username",ph:"เช่น somying"},{ label:"Password *",k:"password",ph:"ตั้งรหัสผ่าน"}].map((f,i) => (
                <div key={f.k} style={{ marginBottom:i===0?7:0 }}>
                  <label style={{ fontSize:10, fontWeight:600, color:"rgba(255,255,255,0.4)", marginBottom:3, display:"block" }}>{f.label}</label>
                  <input value={(mcForm as any)[f.k]} onChange={e => setMcForm(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.ph} style={inp()}/>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:7 }}>
              <button onClick={() => setShowMcModal(false)} style={{ flex:1, padding:12, borderRadius:11, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.45)", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>ยกเลิก</button>
              <button onClick={saveMc} style={{ flex:2, padding:12, borderRadius:11, background:"linear-gradient(135deg,#8B5CF6,#7C3AED)", border:"none", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>{editingMc ? "💾 บันทึก" : "✅ เพิ่ม MC"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete */}
      {deleteConfirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20 }}>
          <div style={{ background:"linear-gradient(160deg,#1e1e3a,#2a1a40)", borderRadius:18, padding:"24px 22px", width:"100%", maxWidth:320, border:"1px solid rgba(239,68,68,0.2)", textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:10 }}>⚠️</div>
            <h3 style={{ margin:"0 0 8px", fontSize:15, fontWeight:700, color:"#FCA5A5" }}>ยืนยันการลบ</h3>
            <p style={{ margin:"0 0 20px", fontSize:12, color:"rgba(255,255,255,0.4)", lineHeight:1.6 }}>
              {deleteConfirm.type==="mc" ? `ลบ "${deleteConfirm.name}" ออกจากระบบ?` : "ล้างการจองทั้งหมด?\nไม่สามารถกู้คืนได้"}
            </p>
            <div style={{ display:"flex", gap:7 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex:1, padding:11, borderRadius:10, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.45)", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>ยกเลิก</button>
              <button onClick={() => deleteConfirm.type==="mc" ? confirmDeleteMc(deleteConfirm.id) : handleClearAll()} style={{ flex:1, padding:11, borderRadius:10, background:"linear-gradient(135deg,#EF4444,#DC2626)", border:"none", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>ยืนยันลบ</button>
            </div>
          </div>
        </div>
      )}

      <style>{`input::placeholder{color:rgba(255,255,255,0.2)} ::-webkit-scrollbar{height:4px;width:4px} ::-webkit-scrollbar-thumb{background:rgba(139,92,246,0.3);border-radius:3px}`}</style>
    </div>
  )
}

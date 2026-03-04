import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseKey)

export type MC = {
  id: number
  name: string
  size: string
  rate: string
  time: string
  note: string
  color: string
  username: string
  password: string
}

export type Booking = {
  id?: string
  slot_key: string
  name: string
  mc: string
  size: string
  day: string
  time_slot: string
  date: string
  booked_by: string
}

// ── MC ──────────────────────────────────────────
export async function getMCs(): Promise<MC[]> {
  const { data, error } = await supabase.from('mc_list').select('*').order('id')
  if (error) { console.error(error); return [] }
  return data
}

export async function addMC(mc: Omit<MC, 'id'>): Promise<boolean> {
  const { error } = await supabase.from('mc_list').insert([mc])
  if (error) { console.error(error); return false }
  return true
}

export async function updateMC(id: number, mc: Partial<MC>): Promise<boolean> {
  const { error } = await supabase.from('mc_list').update(mc).eq('id', id)
  if (error) { console.error(error); return false }
  return true
}

export async function deleteMC(id: number): Promise<boolean> {
  const { error } = await supabase.from('mc_list').delete().eq('id', id)
  if (error) { console.error(error); return false }
  return true
}

// ── Bookings ─────────────────────────────────────
export async function getBookings(): Promise<Record<string, Booking>> {
  const { data, error } = await supabase.from('bookings').select('*')
  if (error) { console.error(error); return {} }
  return Object.fromEntries(data.map((b: Booking) => [b.slot_key, b]))
}

export async function addBooking(booking: Booking): Promise<boolean> {
  const { error } = await supabase.from('bookings').insert([booking])
  if (error) { console.error(error); return false }
  return true
}

export async function deleteBooking(slotKey: string): Promise<boolean> {
  const { error } = await supabase.from('bookings').delete().eq('slot_key', slotKey)
  if (error) { console.error(error); return false }
  return true
}

export async function clearAllBookings(): Promise<boolean> {
  const { error } = await supabase.from('bookings').delete().neq('slot_key', '')
  if (error) { console.error(error); return false }
  return true
}

// ── Admin Config ──────────────────────────────────
export async function getAdminConfig(): Promise<{ username: string; password: string }> {
  const { data, error } = await supabase.from('admin_config').select('*')
  if (error || !data) return { username: 'admin', password: 'admin1234' }
  const map: Record<string, string> = {}
  data.forEach((row: { key: string; value: string }) => { map[row.key] = row.value })
  return { username: map['username'] || 'admin', password: map['password'] || 'admin1234' }
}

export async function updateAdminConfig(key: string, value: string): Promise<boolean> {
  const { error } = await supabase.from('admin_config').update({ value }).eq('key', key)
  if (error) { console.error(error); return false }
  return true
}

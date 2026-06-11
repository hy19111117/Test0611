import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are not configured properly')
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

export interface FamilyMember {
  id: string
  name: string
  role: 'parent' | 'child'
  avatar: string
  points: number
  is_active: boolean
  created_at: string
}

export interface Task {
  id: string
  name: string
  description: string
  points: number
  type: 'add' | 'deduct'
  is_active: boolean
  created_at: string
}

export interface PointRequest {
  id: string
  member_id: string
  task_id: string
  points: number
  description: string
  status: 'pending' | 'approved' | 'rejected'
  reject_reason: string | null
  created_at: string
  family_members?: FamilyMember
  tasks?: Task
}

export interface PointRecord {
  id: string
  member_id: string
  points: number
  type: 'add' | 'deduct' | 'exchange' | 'task'
  description: string
  created_at: string
  family_members?: FamilyMember
}

export interface Product {
  id: string
  name: string
  description: string
  points: number
  stock: number
  is_active: boolean
  image: string
  created_at: string
}

export interface ExchangeRequest {
  id: string
  member_id: string
  product_id: string
  points: number
  status: 'pending' | 'approved' | 'rejected'
  reject_reason: string | null
  created_at: string
  family_members?: FamilyMember
  products?: Product
}

export async function getFamilyMembers(): Promise<FamilyMember[]> {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('获取家庭成员失败:', error)
    return []
  }
  return data
}

export async function addFamilyMember(member: Omit<FamilyMember, 'id' | 'created_at'>): Promise<FamilyMember | null> {
  const { data, error } = await supabase
    .from('family_members')
    .insert([member])
  
  if (error) {
    console.error('添加家庭成员失败:', error)
    return null
  }
  return data?.[0] || null
}

export async function updateFamilyMember(id: string, updates: Partial<FamilyMember>): Promise<FamilyMember | null> {
  const { data, error } = await supabase
    .from('family_members')
    .update(updates)
    .eq('id', id)
  
  if (error) {
    console.error('更新家庭成员失败:', error)
    return null
  }
  return data?.[0] || null
}

export async function deleteFamilyMember(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('family_members')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('删除家庭成员失败:', error)
    return false
  }
  return true
}

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('获取任务失败:', error)
    return []
  }
  return data
}

export async function addTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
  
  if (error) {
    console.error('添加任务失败:', error)
    return null
  }
  return data?.[0] || null
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
  
  if (error) {
    console.error('更新任务失败:', error)
    return null
  }
  return data?.[0] || null
}

export async function deleteTask(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('删除任务失败:', error)
    return false
  }
  return true
}

export async function getPointRequests(status?: string): Promise<PointRequest[]> {
  let query = supabase
    .from('point_requests')
    .select('*, family_members(name, avatar, role), tasks(name)')
    .order('created_at', { ascending: false })
  
  if (status) {
    query = query.eq('status', status)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('获取积分申请失败:', error)
    return []
  }
  return data
}

export async function approvePointRequest(id: string): Promise<PointRequest | null> {
  const { data: requestData, error: requestError } = await supabase
    .from('point_requests')
    .select('member_id, points')
    .eq('id', id)
    .single()
  
  if (requestError) {
    console.error('获取申请失败:', requestError)
    return null
  }

  await updateMemberPoints(requestData.member_id, requestData.points)
  
  await addPointRecord({
    member_id: requestData.member_id,
    points: requestData.points,
    type: requestData.points > 0 ? 'add' : 'deduct',
    description: `完成任务审核通过`
  })

  const { data, error } = await supabase
    .from('point_requests')
    .update({ status: 'approved' })
    .eq('id', id)
  
  if (error) {
    console.error('审核积分申请失败:', error)
    return null
  }
  return data?.[0] || null
}

export async function rejectPointRequest(id: string, reason: string): Promise<PointRequest | null> {
  const { data, error } = await supabase
    .from('point_requests')
    .update({ status: 'rejected', reject_reason: reason })
    .eq('id', id)
  
  if (error) {
    console.error('驳回积分申请失败:', error)
    return null
  }
  return data?.[0] || null
}

export async function updateMemberPoints(memberId: string, points: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('family_members')
    .select('points')
    .eq('id', memberId)
    .single()
  
  if (error) {
    console.error('获取成员积分失败:', error)
    return false
  }

  const newPoints = data.points + points

  const { error: updateError } = await supabase
    .from('family_members')
    .update({ points: newPoints })
    .eq('id', memberId)
  
  if (updateError) {
    console.error('更新成员积分失败:', updateError)
    return false
  }
  return true
}

export async function addPointRecord(record: Omit<PointRecord, 'id' | 'created_at'>): Promise<PointRecord | null> {
  const { data, error } = await supabase
    .from('point_records')
    .insert([record])
  
  if (error) {
    console.error('添加积分记录失败:', error)
    return null
  }
  return data?.[0] || null
}

export async function getPointRecords(memberId?: string): Promise<PointRecord[]> {
  let query = supabase
    .from('point_records')
    .select('*, family_members(name, avatar)')
    .order('created_at', { ascending: false })
  
  if (memberId) {
    query = query.eq('member_id', memberId)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('获取积分记录失败:', error)
    return []
  }
  return data
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('获取商品失败:', error)
    return []
  }
  return data
}

export async function addProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
  
  if (error) {
    console.error('添加商品失败:', error)
    return null
  }
  return data?.[0] || null
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
  
  if (error) {
    console.error('更新商品失败:', error)
    return null
  }
  return data?.[0] || null
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('删除商品失败:', error)
    return false
  }
  return true
}

export async function getExchangeRequests(status?: string): Promise<ExchangeRequest[]> {
  let query = supabase
    .from('exchange_requests')
    .select('*, family_members(name, avatar), products(name, points)')
    .order('created_at', { ascending: false })
  
  if (status) {
    query = query.eq('status', status)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('获取兑换申请失败:', error)
    return []
  }
  return data
}

export async function approveExchangeRequest(id: string): Promise<ExchangeRequest | null> {
  const { data: requestData, error: requestError } = await supabase
    .from('exchange_requests')
    .select('member_id, product_id, points')
    .eq('id', id)
    .single()
  
  if (requestError) {
    console.error('获取兑换申请失败:', requestError)
    return null
  }

  await updateMemberPoints(requestData.member_id, -requestData.points)

  await supabase
    .from('products')
    .update({ stock: supabase.raw('stock - 1') })
    .eq('id', requestData.product_id)

  await addPointRecord({
    member_id: requestData.member_id,
    points: -requestData.points,
    type: 'exchange',
    description: '积分兑换'
  })

  const { data, error } = await supabase
    .from('exchange_requests')
    .update({ status: 'approved' })
    .eq('id', id)
  
  if (error) {
    console.error('审核兑换申请失败:', error)
    return null
  }
  return data?.[0] || null
}

export async function rejectExchangeRequest(id: string, reason: string): Promise<ExchangeRequest | null> {
  const { data, error } = await supabase
    .from('exchange_requests')
    .update({ status: 'rejected', reject_reason: reason })
    .eq('id', id)
  
  if (error) {
    console.error('驳回兑换申请失败:', error)
    return null
  }
  return data?.[0] || null
}

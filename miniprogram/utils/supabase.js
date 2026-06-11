import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getFamilyMembers() {
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

export async function addFamilyMember(member) {
  const { data, error } = await supabase
    .from('family_members')
    .insert([{
      name: member.name,
      role: member.role || 'child',
      avatar: member.avatar || '',
      points: member.points || 0,
      is_active: member.is_active || true
    }])
  
  if (error) {
    console.error('添加家庭成员失败:', error)
    return null
  }
  return data[0]
}

export async function updateFamilyMember(id, updates) {
  const { data, error } = await supabase
    .from('family_members')
    .update(updates)
    .eq('id', id)
  
  if (error) {
    console.error('更新家庭成员失败:', error)
    return null
  }
  return data[0]
}

export async function deleteFamilyMember(id) {
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

export async function getTasks() {
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

export async function addTask(task) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      name: task.name,
      description: task.description || '',
      points: task.points,
      type: task.type || 'add',
      is_active: task.is_active || true
    }])
  
  if (error) {
    console.error('添加任务失败:', error)
    return null
  }
  return data[0]
}

export async function updateTask(id, updates) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
  
  if (error) {
    console.error('更新任务失败:', error)
    return null
  }
  return data[0]
}

export async function deleteTask(id) {
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

export async function getPointRequests(status = null) {
  let query = supabase
    .from('point_requests')
    .select('*, family_members(name, avatar), tasks(name)')
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

export async function addPointRequest(request) {
  const { data, error } = await supabase
    .from('point_requests')
    .insert([{
      member_id: request.member_id,
      task_id: request.task_id,
      points: request.points,
      description: request.description || '',
      status: 'pending'
    }])
  
  if (error) {
    console.error('添加积分申请失败:', error)
    return null
  }
  return data[0]
}

export async function approvePointRequest(id) {
  const { data, error } = await supabase
    .from('point_requests')
    .update({ status: 'approved' })
    .eq('id', id)
  
  if (error) {
    console.error('审核积分申请失败:', error)
    return null
  }
  
  const request = data[0]
  if (request) {
    await updateMemberPoints(request.member_id, request.points)
    await addPointRecord({
      member_id: request.member_id,
      points: request.points,
      type: request.points > 0 ? 'add' : 'deduct',
      description: `完成任务: ${request.task_id}`
    })
  }
  
  return data[0]
}

export async function rejectPointRequest(id, reason) {
  const { data, error } = await supabase
    .from('point_requests')
    .update({ status: 'rejected', reject_reason: reason })
    .eq('id', id)
  
  if (error) {
    console.error('驳回积分申请失败:', error)
    return null
  }
  return data[0]
}

export async function updateMemberPoints(memberId, points) {
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

export async function addPointRecord(record) {
  const { data, error } = await supabase
    .from('point_records')
    .insert([{
      member_id: record.member_id,
      points: record.points,
      type: record.type,
      description: record.description || ''
    }])
  
  if (error) {
    console.error('添加积分记录失败:', error)
    return null
  }
  return data[0]
}

export async function getPointRecords(memberId = null) {
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

export async function getProducts() {
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

export async function addProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .insert([{
      name: product.name,
      description: product.description || '',
      points: product.points,
      stock: product.stock || 0,
      is_active: product.is_active || true,
      image: product.image || ''
    }])
  
  if (error) {
    console.error('添加商品失败:', error)
    return null
  }
  return data[0]
}

export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
  
  if (error) {
    console.error('更新商品失败:', error)
    return null
  }
  return data[0]
}

export async function deleteProduct(id) {
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

export async function getExchangeRequests(status = null) {
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

export async function addExchangeRequest(request) {
  const { data: memberData, error: memberError } = await supabase
    .from('family_members')
    .select('points')
    .eq('id', request.member_id)
    .single()
  
  if (memberError) {
    console.error('获取成员积分失败:', memberError)
    return null
  }
  
  const { data: productData, error: productError } = await supabase
    .from('products')
    .select('points, stock')
    .eq('id', request.product_id)
    .single()
  
  if (productError) {
    console.error('获取商品信息失败:', productError)
    return null
  }
  
  if (memberData.points < productData.points) {
    console.error('积分不足')
    return null
  }
  
  if (productData.stock <= 0) {
    console.error('库存不足')
    return null
  }
  
  const { data, error } = await supabase
    .from('exchange_requests')
    .insert([{
      member_id: request.member_id,
      product_id: request.product_id,
      points: productData.points,
      status: 'pending'
    }])
  
  if (error) {
    console.error('添加兑换申请失败:', error)
    return null
  }
  return data[0]
}

export async function approveExchangeRequest(id) {
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
    description: `兑换商品`
  })
  
  const { data, error } = await supabase
    .from('exchange_requests')
    .update({ status: 'approved' })
    .eq('id', id)
  
  if (error) {
    console.error('审核兑换申请失败:', error)
    return null
  }
  return data[0]
}

export async function rejectExchangeRequest(id, reason) {
  const { data, error } = await supabase
    .from('exchange_requests')
    .update({ status: 'rejected', reject_reason: reason })
    .eq('id', id)
  
  if (error) {
    console.error('驳回兑换申请失败:', error)
    return null
  }
  return data[0]
}
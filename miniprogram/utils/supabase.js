const supabaseUrl = 'https://feufomdbxdfnwfmjisda.supabase.co'
const supabaseAnonKey = 'sb_publishable_6l7u5vIJ420YUuYimTunkA_p2xS6MeW'

const headers = {
  'Content-Type': 'application/json',
  'apikey': supabaseAnonKey,
  'Authorization': `Bearer ${supabaseAnonKey}`
}

function request(method, url, data = null) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${supabaseUrl}${url}`,
      method: method,
      header: headers,
      data: data ? JSON.stringify(data) : null,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(res.data || { error: 'Request failed' })
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

export async function getFamilyMembers() {
  try {
    const data = await request('GET', '/rest/v1/family_members?order=created_at.desc')
    return data || []
  } catch (error) {
    console.error('获取家庭成员失败:', error)
    return []
  }
}

export async function addFamilyMember(member) {
  try {
    const data = await request('POST', '/rest/v1/family_members', {
      name: member.name,
      role: member.role || 'child',
      avatar: member.avatar || '',
      points: member.points || 0,
      is_active: member.is_active || true
    })
    return data ? data[0] : null
  } catch (error) {
    console.error('添加家庭成员失败:', error)
    return null
  }
}

export async function updateFamilyMember(id, updates) {
  try {
    const data = await request('PATCH', `/rest/v1/family_members?id=eq.${id}`, updates)
    return data ? data[0] : null
  } catch (error) {
    console.error('更新家庭成员失败:', error)
    return null
  }
}

export async function deleteFamilyMember(id) {
  try {
    await request('DELETE', `/rest/v1/family_members?id=eq.${id}`)
    return true
  } catch (error) {
    console.error('删除家庭成员失败:', error)
    return false
  }
}

export async function getTasks() {
  try {
    const data = await request('GET', '/rest/v1/tasks?order=created_at.desc')
    return data || []
  } catch (error) {
    console.error('获取任务失败:', error)
    return []
  }
}

export async function addTask(task) {
  try {
    const data = await request('POST', '/rest/v1/tasks', {
      name: task.name,
      description: task.description || '',
      points: task.points,
      type: task.type || 'add',
      is_active: task.is_active || true
    })
    return data ? data[0] : null
  } catch (error) {
    console.error('添加任务失败:', error)
    return null
  }
}

export async function updateTask(id, updates) {
  try {
    const data = await request('PATCH', `/rest/v1/tasks?id=eq.${id}`, updates)
    return data ? data[0] : null
  } catch (error) {
    console.error('更新任务失败:', error)
    return null
  }
}

export async function deleteTask(id) {
  try {
    await request('DELETE', `/rest/v1/tasks?id=eq.${id}`)
    return true
  } catch (error) {
    console.error('删除任务失败:', error)
    return false
  }
}

export async function getPointRequests(status = null) {
  try {
    let url = '/rest/v1/point_requests?select=*,family_members(name,avatar),tasks(name)&order=created_at.desc'
    if (status) {
      url += `&status=eq.${status}`
    }
    const data = await request('GET', url)
    return data || []
  } catch (error) {
    console.error('获取积分申请失败:', error)
    return []
  }
}

export async function addPointRequest(request) {
  try {
    const data = await request('POST', '/rest/v1/point_requests', {
      member_id: request.member_id,
      task_id: request.task_id,
      points: request.points,
      description: request.description || '',
      status: 'pending'
    })
    return data ? data[0] : null
  } catch (error) {
    console.error('添加积分申请失败:', error)
    return null
  }
}

export async function approvePointRequest(id) {
  try {
    const requestData = await request('GET', `/rest/v1/point_requests?id=eq.${id}&select=member_id,points,task_id`)
    if (!requestData || !requestData[0]) {
      return null
    }
    const request = requestData[0]
    
    await updateMemberPoints(request.member_id, request.points)
    await addPointRecord({
      member_id: request.member_id,
      points: request.points,
      type: request.points > 0 ? 'add' : 'deduct',
      description: `完成任务: ${request.task_id}`
    })
    
    const data = await request('PATCH', `/rest/v1/point_requests?id=eq.${id}`, { status: 'approved' })
    return data ? data[0] : null
  } catch (error) {
    console.error('审核积分申请失败:', error)
    return null
  }
}

export async function rejectPointRequest(id, reason) {
  try {
    const data = await request('PATCH', `/rest/v1/point_requests?id=eq.${id}`, { status: 'rejected', reject_reason: reason })
    return data ? data[0] : null
  } catch (error) {
    console.error('驳回积分申请失败:', error)
    return null
  }
}

export async function updateMemberPoints(memberId, points) {
  try {
    const memberData = await request('GET', `/rest/v1/family_members?id=eq.${memberId}&select=points`)
    if (!memberData || !memberData[0]) {
      return false
    }
    const currentPoints = memberData[0].points
    const newPoints = currentPoints + points
    await request('PATCH', `/rest/v1/family_members?id=eq.${memberId}`, { points: newPoints })
    return true
  } catch (error) {
    console.error('更新成员积分失败:', error)
    return false
  }
}

export async function addPointRecord(record) {
  try {
    const data = await request('POST', '/rest/v1/point_records', {
      member_id: record.member_id,
      points: record.points,
      type: record.type,
      description: record.description || ''
    })
    return data ? data[0] : null
  } catch (error) {
    console.error('添加积分记录失败:', error)
    return null
  }
}

export async function getPointRecords(memberId = null) {
  try {
    let url = '/rest/v1/point_records?select=*,family_members(name,avatar)&order=created_at.desc'
    if (memberId) {
      url += `&member_id=eq.${memberId}`
    }
    const data = await request('GET', url)
    return data || []
  } catch (error) {
    console.error('获取积分记录失败:', error)
    return []
  }
}

export async function getProducts() {
  try {
    const data = await request('GET', '/rest/v1/products?is_active=eq.true&order=created_at.desc')
    return data || []
  } catch (error) {
    console.error('获取商品失败:', error)
    return []
  }
}

export async function addProduct(product) {
  try {
    const data = await request('POST', '/rest/v1/products', {
      name: product.name,
      description: product.description || '',
      points: product.points,
      stock: product.stock || 0,
      is_active: product.is_active || true,
      image: product.image || ''
    })
    return data ? data[0] : null
  } catch (error) {
    console.error('添加商品失败:', error)
    return null
  }
}

export async function updateProduct(id, updates) {
  try {
    const data = await request('PATCH', `/rest/v1/products?id=eq.${id}`, updates)
    return data ? data[0] : null
  } catch (error) {
    console.error('更新商品失败:', error)
    return null
  }
}

export async function deleteProduct(id) {
  try {
    await request('DELETE', `/rest/v1/products?id=eq.${id}`)
    return true
  } catch (error) {
    console.error('删除商品失败:', error)
    return false
  }
}

export async function getExchangeRequests(status = null) {
  try {
    let url = '/rest/v1/exchange_requests?select=*,family_members(name,avatar),products(name,points)&order=created_at.desc'
    if (status) {
      url += `&status=eq.${status}`
    }
    const data = await request('GET', url)
    return data || []
  } catch (error) {
    console.error('获取兑换申请失败:', error)
    return []
  }
}

export async function addExchangeRequest(request) {
  try {
    const memberData = await request('GET', `/rest/v1/family_members?id=eq.${request.member_id}&select=points`)
    if (!memberData || !memberData[0]) {
      return null
    }
    
    const productData = await request('GET', `/rest/v1/products?id=eq.${request.product_id}&select=points,stock`)
    if (!productData || !productData[0]) {
      return null
    }
    
    if (memberData[0].points < productData[0].points) {
      return null
    }
    
    if (productData[0].stock <= 0) {
      return null
    }
    
    const data = await request('POST', '/rest/v1/exchange_requests', {
      member_id: request.member_id,
      product_id: request.product_id,
      points: productData[0].points,
      status: 'pending'
    })
    return data ? data[0] : null
  } catch (error) {
    console.error('添加兑换申请失败:', error)
    return null
  }
}

export async function approveExchangeRequest(id) {
  try {
    const requestData = await request('GET', `/rest/v1/exchange_requests?id=eq.${id}&select=member_id,product_id,points`)
    if (!requestData || !requestData[0]) {
      return null
    }
    
    const request = requestData[0]
    
    await updateMemberPoints(request.member_id, -request.points)
    
    const productData = await request('GET', `/rest/v1/products?id=eq.${request.product_id}&select=stock`)
    if (productData && productData[0]) {
      await request('PATCH', `/rest/v1/products?id=eq.${request.product_id}`, { stock: productData[0].stock - 1 })
    }
    
    await addPointRecord({
      member_id: request.member_id,
      points: -request.points,
      type: 'exchange',
      description: '兑换商品'
    })
    
    const data = await request('PATCH', `/rest/v1/exchange_requests?id=eq.${id}`, { status: 'approved' })
    return data ? data[0] : null
  } catch (error) {
    console.error('审核兑换申请失败:', error)
    return null
  }
}

export async function rejectExchangeRequest(id, reason) {
  try {
    const data = await request('PATCH', `/rest/v1/exchange_requests?id=eq.${id}`, { status: 'rejected', reject_reason: reason })
    return data ? data[0] : null
  } catch (error) {
    console.error('驳回兑换申请失败:', error)
    return null
  }
}

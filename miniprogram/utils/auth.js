const STORAGE_KEY = 'current_user'

export function setCurrentUser(user) {
  try {
    wx.setStorageSync(STORAGE_KEY, JSON.stringify(user))
  } catch (e) {
    console.error('存储用户信息失败:', e)
  }
}

export function getCurrentUser() {
  try {
    const data = wx.getStorageSync(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('获取用户信息失败:', e)
    return null
  }
}

export function clearCurrentUser() {
  try {
    wx.removeStorageSync(STORAGE_KEY)
  } catch (e) {
    console.error('清除用户信息失败:', e)
  }
}

export function isParent(user) {
  return user && user.role === 'parent'
}

export function isChild(user) {
  return user && user.role === 'child'
}
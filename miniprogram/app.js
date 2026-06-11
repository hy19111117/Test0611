import { supabase } from './utils/supabase'

App({
  onLaunch() {
    console.log('App Launch')
  },

  onShow() {
    console.log('App Show')
  },

  onHide() {
    console.log('App Hide')
  },

  globalData: {
    userInfo: null,
    familyMembers: [],
    currentUser: null
  },

  supabase: supabase
})
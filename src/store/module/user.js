import {
  login,
  logout,
  getUserInfo
} from '@/api/user'
import {setToken, getToken ,removeToken} from '@/libs/platformUtil'
import Vue from 'vue'
import { getPermission } from '@/api/app'
export default {
  state: {
    userName: '',
    avatarImgPath: '',
    token: getToken(),
    unreadCount: 0,
    hasGetInfo: false,
  },
  getters:{
    getToken: state => state.token
  },
  mutations: {
    setMessageCount (state, count) {
      state.unreadCount = count
    },
    setAvatar (state, avatarPath) {
      state.avatarImgPath = avatarPath
    },
    setUserName (state, name) {
      state.userName = name
    },
    setToken (state, token) {
      state.token = token
      setToken(token)
    },
  },
  actions: {
    // 登录
    handleLogin ({ commit }, { userName, passWord,verifyCode,uuid }) {
      userName = userName.trim()
      return new Promise((resolve, reject) => {
        login({
          userName,
          passWord,
          verifyCode,
          uuid
        }).then(res => {
          const result = res.data
          if (result && (result.code === 200 ||  result.code === 11000 )) {
            commit('setToken',result.data)
            commit('setTagNavList', [])
             resolve()
          } else {
            reject(new Error(result.msg))
          }
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      })
    },
    // 退出登录
    handleLogOut ({ state, commit }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('setToken', '')
          commit('setUserName', '')
          removeToken();
           //刷新浏览器，清空动态路由
          setTimeout(() => {
            window.location.reload()
          },0)
          resolve()
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 获取用户相关信息
    getUserInfo({state, commit}) {
      return new Promise((resolve, reject) => {
        getUserInfo().then(res => {
          const result = res.data;
          if (result &&( result.code === 11000 || result.code === 200 )) {
             commit('setAvatar', result.data.avatar)
            commit('setUserName', result.data.userName)
            resolve(result.data)
          } else {
            reject(new Error(result.msg))
          }
        }).catch(err => {
          reject(err)
        })
      })
    },

    getPermissionData({commit}) {
      return new Promise((resolve, reject) => {
        getPermission().then(({data: result}) => {
           if (result && result.code === 11000 && result.data) {
            let permission = {}
            for (const item of result.data) {
              if (item.permissionValue) {
                permission[item.permissionValue] = true
              }
            }
            commit('setPermission', permission)
            resolve(result.data)
          } else {
            reject(new Error(result.msg))
          }
        }).catch((e) => {
          reject(e)
        })
      })
    }
  },

}

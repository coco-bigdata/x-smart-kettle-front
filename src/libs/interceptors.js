 import store from '@/store'
import { Notification, MessageBox, Message } from 'element-ui'
import { getToken ,ERROR_CODE} from '@/libs/platformUtil'
var qs = require('qs');

function requestInterceptors(config) {
  let token = getToken();
  const isToken = (config.headers || {}).isToken === false ;
  //给所有请求添加 携带token 请求
  if(token && !isToken){
    config.headers['Authorization']='Bearer ' + token ;
  }

  if (config.method === 'post') {
    let payload = config.data.payload;
    config.data = config.data.data;
    if(!payload) {
      config.headers['Content-Type'] = "application/json"
      // config.data = qs.stringify(config.data);
    }
  } else if (config.method === 'get') {
    if (config.url.indexOf('?') === -1) {
      config.url = config.url + "?&t=" + new Date().getTime();
    } else {
      config.url = config.url + "&t=" + new Date().getTime();
    }
  }
  return config;
 }

function requestError(error) {
  return Promise.reject(error);
}

function responseInterceptors(res) {
  // 未设置状态码则默认成功状态
  const code = res.data.code || 200 || 11000;
   // 获取错误信息
  const msg = ERROR_CODE[code] || res.data.msg || ERROR_CODE['default']
  if (code === 401) {
    MessageBox.confirm(msg, '系统提示', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      store.dispatch('handleLogOut').then(() => {
        location.href = '/login';
      })
    })
  } else if (code === 500) {
    Message({
      message: msg,
      type: 'error'
    })
    return Promise.reject(new Error(msg))
  } else if (code !== 200 && code !== 11000) {
    Notification.error({
      title: msg
    })
    return Promise.reject(msg)
  } else {
    return res ;
  }
 }

function responseError(error) {
  return Promise.reject(error);
}

function browserDetection() {
  let ua = navigator.userAgent;
  if (ua.match(/Chrome/i)) {
    return true
  } else if (ua.match(/Firefox/i)) {
    return {ok:true}
  } else if (ua.match(/Edge/i)) {
    return {ok:true}
  }else if(ua.match(/Safari/i)){
    return {ok:true}
  }
  else if(ua.match(/MSIE/i)){
    let errorInfo = "<div>您的浏览器暂不支持，建议下载 <a target='view_window' href='https://www.google.cn/chrome'>Chrome</a> 查看该网站</div>"
    return  {ok:false,errorInfo:errorInfo}
  }else if(ua.match(/Trident/i)){
    let errorInfo = "<div>您的浏览器暂不支持，建议下载 <a target='view_window' href='https://www.google.cn/chrome'>Chrome</a> 查看该网站</div>"
    return  {ok:false,errorInfo:errorInfo}
  }
  else {
    let errorInfo = "<div>您的浏览器体验效果不佳，建议下载 <a target='view_window' href='https://www.google.cn/chrome/'>Chrome</a> 查看该网站</div>"
    return  {ok:false,errorInfo:errorInfo}
  }
}

export default {
  requestInterceptors: requestInterceptors,
  responseInterceptors: responseInterceptors,
  requestError: requestError,
  responseError: responseError,
  browserDetection
}

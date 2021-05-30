import axios from 'axios'
import store from '@/store'
import { Notification, MessageBox, Message } from 'element-ui'
import { getToken ,ERROR_CODE} from '@/libs/platformUtil'
var qs = require('qs');

class HttpRequest {
  constructor(baseUrl = baseURL) {
    this.baseUrl = baseUrl
  }

  getInsideConfig() {
    const config = {
      baseURL: this.baseUrl,
      headers: {
        //
      }
    }
    return config
  }

  interceptors(instance) {
    // 请求拦截
    instance.interceptors.request.use(config => {
      let token = getToken();
      const isToken = (config.headers || {}).isToken === false ;
      //给所有请求添加 携带token 请求
      if(token && !isToken){
        config.headers['Authorization']='Bearer ' + token ;
      }
      if (config.method === 'post') {
        config.data = qs.stringify(config.data);
      } else if (config.method === 'get') {
        if (config.url.indexOf('?') === -1) {
          config.url = config.url + "?&t=" + new Date().getTime();
        } else {
          config.url = config.url + "&t=" + new Date().getTime();
        }
      }
      return config;
    }, error => {
      return Promise.reject(error)
    })
    // 响应拦截
    instance.interceptors.response.use(res => {
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
      } else if (code !== 200 && code !== 11000 ) {
        Notification.error({
          title: msg
        })
        return Promise.reject(msg)
      } else {
        return res ;
      }
    }, error => {
      return Promise.reject(error)
    })
  }

  request(options) {
    const instance = axios.create()
    options = Object.assign(this.getInsideConfig(), options)
    this.interceptors(instance)
    return instance(options)
  }
}

export default HttpRequest

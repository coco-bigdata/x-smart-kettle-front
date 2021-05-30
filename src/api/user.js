import util from '@/libs/util.js'
import config from '@/config/config'

/**
 * 获取验证码
 */
export const   getVerifyImage = ({param}) => {
  return util.ajax.get(config.xtlServerContext+'/capcha/verifyImg')
}

export const login = ({userName, passWord,verifyCode,uuid}) => {
  const param = {
    userName:userName,
    passWord:passWord,
    verifyCode: verifyCode,
    uuid:uuid
  }
  return   util.ajax.post(config.xtlServerContext+'/sso/login', param)
}


export const getUserInfo = () => {

  return  util.ajax.get(config.xtlServerContext+'/sso/getUserInfo') ;
}



export const logout = (token) => {

 return  util.ajax.delete(config.xtlServerContext+ '/sso/force/'+token) ;

}


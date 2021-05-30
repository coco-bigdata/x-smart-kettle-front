<template>
  <Form ref="loginForm" :model="form" :rules="rules" @keydown.enter.native="handleSubmit">
    <FormItem prop="userName">
      <Input  size="large" v-model="form.userName" placeholder="请输入用户名">
        <span slot="prepend">
          <Icon :size="24" type="ios-person"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem prop="passWord">
      <Input   size="large"  type="password" v-model="form.passWord" placeholder="请输入密码">
        <span slot="prepend">
          <Icon :size="24" type="md-lock"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem prop="verifyCode">
      <Input   size="large"   v-model="form.verifyCode" placeholder="验证码">
      </Input>
      <img :src="base64_image" @click="fleshVerify" title="换一张"
        border="0" style="		width: 100px;		display: block;		margin-top: 10px;cursor: pointer" />
    </FormItem>
    <FormItem>
      <Button @click="handleSubmit" type="primary"  :loading="loading" long>登录</Button>
    </FormItem>
  </Form>
</template>
<script>
   import { getVerifyImage } from '@/api/user'
  export default {
  name: 'LoginForm',
  props: {
    userName: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '账号不能为空', trigger: 'blur' }
        ]
      }
    },
    passWord: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '密码不能为空', trigger: 'blur' }
        ]
      }
    },
    verifyCode: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '验证码不能为空', trigger: 'blur' }
        ]
      }
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
       base64_image: "",
      form: {
        userName: '',
        passWord: '',
        verifyCode: '',
        uuid: ''
      }
    }
  },
    created () {
      this.fleshVerify();
    },
    computed: {
    rules () {
      return {
        userName: this.userName,
        passWord: this.passWord,
        verifyCode: this.verifyCode
      }
    }
  },
  methods: {
    fleshVerify() {
      var that = this;
      var random = Math.random();
      getVerifyImage({
        t: random
      }).then(function(res) {
        if (res && res.data && res.data.code)
        {
          let imgSrc = res.data.data.code ;
          that.base64_image ="data:image/jpeg;base64,"+imgSrc.replace(/=+$/,'');
          that.form.uuid = res.data.data.uuid
        }

      }).catch((err) => {
        this.$Message.error("获取验证码异常,错误信息:" + err);
      })
    },
    handleSubmit () {
      let params ={
        userName:this.form.userName,
        passWord: this.form.passWord,
        verifyCode: this.form.verifyCode,
        uuid : this.form.uuid
      }
       this.$refs.loginForm.validate((valid) => {
         let that = this;
         if (valid) {
           that.$emit("on-success-valid",params);
        }else {
           that.$Message({
            showClose: true,
            message: '登录失败,失败原因:' + res.msg,
            type: 'error'
          })
        }
      })
    }
  }
}
</script>

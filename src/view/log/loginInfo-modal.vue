<template>
  <Modal
    v-model="modal"
    width="600"
     @on-ok="repoOk"
    @on-cancel="repoCancel"
>
    <Form :label-width="120">
      <FormItem label="用户名称">
        {{row.userName}}
      </FormItem>
      <FormItem label="远端IP">
        {{row.ipaddr}}
       </FormItem>
      <FormItem label="登录地址">
        {{row.loginLocation}}
      </FormItem>
      <formItem label="使用浏览器" >
        {{row.browser}}
      </formItem>
      <formItem label="使用操作系统" >
        {{row.os}}
      </formItem>
      <formItem label="登录消息体" >
      {{logText}}
      </formItem>
      <formItem label="登录时间" >
        {{row.loginTime}}
      </formItem>
    </Form>
  </Modal>
 </template>
<script>
   export default {
    name: "loginInfo-modal",

    props: {
      loginInfoModal: {
        type: Boolean,
        default: false
      },
      row:{
        type: Object,
        default: ''
      },

    },
    data() {
      return {
        modal:false
       }
    },

    created() {

      },
    mounted () {

    },
    computed:{
      logText(){
        return this.row.msg ;
      }
    },
    watch:{
      loginInfoModal(val) {
        this.modal = val
       }
    },
    methods: {
      repoOk() {
        this.modal = true
        this.$emit('on-ok')
      },
      repoCancel() {
        this.$emit('on-cancel')
      }
    }
  }
</script>

<style scoped>

  .demo-split{
    height: 100%;
    border: 1px solid #dcdee2;
  }
  .demo-split-pane{
    padding: 10px;
  }

</style>

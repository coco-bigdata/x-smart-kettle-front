<template>
  <Modal
    v-model="modal"
    width="1000"
    @on-ok="repoOk"
    @on-cancel="repoCancel"
  >
    <Form :label-width="120">
      <Row  :gutter="24" >
        <i-col  :lg="12"  >
          <FormItem label="模块名称">
            {{row.moduleName}}
          </FormItem>
          <FormItem label="操作类型">
            {{row.operatorName}}
          </FormItem>
          <FormItem label="调用方法"  >
            {{row.method}}
          </FormItem>
          <formItem label="请求类型" >
            {{row.requestType}}
          </formItem>
          <formItem label="客户端类型" >
            {{row.clientType}}
          </formItem>
          <formItem label="操作人员" >
            {{row.operUserName}}
          </formItem>
          <formItem label="操作结果" >
            {{row.status}}
          </formItem>
          <formItem label="消息描述" >
            {{row.errorMsg}}
          </formItem>
          <formItem label="操作时间" >
            {{row.operTime}}
          </formItem>
        </i-col>
        <i-col  :lg="12" >
          <FormItem label="所属部门">
            {{row.operDeptName}}
          </FormItem>
          <FormItem label="操作URL">
            {{row.operUrl}}
          </FormItem>
          <FormItem label="远程IP">
            {{row.operIp}}
          </FormItem>
          <formItem label="操作地点" >
            {{row.operLocation}}
          </formItem>
          <formItem label="请求参数" >
            <Input v-model="logText" type="textarea" :rows="4"
                   style="overflow-y:scroll" placeholder="Enter something..." onscroll="false" />
          </formItem>
          <formItem label="返回参数" >
            {{row.jsonResult}}
          </formItem>

        </i-col>
      </Row>
    </Form>
  </Modal>
</template>
<script>
  export default {
    name: "oper-modal",

    props: {
      operModal: {
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
        return this.row.operParam;
      }
    },
    watch:{
      operModal(val) {
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

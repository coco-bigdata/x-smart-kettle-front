<template>
  <div>
    <xtl-page :show-header="false">
      <xtl-search @do-search="doSearch">
        <div>
          <Form :label-width="120">
            <FormItem label="登录地址">
              <Input v-model="searchForm.ipAddr" placeholder="请输入登录地址" style="width: 200px"/>
            </FormItem>
            <FormItem label="用户名称">
              <Input v-model="searchForm.userName" placeholder="请输入用户名称" style="width: 200px"/>
            </FormItem>
            <FormItem label="登录状态">
              <Select v-model="searchForm.status" transfer :multiple="false" style="width: 200px;">
                <Option value="">请选择</Option>
                <Option value="登录成功" ></Option>
                <Option value="登录失败" ></Option>
              </Select>
            </FormItem>
            <formItem label="登录时间" >
              <DatePicker @on-change="dateChange"  type="daterange" format="yyyy-MM-dd"
                          placeholder="选择日期" :value = "iniDate"
                          style="width: 200px"></DatePicker>
            </formItem>
          </Form>
        </div>
      </xtl-search>
      <xtl-table
        :row-class-name="rowClassName"
         :columns="tableColumns"
        @on-row-click="onRowClick"
                   v-bind="tableProps"
        @on-selection-change="onSelectionChange"  border >
        <div slot="buttons">
           <Button   type='error' ghost icon="ios-trash" @click="doBatchDel">清空</Button>
         </div>
      </xtl-table>
      <login-info-modal :loginInfoModal="loginInfoModal"  :row="selection" @on-ok="onrepoModalOk" @on-cancel="onrepoModalCancel" ></login-info-modal>
    </xtl-page>
   </div>
</template>

<script>
  import util from '@/libs/util.js';
  import config from '@/config/config';
  import loginInfoModal from "@/view/log/loginInfo-modal";

  // 设置为无效,则该作业将会废弃,不再执行
  const downloadButton = (vm, h, currentRow) => {
    return h('Button', {
      props: {
        type: "dashed",
        size: "small",

      },
      style: {
        margin: "0 5px"
      },
      on: {
        "click": () => {
          vm.doGetInfo(currentRow);
        }
      }
    }, '查看详情');
  };


  export default {
    name: "index",
    inject:['reload'],
    components: {
      loginInfoModal
    },
     data() {
      return {
        loginInfoModal: false,
         isMonitorEnabled:false,
         idSelectedArr: [],
        iniDate:[util.formatDate(util.getBeforeOrNxtDay(-1)), util.formatDate(util.getBeforeOrNxtDay(1))],
         searchForm: {
          loginStartTime:util.formatDate(util.getBeforeOrNxtDay(-1)),
          loginEndTime: util.formatDate(util.getBeforeOrNxtDay(1)),
          userName:'',
          ipAddr:'',
          status:'',
        },
         selection: {
           userName:'',
           ipaddr:'',
           loginLocation:'',
           browser:'',
           os:'',
           status:'',
           msg:'',
           loginTime:''
        },
        tableProps: {
          dataUrl: config.xtlServerContext + "/log/loginedUserList",
          data: [],
          searchParams: {
            loginStartTime:util.formatDate(util.getBeforeOrNxtDay(-1)),
            loginEndTime: util.formatDate(util.getBeforeOrNxtDay(1))
          },
        }
      }
    },
    computed: {
      tableColumns() {
        let columns = [];
        let self = this;
        columns.push({
            title: "选择",
            type: "selection",
            align: "center",
            width: "80",
          },
          {
            title: "用户名称",
            align: "left",
            width: "250",
            sortable: true,
            resizable: true,
            render: function (h, param) {
              let name = param.row.userName;
              if (name) {
                return h("strong", {
                  style:{
                    color:'#fff'
                  }
                }, name);
              }
            },
          },
          {
            title: "登录地址",
            align: "left",
            key: 'ipaddr',
            resizable: true,
            width: "150",
          },
          {
            title: "登录地点",
            key: "loginLocation",
            align: "center",
            sortable: true,
            width: "250",
          },
          {
            title: "终端类型(浏览器)",
            key: "browser",
            align: "center",
            sortable: true,
            width: "250",
          },
          {
            title: "操作系统",
            key: "os",
            align: "center",
            sortable: true,
            width: "250",
          },
          {
            title: "登录状态",
            key: "status",
            align: "center",
            width: "150"
          },
          {
            title: "登录时间",
            key: "loginTime",
            align: "center",
            sortable: true,
            width: "250",
          },
        );
        columns.push({
          title: "操作",
          key: "operation",
          align: "center",
          fixed: "right",
          width: '120',
          render: function (h, param) {
            return h("div", [
              downloadButton(self,h,param.row),
            ]);
          }
        });
        return columns;
      }
    },
    mounted() {
      this.initData();
    },
    methods: {
      onrepoModalOk(node) {
        this.loginInfoModal = false
      },
      onrepoModalCancel() {
        this.loginInfoModal = false
      },
      onSelectionChange: function (selection) {
        let self = this;
        self.idSelectedArr = [];
        for (let item of selection) {
          self.idSelectedArr.push(item.id);
        }
      },
      doBatchDel(row) {
        let self = this;
        let idSelectedArr = self.idSelectedArr;
        if (idSelectedArr.length === 0) {
          self.$Message.info('请至少选择一条记录！');
        } else {

          self.$Modal.confirm({
            title: '操作提示',
            content: '<p>执行此操作,将会彻底清除,请谨慎操作!</p>',
            okText: '清理登录信息',
            cancelText: '取消',
            onOk: () => {
              util.ajax.get(config.xtlServerContext+"/log/deleteLoginInfo",{
                params:{
                  ids:idSelectedArr.toString()
                }
              }).then(function(resp) {
                let result = resp.data ;
                if(result.code === 11000){
                  self.$Message.success("清理成功!!");
                  self.reload();
                }
              }).catch((err) => {
                this.$Message.error("清理异常,错误信息:" + err);
              })
            },
            onCancel: () => {
              self.reload();
            }
          });
        }

      },
      rowClassName (row, index) {

        return '';
      },
      dateChange : function (e) {
        this.iniDate = e;
        this.searchForm.loginStartTime = e[0];
        this.searchForm.loginEndTime = e[1];
      },
      initData() {
      },
      doSearch() {
        this.tableProps.searchParams = Object.assign({}, this.searchForm);
      },

      onRowClick(val) {
         this.selection = val;
       },

      doGetInfo() {
          let self = this
          self.loginInfoModal = true
       }

    },
  }
</script>

<style>
  .ivu-table .demo-table-error-row td{
    background-color: #ff6600 !important;
    color: #ffffff;
  }
</style>

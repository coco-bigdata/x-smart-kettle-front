<template>
  <div>
    <xtl-page :show-header="false">
      <xtl-search @do-search="doSearch">
        <div>
          <Form :label-width="120">
            <FormItem label="模块名称">
              <Input v-model="searchForm.moduleName" placeholder="请输入登录地址" style="width: 200px"/>
            </FormItem>
            <FormItem label="操作类型">
              <Select v-model="searchForm.operatorName" transfer :multiple="false" style="width: 200px;">
                <Option value="">请选择</Option>
                <Option v-for="item in operTypeDicts" :value="item.dictKey" :key="item.dictKey">
                  {{item.dictValue }}
                </Option>
              </Select>
             </FormItem>
            <FormItem label="状态">
              <Select v-model="searchForm.status" transfer :multiple="false" style="width: 200px;">
                <Option value="">请选择</Option>
                <Option value="成功" ></Option>
                <Option value="失败"/>
              </Select>
            </FormItem>
            <formItem label="操作时间" >
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
          <Button  type='error' ghost icon="ios-trash" @click="doBatchDel">清空</Button>
        </div>
      </xtl-table>
      <oper-modal :operModal="operModal"  :row="selection" @on-ok="onrepoModalOk" @on-cancel="onrepoModalCancel" ></oper-modal>
    </xtl-page>
  </div>
</template>

<script>
  import util from '@/libs/util.js';
  import config from '@/config/config';
  import operModal from "@/view/log/oper-modal";

  // 设置为无效,则该作业将会废弃,不再执行
  const doGetInfo = (vm, h, currentRow) => {
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
      operModal
    },
    data() {
      return {
        operModal: false,
        operTypeDicts:[],
         idSelectedArr: [],
        iniDate:[util.formatDate(util.getBeforeOrNxtDay(-1)), util.formatDate(util.getBeforeOrNxtDay(1))],
        searchForm: {
          operStartTime:util.formatDate(util.getBeforeOrNxtDay(-1)),
          operEndTime: util.formatDate(util.getBeforeOrNxtDay(1)),
          moduleName:'',
          operatorName:'',
          status:'',
        },
        selection: {
          moduleName:'',
          operatorName:'',
          method:'',
          requestType:'',
          clientType:'',
          operUserName:'',
          operDeptName:'',
          operUrl:'',
          operIp:'',
          operLocation:'',
          operParam:'',
          jsonResult:'',
          status:'',
          errorMsg: '',
          operTime:''
        },
        tableProps: {
          dataUrl: config.xtlServerContext + "/log/userBehaviorLog",
          data: [],
          searchParams: {
            operStartTime:util.formatDate(util.getBeforeOrNxtDay(-1)),
            operEndTime: util.formatDate(util.getBeforeOrNxtDay(1))
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
            title: "模块名称",
            align: "left",
            width: "250",
            sortable: true,
            resizable: true,
            render: function (h, param) {
              let name = param.row.moduleName;
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
            title: "操作类型",
            align: "left",
            key: 'operatorName',
            resizable: true,
            width: "100",
          },
          {
            title: "客户端类型",
            key: "clientType",
            align: "center",
            sortable: true,
            width: "250",
          },
          {
            title: "操作人员",
            key: "operUserName",
            align: "center",
            sortable: true,
            width: "150",
          },
          {
            title: "远程IP",
            key: "operIp",
            align: "center",
            sortable: true,
            width: "200",
          },
          {
            title: "操作地点",
            key: "operLocation",
            align: "center",
            width: "150"
          },
          {
            title: "操作结果",
            key: "status",
            align: "center",
            sortable: true,
            width: "150",
          },
          {
            title: "操作时间",
            key: "operTime",
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
              doGetInfo(self,h,param.row),
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
        this.operModal = false
      },
      onrepoModalCancel() {
        this.operModal = false
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
            okText: '清理操作信息',
            cancelText: '取消',
            onOk: () => {
              util.ajax.get(config.xtlServerContext+"/log/deleteOperLog",{
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
        this.searchForm.operStartTime = e[0];
        this.searchForm.operEndTime = e[1];
      },
      initData() {
        let self = this;
        util.ajax.get(config.xtlServerContext+"/provider/getSysDicts",{
          params:{
            dictType : 'supported_oper_type'
          }
        }).then(function(resp) {
          self.operTypeDicts = resp.data.data;
        }).catch((err) => {
          this.$Message.error("获取字典错误,错误信息:" + err);
        })
      },
      doSearch() {
        this.tableProps.searchParams = Object.assign({}, this.searchForm);
      },

      onRowClick(val) {
        this.selection = val;
      },

      doGetInfo() {
        let self = this
        self.operModal = true
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

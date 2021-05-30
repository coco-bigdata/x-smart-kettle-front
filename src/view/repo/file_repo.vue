<template>
  <div>
    <xtl-page :show-header="false">
      <xtl-search @do-search="doSearch">
        <div>
          <Form :label-width="120">
            <FormItem label="资源库名称">
              <Input v-model="searchForm.repoName" placeholder="按资源库名称查询" style="width: 200px"/>
            </FormItem>
          </Form>
        </div>
      </xtl-search>
      <xtl-table
        :row-class-name="rowClassName"
        :columns="tableColumns"
        v-bind="tableProps"  border >
        <div slot="buttons">
          <Button   type='warning' ghost icon="ios-cash" @click="doInsert">新增</Button>
        </div>
      </xtl-table>
    </xtl-page>
  </div>
</template>

<script>
  import util from '@/libs/util.js';
  import config from '@/config/config';
  import JobModal from "@/view/job/job-modal";
  import ImageModal from "@/view/job/image-modal";


  // 设置为无效,则该作业将会废弃,不再执行
  const editOpButton = (vm, h, currentRow) => {
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
          vm.doEdit(currentRow.repoId);
        }
      }
    }, '编辑');
  };


  // 设置为无效,则该作业将会废弃,不再执行
  const delOpButton = (vm, h, currentRow) => {
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
          vm.doDelOp(currentRow.repoId);
        }
      }
    }, '删除');
  };

  export default {
    name: "index",
    inject:['reload'],
    components: {

    },
    data() {
      return {
        idSelectedArr: [],
        searchForm: {
          repoName:'',
        },
        databaseTypeList: [],
        selection: {
          repoId:'',
        },
        tableProps: {
          dataUrl: config.xtlServerContext + "/api/xrepo/listFileRepoList",
          data: [],
          searchParams: {},
        }
      }
    },
    computed: {
      tableColumns() {
        let columns = [];
        let self = this;
        columns.push({
            title: "选择",
            type: "single-selection",
            align: "center",
            width: "80",
          },
          {
            title: "资源库名称",
            align: "left",
            width: "200",
            key:'repoName',
            sortable: true,
            resizable: true,
          },
          {
            title: "资源库路径",
            key: "result",
            key:'baseDir',
            align: "center",
            width: "350",
          },

          {
            title: "文件系统类型",
            align: "left",
            key: 'type',
            resizable: true,
            width: "200",
          },

          {
            title: "创建时间",
            align: "left",
            key: 'createdTime',
            width: "200",
          }
        );
        columns.push({
          title: "操作",
          align: "center",
          fixed: "right",
          width: '300',
          render: function (h, param) {
            return h("div", [
              editOpButton(self,h,param.row),
              delOpButton(self,h,param.row)
            ]);
          }
        });
        return columns;
      }
    },
    mounted() {

     },
    methods: {
      rowClassName (row, index) {

        return '';
      },


      doSearch() {
        this.tableProps.searchParams = Object.assign({}, this.searchForm);
      },

      doInsert(){
        this.$router.push({
          name: '编辑文件库资源库'
        });
      },

      doEdit(repoId) {
        this.$router.push({
          name: "编辑文件库资源库",
          query: {
            repoId
          },
          params: {
            page: 'file_edit_repo'
          }
        });
      },

      doDelOp(repoId) {
        let self = this

        self.$Modal.confirm({
          title: '操作提示',
          content: '<p>确定删除?</p>',
          okText: '删除',
          cancelText: '取消',
          onOk: () => {
            util.ajax.get(config.xtlServerContext+"/op/xrepository/delete/"+repoId).then(function(resp) {
              let data = resp.data;
              if (data.code ===11000){
                self.$Message.success(data.msg);
                self.reload();
              }
            }).catch((err) => {
              this.$Message.error("资源库删除异常,错误信息:" + err);
            })
          },
          onCancel: () => {
            self.reload();
          }
        });
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

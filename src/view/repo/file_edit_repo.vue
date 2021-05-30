<template>
  <div>
    <Card dis-hover :bordered="isbordered">
      <p slot="title">
        {{title}}
      </p>
      <div slot="extra">
        <Button type="default" @click="pageGoBack">返回</Button>
      </div>
      <Row>
        <Col span="14" offset="5">
          <Form  ref="form" :model="form" :label-width="140" :rules="ruleValidate">
            <FormItem label="资源库名称" prop="repoName">
              <Input v-model="form.repoName" placeholder="请输入资源库名称"></Input>
            </FormItem>

            <FormItem   label="文件系统类型" prop="type">
              <Select v-model="form.type" placeholder="请选择文件系统类型">
                <Option  value="File" key="File">File</Option>
                <Option  value="FTP" key="FTP">FTP</Option>
                <Option  value="FTPS" key="FTPS">FTPS</Option>
                <Option  value="SFTP" key="SFTP">SFTP</Option>
                <Option  value="HDFS" key="HDFS">HDFS</Option>
              </Select>
            </FormItem>
            <FormItem v-if="form.type!=='File'" label="远程地址" prop="dbHost">
              <Input   v-model="form.dbHost" placeholder="请输入数据库连接地址" ></Input>
            </FormItem>
            <FormItem  v-if="form.type!=='File'"  label="远程端口" prop="dbPort">
              <Input   v-model="form.dbPort" placeholder="请输入数据库连接端口" ></Input>
            </FormItem>
            <FormItem label="基础路径" prop="baseDir" >
              <Input   v-model="form.baseDir" placeholder="请输入基础路径" ></Input>
            </FormItem>
            <FormItem   label="示例" style="color: red">
                /tmp(windows系统:d:/tmp,linux系统:/tmp)
             </FormItem>
            <FormItem  v-if="form.type !=='File'"  label="远程连接用户名" prop="dbUsername">
              <Input   v-model="form.dbUsername" placeholder="请输入数据库用户名" ></Input>
            </FormItem>
            <FormItem  v-if="form.type !=='File'"  label="远程连接密码" prop="dbPassword">
              <Input   v-model="form.dbPassword" placeholder="请输入数据库密码" ></Input>
            </FormItem>
            <FormItem>
              <Button type="primary" @click="formSubmit" :loading="loading">保存</Button>&nbsp;
              <Button type="default" @click="formReset">重置</Button>&nbsp;
              <Button   type="info"  @click="testConnection">测试连接</Button>
            </FormItem>
          </Form>
        </Col>
      </Row>
    </Card>
  </div>
</template>

<script>
  import util from '@/libs/util.js';
  import {deepCopy} from '@/libs/assist.js';
  import config from '@/config/config';
  export default {

    data() {

      return {
        isbordered:false,
        loading:false,
        form: {
          id:"",
          repoName: "",
          type:"",
          baseDir: "",
          repoUsername: "",
          repoPassword: "",
          repoType: "",
          dbAccess:"",
          dbHost:"",
          dbPort:"",
          dbName:"",
          dbUsername:'',
          dbPassword:'',
          isDel:''
        },
        ruleValidate: {
          repoName: [
            {required:true,max: 30,message: '资源库名称不能为空',trigger: 'blur'}
          ],
          type: [
            {required: true, message: '必须选择文件系统类型', trigger: 'blur'},
          ],
          baseDir: [
            {required: true, message: '必须输入文件库基础路径', trigger: 'blur'},
          ],

          dbHost:[
            {required: true, message: '请输入远程连接地址', trigger: 'blur'}
          ],
          dbPort:[
            {required: true, message: '请输入远程连接端口', trigger: 'blur'},
            {validator:this.$Valid.isInteger}
          ],
          dbUsername:[
            {required: true,max:30, message: '请输入远程连接用户名', trigger: 'blur'}
          ],
          dbPassword:[
            {required: true,max:30, message: '请输入远程连接密码', trigger: 'blur'}
          ]
        },
        created: false,
        RepoTypeEnum: [],
      }
    },
    created() {

    },
    computed:{
      title: function() {
        return this.$route.meta.title;
      },
      repoId: function () {
        return this.$route.query.repoId
      }
    },

    methods: {
      testConnection() {
        let self = this;
        let params = deepCopy(self.form);
        params.dbPassword = btoa(params.dbPassword);
        self.$refs.form.validate((valid) => {
          if (valid) {
            const msg = this.$Message.loading({
              content: "正在连接远程机器"+self.form.dbHost+"...",
              duration: 0
            });
            util.ajax.post(config.xtlServerContext + "/api/xrepo/testRemoteConnection", params, true)
              .then(function (resp) {
                let data = resp.data;
                // 销毁 loading 消息
                setTimeout(msg, 0);
                let code =data.code ;

                if (code === 11000) {
                  self.$Message.success(data.msg);
                } else {
                  self.$Message.error('连接出现异常',data.msg);
                }
              })
              .catch(function (err) {
                // 销毁 loading 消息
                setTimeout(msg, 0);
                self.$Message.error("测试连接远程机器"+self.form.dbHost+"出现异常",err);
              });
          }
        });
      },
      formSubmit: function() {
        var self = this;

        self.$refs.form.validate((valid) => {
          if(valid) {
            self.loading=true;
            var params = {
              repoId:self.repoId,
              repoName:self.form.repoName,
              type:self.form.type,
              baseDir:self.form.baseDir,
              repoUsername:self.form.repoUsername,
              repoPassword:self.form.repoPassword,
              repoType:self.form.repoType,
              dbAccess:self.form.dbAccess,
              dbHost:self.form.dbHost,
              dbPort:self.form.dbPort,
              dbName:self.form.dbName,
              dbUsername:self.form.dbUsername,
              dbPassword:self.form.dbPassword,
              isDel:self.form.isDel
            }
            if(self.repoId) {
              util.ajax.post(config.xtlServerContext+"/op/xrepository/update",params).then(function(resp) {
                self.$Message.success('更新资源库成功');
                self.loading=false;
                self.pageGoBack();
              }).catch(function(err) {
                self.$Message.error('保存失败,请联系系统管理员');
                self.loading=false;
                self.pageGoBack();
              });
            } else {
              util.ajax.post(config.xtlServerContext+"/op/xrepository/add", params).then(function(resp) {
                self.$Message.success('保存资源库成功');
                self.loading=false;
                self.pageGoBack()
              }).catch(function(err) {
                self.$Message.error('新增失败,请联系系统管理员');
                self.loading=false;
                self.pageGoBack();
              });

            }
          }
        })
      },

      formReset() {
        this.$refs.form.resetFields();
      },
      pageGoBack() {
        this.$router.push({
          name: '文件库资源库'
        })
      },

      initRepoTree:function () {
        let self = this;
        if(self.repoId){
          util.ajax.get(config.xtlServerContext+"/op/xrepository/get/"+self.repoId).then(function (resp) {
            self.form=resp.data.data;
          }).catch(function(err) {
            self.$Message.error('获取资源库数据失败,请联系系统管理员');
            self.pageGoBack();
          });
        }
      }
    },
    mounted: function() {
       this.initRepoTree();
    }
  }
</script>

<style>

</style>

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
        <Col span="14" offset="6">
          <Form  ref="form" :model="form" :label-width="120" :rules="ruleValidate">
            <FormItem label="资源库名称" prop="repoName">
              <Input v-model="form.repoName" placeholder="请输入资源库名称"></Input>
            </FormItem>

            <FormItem   label="资源库用户名" prop="repoUsername">
              <Input v-model="form.repoUsername" placeholder="请输入资源库登录用户名"></Input>
            </FormItem>
            <FormItem  label="资源库密码" prop="repoPassword">
              <Input    v-model="form.repoPassword" placeholder="请输入资源库登录密码" ></Input>
            </FormItem>
            <FormItem   label="数据库类型" prop="repoType">
              <Select v-model="form.repoType" placeholder="数据库类型">
                <Option v-for="item in RepoTypeEnum" :value="item.dictValue" :key="item.dictValue">{{ item.dictValue }}</Option>
              </Select>
            </FormItem>
            <FormItem   label="数据库访问方式" prop="dbAccess">
              <Select v-model="form.dbAccess" placeholder="请选择数据库访问方式">
                <Option  value="Native" key="Native">Native</Option>
                <Option  value="Jndi" key="Jndi">Jndi</Option>
              </Select>
            </FormItem>
            <FormItem label="数据库地址" prop="dbHost">
              <Input   v-model="form.dbHost" placeholder="请输入数据库连接地址" ></Input>
            </FormItem>
            <FormItem   label="数据库端口" prop="dbPort">
              <Input   v-model="form.dbPort" placeholder="请输入数据库连接端口" ></Input>
            </FormItem>
            <FormItem  label="数据库实例名" prop="dbName">
              <Input   v-model="form.dbName" placeholder="请输入数据库实例名" ></Input>
            </FormItem>
            <FormItem  label="数据库用户名" prop="dbUsername">
              <Input   v-model="form.dbUsername" placeholder="请输入数据库用户名" ></Input>
            </FormItem>
            <FormItem   label="数据库密码" prop="dbPassword">
              <Input   v-model="form.dbPassword" placeholder="请输入数据库密码" ></Input>
            </FormItem>
            <FormItem label="资源库有效性" prop="isDel">
              <RadioGroup v-model="form.isDel" >
                <Radio :label=1>有效</Radio>
                <Radio :label=0>无效</Radio>
              </RadioGroup>
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
          type:"db",
          baseDir: "",
          repoUsername: "",
          repoPassword: "",
          repoType: "",
          dbAccess:"Native",
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
          baseDir: [
            {required: true, message: '必须输入文件库基础路径', trigger: 'blur'},
          ],
          repoUsername:[
            {required: true,max:30, message: '必须输入资源库登录名称', trigger: 'blur'}
          ],
          repoPassword:[
            {required: true, max:30,message: '必须输入资源库登录密码', trigger: 'blur'}
          ],
          repoType:[
            {required: true, message: '必须选择数据库类型', trigger: 'blur'}
          ],
          dbHost:[
            {required: true, message: '请输入数据库连接地址', trigger: 'blur'}
          ],
          dbPort:[
            {required: true, message: '请输入数据库端口', trigger: 'blur'},
            {validator:this.$Valid.isInteger}
          ],
          dbName:[
            {required: true, message: '请输入数据库实例名', trigger: 'blur'}
          ],
          dbUsername:[
            {required: true,max:30, message: '请输入数据库用户名', trigger: 'blur'}
          ],
          dbPassword:[
            {required: true,max:30, message: '请输入数据库密码', trigger: 'blur'}
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
              content: "正在连接数据库...",
              duration: 0
            });
            util.ajax.post(config.xtlServerContext + "/api/xrepo/testConnection", params, true)
              .then(function (resp) {
                let data = resp.data;
                // 销毁 loading 消息
                setTimeout(msg, 0);
                let code =data.code ;

                if (code === 11000) {
                  self.$Message.success(data.msg);
                } else {
                  self.$Message.error('连接出现异常');
                }
              })
              .catch(function (err) {
                // 销毁 loading 消息
                setTimeout(msg, 0);
                self.$Message.error("测试连接数据库出现异常");
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
          name: '数据库资源库'
        })
      },
      initData: function() {
        var self = this;
        util.ajax.get(config.xtlServerContext+"/api/xrepo/getRepoTypeDicts").then(function(resp) {
          self.RepoTypeEnum = resp.data.data;
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
      this.initData()
      this.initRepoTree();
    }
  }
</script>

<style>

</style>

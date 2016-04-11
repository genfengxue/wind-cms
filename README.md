# wind-cms
wind cms system based on keystonejs

## 可能遇到的问题
* 应用启动后，报错：`Failed to load c++ bson extension, using pure JS version`

这个错误本来无关紧要，是因为bson编译失败导致无法加载C++实现的扩展，只能使用js实现的版本。
可以无视这个错误，如果要处理，可以操作如下：
```sh
cd node_modules/keystone/

#删除package.json中mongoose那一行，然后重新安装最新的版本，最新版貌似避免了对C++ bson的依赖
npm i --save --save-exact mongoose --verbose
```

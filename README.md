## CMS
本系统基于keystone.js

### 环境
- node // 我们使用nvm来管理node版本
- mongo // 绑定到本地端口访问，提高安全性
- ffmpeg // https://trac.ffmpeg.org/wiki/CompilationGuide/Ubuntu
```
npm install gulp bower -g
npm install
```
- 创建.env文件
```
COOKIE_SECRET=c0272b28ce1b4de1d48898cf8eccd2dcca24c4adb5657edcabedfd6d32df667ec4cfe4b67447976a75cb0c45c0ce7f31ecf40a44226b9f6e3645188f545d8d4d
CLOUDINARY_URL=cloudinary://333779167276662:_8jbSi9FB3sWYrfimcl8VKh34rI@keystone-demo
```
### 运行
npm start

### 文件上传
文件上传字段在form中name应该加`_upload`后缀，这样在action中才能获取到该字段，如果直接调用updater来保存，则会直接保存为文件字段

### cron/transcoding.js
这个文件每隔30s执行  
处理结果是  
1. 将上传的视频（无声和有声的）变速（多个速率），转码（mp4），上传到七牛，保存七牛链接到课时  
2. 将上传的字幕转化为json，并根据字幕的时间轴切割音频，变速（多个速率），转码（mp4），上传到七牛，然后创建句子  

## 可能遇到的问题
* 应用启动后，报错：`Failed to load c++ bson extension, using pure JS version`

这个错误本来无关紧要，是因为bson编译失败导致无法加载C++实现的扩展，只能使用js实现的版本。
可以无视这个错误，如果要处理，可以操作如下：
```sh
cd node_modules/keystone/

#删除package.json中mongoose那一行，然后重新安装最新的版本，最新版貌似避免了对C++ bson的依赖
npm i --save --save-exact mongoose --verbose
```

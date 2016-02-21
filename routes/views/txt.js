var keystone = require('keystone');
var fs = require('fs');
var qiniu = require('qiniu');
var randomstring = require('randomstring');

qiniu.conf.ACCESS_KEY = '07cMjNhILyyOUOy4mes6SWwuwRnytDqrb6Zdlq0U';
qiniu.conf.SECRET_KEY = 'NvlDby_4PcpNdWRfyzb5pli2y9mjquzC6Rv2GDnx';
var qiniuHost = 'http://7xqe0p.com1.z0.glb.clouddn.com';

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// Set locals
	locals.section = 'txt';
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.txtSubmitted = false;

	view.on('post', { action: 'txt' }, function(next) {
		// { ch_upload: 
		//    { fieldname: 'ch_upload',
		//      originalname: '25-1chi.txt',
		//      name: 'a0fc48e98481053c64011295611076c9.txt',
		//      encoding: '7bit',
		//      mimetype: 'text/plain',
		//      path: '/var/folders/08/vtvnl3d552x501k99llb1lk40000gp/T/a0fc48e98481053c64011295611076c9.txt',
		//      extension: 'txt',
		//      size: 3037,
		//      truncated: false,
		//      buffer: null },
		//   en_upload: 
		//    { fieldname: 'en_upload',
		//      originalname: '25-1eng.txt',
		//      name: '613c29f34c515ff6c5bd6ada97283254.txt',
		//      encoding: '7bit',
		//      mimetype: 'text/plain',
		//      path: '/var/folders/08/vtvnl3d552x501k99llb1lk40000gp/T/613c29f34c515ff6c5bd6ada97283254.txt',
		//      extension: 'txt',
		//      size: 3298,
		//      truncated: false,
		//      buffer: null } }
		var chPath = req.files.ch_upload.path;
		var ch = fs.readFileSync(chPath, 'utf8');
		fs.unlinkSync(chPath);
		var chArr = ch.toString().trim('\n').split('\n');

		var enPath = req.files.en_upload.path;
		var en = fs.readFileSync(enPath, 'utf8');
		fs.unlinkSync(enPath);
		var enArr = en.toString().trim('\n').split("\n");

		var newArr = [];

		if (chArr.length !== enArr.length) {
			locals.validationErrors = {
				server: '句子数量不一致：' + chArr.length + '行中文，' + enArr.length + '行英文',
			}
			return next();
		}
		var length = Math.max(chArr.length, enArr.length);
		for (var i = 0; i < length; i++) {
			newArr.push(chArr[i]);
			newArr.push(enArr[i]);
			newArr.push('');
		}
		var newData = newArr.join('\n');
		console.log(newData);
		fs.writeFileSync(enPath, newData, 'utf8');
		var randomStr = randomstring.generate(12);
		var putPolicy = new qiniu.rs.PutPolicy('scott');
		var uptoken = putPolicy.token();
		var extra = new qiniu.io.PutExtra();
		var qiniuPath = randomStr + '.txt';
		qiniu.io.putFile(uptoken,
			qiniuPath,
			enPath,
			extra,
			function(err, ret) {
				//{ hash: 'FhfWba548IMqCZb1hi0E2OXTJ5-2',
				// key: 'wkfRxA/data/files/1_28@2_0.mp4' }
				if (err) {
					console.log('upload error: ', err);
					locals.validationErrors = {
						server: '上传错误：' + JSON.stringify(err),
					}
					return next();
				}
				locals.txtSubmitted = true;
				locals.link = qiniuHost + '/' + ret.key;
				console.log('uploaded: ', ret);
				// remove filePath
				fs.unlinkSync(enPath);
				next();
			}
		);
	});
	
	view.render('txt');
	
};

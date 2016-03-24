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
		var inputPath = req.files.input_upload.path;
		var input = fs.readFileSync(inputPath, 'utf8');
		fs.unlinkSync(inputPath);
		var inputArr = input.toString().replace(/\r/g, '').trim('\n').split('\n');

		if (inputArr.length % 2 !== 0) {
			locals.validationErrors = {
				server: '句子数量' + inputArr.length + '为奇数',
			}
			return next();
		}
		var newData = '';
		inputArr.forEach(function(str, index) {
			newData = newData + str + ((index % 2) ? '\n' : '\\N');
		});

		res.set({"Content-Disposition":"attachment; filename=\"result.txt\""});
		res.send(newData);
	});
	
	view.render('txt2');
	
};

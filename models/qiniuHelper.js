var qiniu = require('qiniu');
var randomstring = require('randomstring');
var fs = require('fs');

qiniu.conf.ACCESS_KEY = '07cMjNhILyyOUOy4mes6SWwuwRnytDqrb6Zdlq0U';
qiniu.conf.SECRET_KEY = 'NvlDby_4PcpNdWRfyzb5pli2y9mjquzC6Rv2GDnx';
var qiniuHost = 'https://o3f47rda5.qnssl.com';

exports = module.exports = function(fieldName) {
	return function(callback) {
		if (this[fieldName] && this[fieldName].path && this[fieldName].filename) {
			var putPolicy = new qiniu.rs.PutPolicy('scott');
			var uptoken = putPolicy.token();
			var extra = new qiniu.io.PutExtra();
			var filePath = this[fieldName].path + '/' + this[fieldName].filename;
			var randomStr = randomstring.generate(6);
			var qiniuPath = randomStr + filePath;
			var retryTimes = 3;
			qiniu.io.putFile(uptoken,
				qiniuPath,
				filePath,
				extra,
				function(err, ret) {
					if (err) {
						return callback(err);
					}
					console.log('uploaded: ', ret);
					// remove filePath
					fs.unlinkSync(filePath);
					callback(null, qiniuHost + '/' + qiniuPath);
				}
			);
		} else {
			callback(null, '');
		}
	};
}

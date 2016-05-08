var keystone = require('keystone');
var Types = keystone.Field.Types;
var qiniuHelper = require('./qiniuHelper');

/**
 * Course Model
 * ==========
 */

var Course = new keystone.List('Course', {
	map: { name: 'courseNo' },
});

Course.add({
	englishTitle: { type: String},
	chineseTitle: { type: String},
	courseNo: { type: Types.Number},
	image: {
		type: Types.LocalFile,
		dest: '/data/files',
		prefix: '/files',
		note: '课程配图',
	},
	imageUrl: { 
		type: String,
		note: '自动生成，请勿修改',
		hidden: true,
		watch: 'image',
		value: qiniuHelper('image'),
	},
	shareImage: {
		type: Types.LocalFile,
		dest: '/data/files',
		prefix: '/files',
		note: '分享配图，方的！尺寸大于300',
	},
	shareImageUrl: { 
		type: String,
		note: '自动生成，请勿修改',
		hidden: true,
		watch: 'shareImage',
		value: qiniuHelper('shareImage'),
	},
	
	description: { type: String},
});

Course.defaultColumns = 'courseNo, englishTitle, chineseTitle, description, imageUrl';
Course.register();

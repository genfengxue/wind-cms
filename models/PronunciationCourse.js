var keystone = require('keystone');
var Types = keystone.Field.Types;
var qiniuHelper = require('./qiniuHelper');

/**
 * PronunciationCourse Model
 * ==========
 */

var PronunciationCourse = new keystone.List('PronunciationCourse', {
	map: { name: 'courseNo' },
	autokey: { from: 'chineseTitle', path: 'key', unique: true }
});

PronunciationCourse.add({
	englishTitle: { type: String},
	chineseTitle: { type: String},
	courseNo: { type: Number},
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
	lessonCount: { type: Number},
	description: { type: String},
});

PronunciationCourse.defaultColumns = 'courseNo, englishTitle, chineseTitle, description';
PronunciationCourse.register();

var keystone = require('keystone');
var Types = keystone.Field.Types;
var qiniuHelper = require('./qiniuHelper');

/**
 * LessonActivity Model
 * ==========
 */

var LessonActivity = new keystone.List('LessonActivity');

LessonActivity.add({
	courseNo: { type: Number, required: true, initial: true},
	lessonNo: { type: Number, required: true, initial: true},
	index: {type: Number, required: true, initial: true, note: '显示的顺序'}, // 排序用的
	type: {type: Types.Select, options: '讲解, 朗读, 打Boss', default: '讲解', required: true, initial: true}, // 讲解／朗读／打boss
	description: { type: Types.Html, wysiwyg: true, height: 400, note: '富文本（朗读的英文和注解可以合起来）' }, // 富文本（朗读的英文和注解可以合起来）
	audioUpload: {
		type: Types.LocalFile,
		dest: '/data/files',
		prefix: '/files',
		note: '讲解/朗读/打boss的音频',
	},
	videoUpload: {
		type: Types.LocalFile,
		dest: '/data/files',
		prefix: '/files',
		note: '讲解的视频（讲解的音频和视频只需传一个，如果已经上传音频，则忽略视频）'
	},
	audio: {
		type: String,
		note: '音频地址，请勿修改',
		hidden: true,
		watch: 'audioUpload',
		value: qiniuHelper('audioUpload'),
	}, // 讲解/朗读/打boss的音频
	video: {
		type: String,
		note: '音频地址，请勿修改',
		hidden: true,
		watch: 'videoUpload',
		value: qiniuHelper('videoUpload'),
	} // 讲解的视频
});

LessonActivity.defaultColumns = 'courseNo, lessonNo, index, type, description, audio, video';
LessonActivity.register();

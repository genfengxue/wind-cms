var keystone = require('keystone');
var Types = keystone.Field.Types;
var qiniuHelper = require('./qiniuHelper');
var createdModifiedPlugin = require('mongoose-createdmodified').createdModifiedPlugin;

/**
 * LessonActivity Model
 * ==========
 */

var LessonActivity = new keystone.List('LessonActivity', {
	nocreate: true,
	noedit: true
});

LessonActivity.add({
	courseNo: { type: Number, required: true, initial: true},
	lessonNo: { type: Number, required: true, initial: true},
	index: {type: Number, required: true, initial: true, note: '显示的顺序'}, // 排序用的
	type: {type: Types.Select, options: '讲解, 朗读, 打Boss', default: '讲解', required: true, initial: true}, // 讲解／朗读／打boss
	description: { type: Types.Html, wysiwyg: true, height: 400, note: '富文本（讲解或者打Boss的正文）' }, // 富文本（朗读的英文和注解可以合起来）
	readingText: { type: Types.Textarea, height: 200, label: '朗读原文' }, // 多行文本
	readingNote: { type: Types.Textarea, height: 200, label: '朗读注释' }, // 多行文本
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
LessonActivity.schema.plugin(createdModifiedPlugin, {index: true});

LessonActivity.defaultColumns = 'courseNo, lessonNo, index, type, description, audio, video';
LessonActivity.register();

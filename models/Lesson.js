var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Lesson Model
 * ==========
 */

var Lesson = new keystone.List('Lesson', {
	map: { name: 'lessonNo' },
});

Lesson.add({
	courseNo: { type: Types.Number, required: true, initial: true },
	lessonNo: { type: Types.Number, required: true, initial: true },
	englishTitle: { type: String, required: true, initial: true},
	chineseTitle: { type: String, required: true, initial: true},
	hasListen: { type: Boolean, default: false},
	hasTranslate: { type: Boolean, default: false},
	audio: {
		type: Types.LocalFile,
		dest: '/data/files',
		prefix: '/files',
		filename: function(item, file){
			var name = item.courseNo + '_' + item.lessonNo + '_audio';
			return name + '.' + file.extension;
		}
	},
	video: {
		type: Types.LocalFile,
		dest: '/data/files',
		prefix: '/files',
		filename: function(item, file){
			var name = item.courseNo + '_' + item.lessonNo + '_video';
			return name + '.' + file.extension;
		}
	},
	subtitle: {
		type: Types.LocalFile,
		dest: '/data/files',
		prefix: '/files',
		filename: function(item, file){
			var name = item.courseNo + '_' + item.lessonNo + '_subtitle';
			return name + '.' + file.extension;
		}
	}
});

Lesson.defaultColumns = 'courseNo, lessonNo, englishTitle, chineseTitle, hasListen, hasTranslate, audio, video, subtitle';
Lesson.register();

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
	publishedDate: {type: Date, default: new Date(), note: '自动发布时间，默认是创建时间'}, // auto publish date
	homeworkLink: {type: String, label: '听力问题链接'},
	homeworkTxt: {type: Types.Textarea, height: 300, label: '翻译问题' },
	homeworkAnswer: {type: Types.Html, wysiwyg: true, height: 300, note: '富文本', label: '翻译答案' },
	audio: {
		type: Types.LocalFile,
		dest: '/data/files',
		prefix: '/files',
		filename: function(item, file){
			return file.originalname;
		}
	},
	video: {
		type: Types.LocalFile,
		dest: '/data/files',
		prefix: '/files',
		filename: function(item, file){
			return file.originalname;
		}
	},
	videoMuted: {
		type: Types.LocalFile,
		dest: '/data/files',
		prefix: '/files',
		filename: function(item, file){
			return file.originalname;
		}
	},
	subtitle: {
		type: Types.LocalFile,
		dest: '/data/files',
		prefix: '/files',
		filename: function(item, file){
			return file.originalname;
		}
	},
	transVideos: { type: Types.TextArray },
	videoPath: { type: String },
});

Lesson.schema.index({courseNo: 1, lessonNo: 1}, {unique: true});

Lesson.schema.virtual('hasAudio').get(function() {
	return this.audio && this.audio.filename;
});

Lesson.schema.virtual('hasVideo').get(function() {
	return this.video && this.video.filename;
});

Lesson.schema.virtual('hasVideoMuted').get(function() {
	return this.videoMuted && this.videoMuted.filename;
});

Lesson.defaultColumns = 'courseNo, lessonNo, englishTitle, chineseTitle, hasListen, hasTranslate, audio, video, subtitle';
Lesson.register();

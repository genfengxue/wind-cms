var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * PronunciationLesson Model
 * ==========
 */

var PronunciationLesson = new keystone.List('PronunciationLesson');

PronunciationLesson.add({
	courseNo: { type: Number},
	lessonNo: { type: Number},
	englishTitle: { type: String},
	chineseTitle: { type: String},
	publishedDate: {type: Date, default: new Date(), note: '自动发布时间，默认是创建时间'}, // auto publish date
});

PronunciationLesson.defaultColumns = 'courseNo, lessonNo, englishTitle, chineseTitle';
PronunciationLesson.register();

var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * PronunciationLesson Model
 * ==========
 */

var PronunciationLesson = new keystone.List('PronunciationLesson');

PronunciationLesson.add({
	courseNo: { type: Number, initial: true},
	lessonNo: { type: Number, initial: true},
	englishTitle: { type: String, initial: true},
	chineseTitle: { type: String, initial: true},
	publishedDate: {type: Date, default: new Date(), note: '自动发布时间，默认是创建时间', initial: true}, // auto publish date
});

PronunciationLesson.schema.virtual('link').get(function() {
	return '/pronunciationLessons/' + this._id;
});

PronunciationLesson.defaultColumns = 'courseNo, lessonNo, englishTitle, chineseTitle, link|40%';
PronunciationLesson.register();

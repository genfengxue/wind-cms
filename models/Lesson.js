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
	courseNo: { type: Types.Number},
	lessonNo: { type: Types.Number},
	englishTitle: { type: String},
	chineseTitle: { type: String},
	hasListen: { type: Boolean},
	hasTranslate: { type: Boolean},
});

Lesson.defaultColumns = 'courseNo, lessonNo, englishTitle, chineseTitle, hasListen, hasTranslate';
Lesson.register();

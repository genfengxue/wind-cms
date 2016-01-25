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
	hasListen: { type: Boolean, default: true},
	hasTranslate: { type: Boolean, default: true}
});

Lesson.defaultColumns = 'courseNo, lessonNo, englishTitle, chineseTitle, hasListen, hasTranslate';
Lesson.register();

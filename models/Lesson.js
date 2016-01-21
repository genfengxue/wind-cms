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
});

Lesson.defaultColumns = 'courseNo, lessonNo, englishTitle, chineseTitle';
Lesson.register();

var keystone = require('keystone');
var Types = keystone.Field.Types;

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
	imageUrl: { type: String},
	lessonCount: { type: Number},
	description: { type: String},
});

PronunciationCourse.defaultColumns = 'courseNo, englishTitle, chineseTitle, description';
PronunciationCourse.register();

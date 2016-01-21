var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Course Model
 * ==========
 */

var Course = new keystone.List('Course', {
	map: { name: 'courseNo' },
});

Course.add({
	englishTitle: { type: String},
	chineseTitle: { type: String},
	courseNo: { type: Types.Number},
	imageUrl: { type: String},
	description: { type: String},
});

Course.defaultColumns = 'courseNo, englishTitle, chineseTitle, description, imageUrl';
Course.register();

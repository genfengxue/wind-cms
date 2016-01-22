var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Sentence Model
 * ==========
 */

var Sentence = new keystone.List('Sentence');

Sentence.add({
	courseNo: { type: Types.Number },
	lessonNo: { type: Types.Number },
	sentenceNo: {type: Types.Number },
	english: { type: String },
	chinese: { type: String },
	audios: { type: Types.TextArray },
});

Sentence.defaultColumns = 'courseNo, lessonNo, sentenceNo, english, chinese, audios';
Sentence.register();

var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Sentence Model
 * ==========
 */

var Sentence = new keystone.List('Sentence', {
	nocreate: true,
	map: {
		name: 'english',
	}
});

Sentence.add({
	courseNo: { type: Types.Number },
	lessonNo: { type: Types.Number },
	sentenceNo: {type: Types.Number },
	english: { type: String },
	chinese: { type: String },
	audio: { type: String },
	video: { type: String },
});

Sentence.defaultColumns = 'courseNo, lessonNo, sentenceNo, english, chinese, audio';
Sentence.register();

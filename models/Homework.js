var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Homework Model
 * ==========
 */

var Homework = new keystone.List('Homework', {
	noedit: true
});

Homework.add({
	courseNo: { type: Number },
	lessonNo: { type: Number },
	time: {type: Number },
	audio: { type: String },
	nickname: { type: String },
	serverId: { type: String },
	serverIds: { type: Types.TextArray },
	type: {type: String},
	created: {type: Date}
});

Homework.defaultSort = '-created';
Homework.defaultColumns = 'created, nickname, lessonNo, type, courseNo, time, audio, serverIds';
Homework.register();

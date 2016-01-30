var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Mission Model
 * 课时转化任务
 * ==========
 */

var Mission = new keystone.List('Mission');

Mission.add({
	courseNo: { type: Types.Number, initial: true },
	lessonNo: { type: Types.Number, initial: true },
	entryTime: {type: Date},
	state: {type: Types.Select, options: 'pending, processing, finished, failed', default: 'pending'},
	finishedTime: {type: Date},
	completeness: { type: Types.Number },
	threadId: { type: String },
	reason: {type: String}
});

Mission.defaultColumns = 'courseNo, lessonNo, entryTime, state, finishedTime, reason';
Mission.register();

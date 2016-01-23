var keystone = require('keystone'),
async = require('async'),
Lesson = keystone.list('Lesson');

exports = module.exports = function(done) {
	Lesson.model
	.where({courseNo: 1, lessonNo: 77})
	.update({hasListen: true, hasTranslate: true})
	.exec(function(err, result) {
		if (err) {
			console.log(err);
		}
		done(err);
	});
};

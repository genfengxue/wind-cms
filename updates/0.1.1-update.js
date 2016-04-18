var keystone = require('keystone'),
async = require('async'),
Lesson = keystone.list('Lesson');

exports = module.exports = function(done) {
	Lesson.model.find().exec(function(err, results) {
		if (err) {
			return done(err);
		}
		async.series(results.map(function(lesson) {
			return function(callback) {
				console.log(lesson._id);
				lesson.publishedDate = new Date();
				lesson.save(function(err, result) {
					if (err) {
						console.log(err);
					}
					callback(null, result);
				});
			};
		}), function(err, results) {
			console.log(err);
			done(err);
		});
	});
};

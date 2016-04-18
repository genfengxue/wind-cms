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
				if (lesson.videoPath) {
					lesson.videoPath = lesson.videoPath.replace('http://7xqe0p.com1.z0.glb.clouddn.com', 'https://o3f47rda5.qnssl.com');
					lesson.save(function(err, result) {
						if (err) {
							console.log(err);
						}
						callback(null, result);
					});
				} else {
					callback(null, lesson);
				}
			};
		}), function(err, results) {
			console.log(err);
			done(err);
		});
	});
};

var keystone = require('keystone'),
async = require('async'),
Homework = keystone.list('Homework');

exports = module.exports = function(done) {
	Homework.model.find().exec(function(err, results) {
		if (err) {
			return done(err);
		}
		async.series(results.map(function(homework) {
			return function(callback) {
				console.log(homework._id);
				if (homework.serverId) {
					homework.serverIds = [homework.serverId];
					homework.save(function(err, result) {
						if (err) {
							console.log(err);
						}
						callback(null, result);
					});
				} else {
					callback(null, homework);
				}
			};
		}), function(err, results) {
			console.log(err);
			done(err);
		});
	});
};

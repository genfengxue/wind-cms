var keystone = require('keystone'),
async = require('async'),
Homework = keystone.list('Homework');

exports = module.exports = function(done) {
	Homework.model.find().exec(function(err, results) {
		if (err) {
			return done(err);
		}
		async.each(results, function(homework, callback) {
			if (homework.serverId) {
				homework.serverIds = [homework.serverId];
				homework.save(function(err, result) {
					callback(err);
				});
			}
		}, function(err) {
			console.log(err);
			done(err);
		});
	});
};

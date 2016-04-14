var keystone = require('keystone'),
async = require('async'),
Sentence = keystone.list('Sentence');

exports = module.exports = function(done) {
	Sentence.model.find().exec(function(err, results) {
		if (err) {
			return done(err);
		}
		async.series(results.map(function(sentence) {
			return function(callback) {
				console.log(sentence._id);
				if (sentence.audio) {
					sentence.audio = sentence.audio.replace('http://7xqe0p.com1.z0.glb.clouddn.com', 'https://o3f47rda5.qnssl.com');
					sentence.save(function(err, result) {
						if (err) {
							console.log(err);
						}
						callback(null, result);
					});
				} else {
					callback(null, sentence);
				}
			};
		}), function(err, results) {
			console.log(err);
			done(err);
		});
	});
};

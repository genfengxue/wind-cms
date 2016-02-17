var keystone = require('keystone'),
async = require('async'),
Mission = keystone.list('Mission');

exports = module.exports = function(done) {
	Mission.model
	.where({courseNo: 1})
	.update({state: 'pending'})
	.exec(function(err, result) {
		if (err) {
			console.log(err);
		}
		done(err);
	});
};

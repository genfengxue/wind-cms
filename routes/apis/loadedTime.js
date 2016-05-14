var keystone = require('keystone');
var Behavior = keystone.list('Behavior');

exports = module.exports = function(req, res, next) {
	
	if (!req.query.fromDate || !req.query.toDate) {
		return next('参数错误 !req.query.fromDate || !req.query.toDate');
	}
	Behavior.model.find({created: {$gte: req.query.fromDate, $lte: req.query.toDate}, scope: 'audioLoadedTime'})
	.exec().then(function(results) {
		console.log(results);
		var data = results.map(function(item, index) {
			return {
				i: index,
				v: +item.value
			}
		});
		res.json(data);
	});
};

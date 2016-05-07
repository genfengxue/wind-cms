var keystone = require('keystone');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// Set locals
	locals.section = 'pronunciationLesson';
	locals.filters = {
		pronunciationLesson: req.params.id
	};
	locals.data = {
		lessonActivities: []
	}
	// Load the current pronunciationLesson
	view.on('init', function(next) {
		keystone.list('PronunciationLesson').model.findOne({
			_id: locals.filters.pronunciationLesson
		}).exec().then(function(result) {
			locals.data.pronunciationLesson = result;
			return keystone.list('LessonActivity').model
			.find({courseNo: result.courseNo, lessonNo: result.lessonNo})
			.sort('index')
			.exec();
		}).then(function(result) {
			locals.data.lessonActivities = result;
			next();
		});
	});

	// Render the view
	view.render('pronunciationLesson');
	
};

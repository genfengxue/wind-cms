var keystone = require('keystone');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// Set locals
	locals.section = 'pronunciationLessons';
	locals.filters = {
		courseNo: req.query.courseNo
	};
	locals.data = {
		pronunciationLessons: [],
		pronunciationCourses: [],
	};
	
	// Load the pronunciationLessons
	view.on('init', function(next) {
		
		var q = keystone.list('PronunciationLesson').model.find(locals.filters);
		q.exec(function(err, result) {
			locals.data.pronunciationLessons = result;
			next(err);
		});
		
	});

	view.on('init', function(next) {
		
		var q = keystone.list('PronunciationCourse').model.find();
		q.exec(function(err, result) {
			locals.data.pronunciationCourses = result;
			next(err);
		});
	});

	// Render the view
	view.render('pronunciationLessons');
	
};

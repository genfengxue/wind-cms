var keystone = require('keystone');
var Lesson = keystone.list('Lesson');
var multer = require('multer');
var upload = multer({ dest: '/uploads/' });
exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// Set locals
	locals.section = 'lesson';
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.lessonSubmitted = false;
	
	// On POST requests, add the Lesson item to the database
	view.on('post', { action: 'lesson' }, function(next) {
		if (!req.body.audio) {
			locals.validationErrors.audio = '请上传音频';
			console.log(req.body.audio);
			return next();
		}
		if (!req.body.subtitle) {
			locals.validationErrors.subtitle = '请上传字幕';
			console.log(req.body.subtitle);
			return next();
		}
		Lesson.model.findOne({courseNo: req.body.courseNo, lessonNo: req.body.lessonNo})
		.exec().then(function(lesson) {
			return lesson ? lesson : new Lesson.model();
		}).then(function(lesson) {
			updater = lesson.getUpdateHandler(req);
			updater.process(req.body, {
				flashErrors: true,
				fields: 'courseNo, lessonNo, englishTitle, chineseTitle',
				errorMessage: 'There was a problem submitting your lesson:'
			}, function(err, result) {
				if (err) {
					locals.validationErrors = err.errors;
					return next();
				} else {
					locals.lessonSubmitted = true;
					// prevent multi submit
					return res.redirect('/lesson');
				}
			});
		});
	});
	
	view.render('lesson');
	
};

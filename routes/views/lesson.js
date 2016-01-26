var keystone = require('keystone');
var Lesson = keystone.list('Lesson');
var multer = require('multer');
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });
// var upload = multer({ dest: 'uploads/' });
var Promise = require('promise');

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
		new Promise(function(resolve, reject) {
			upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'subtitle', maxCount: 1 }])(req, res, function(err) {
				if (err) {
					return reject(err);
				}
				console.log(req.body);
				console.log(req);
				resolve();
			});
		}).then(function() {
			return Lesson.model.findOne({courseNo: req.body.courseNo, lessonNo: req.body.lessonNo})
			.exec();
		}).then(function(lesson) {
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
		}).catch(function(err) {
			next(err);
		});
	});
	
	view.render('lesson');
	
};

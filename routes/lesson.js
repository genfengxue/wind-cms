var Router = require('express').Router;
var router = new Router();
var middleware = require('./middleware');
var keystone = require('keystone');
var Lesson = keystone.list('Lesson');
var multer = require('multer');
var storage = multer.memoryStorage();
// var upload = multer({ storage: storage });
var upload = multer({ dest: 'uploads/' });
var Promise = require('promise');

router.get('/', middleware.requireUser, function(req, res, next) {
  
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// Set locals
	locals.section = 'lesson';
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.lessonSubmitted = false;

	view.render('lesson');
});


router.post('/', middleware.requireUser, function(req, res, next) {
  
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// Set locals
	locals.section = 'lesson';
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.lessonSubmitted = false;
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
			} else {
				locals.lessonSubmitted = true;
				// prevent multi submit
				return res.redirect('/lesson');
			}
		});
	}).then(function() {
		view.render('lesson');
	}).catch(function(err) {
		next(err);
	});
});

exports = module.exports = router;

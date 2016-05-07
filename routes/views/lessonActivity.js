var keystone = require('keystone');
var LessonActivity = keystone.list('LessonActivity');

exports = module.exports = function(req, res) {
	
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// Set locals
	locals.section = 'lessonActivity';
	locals.filters = {
		lessonActivity: req.params.id
	};
	locals.types = LessonActivity.fields.type.ops;
	locals.data = {};
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.lessonActivitySubmitted = false;

	// Load the current lessonActivity
	view.on('init', function(next) {
		if (locals.filters.lessonActivity === 'new') {
			locals.data.lessonActivity = new LessonActivity.model({
				courseNo: +req.query.courseNo,
				lessonNo: +req.query.lessonNo
			});
			locals.formData = locals.data.lessonActivity;
			console.log(locals.data.lessonActivity);
			keystone.list('PronunciationLesson').model.findOne({
				courseNo: +req.query.courseNo,
				lessonNo: +req.query.lessonNo
			}).exec().then(function(result) {
				locals.data.lessonActivity.lesson = result;
				next();
			});
		} else {
			LessonActivity.model.findOne({
				_id: locals.filters.lessonActivity
			}).exec().then(function(result) {
				locals.data.lessonActivity = result;
				locals.formData = result;
				return keystone.list('PronunciationLesson').model.findOne({
					courseNo: result.courseNo,
					lessonNo: result.lessonNo,
				}).exec();
			}).then(function(result) {
				locals.data.lessonActivity.lesson = result;
				next();
			});
		}
	});

	// On put requests, save the LessonActivity to the database
	view.on('post', { action: 'lesson-activity' }, function(next) {
		var lessonActivity = locals.data.lessonActivity,
			updater = lessonActivity.getUpdateHandler(req);
		console.log(lessonActivity);
		if (!req.body.index) {
			LessonActivity.model.findOne({
				courseNo: lessonActivity.courseNo,
				lessonNo: lessonActivity.lessonNo,
			}).sort('-index').exec().then(function(result) {
				req.body.index = result ? result.index + 1 : 1;
				updater.process(req.body, {
					flashErrors: true,
					fields: 'lessonNo, courseNo, index, description, readingText, readingNote, type, audioUpload, videoUpload',
					errorMessage: 'There was a problem submitting your lessonActivity:'
				}, function(err) {
					if (err) {
						locals.validationErrors = err.errors;
					} else {
						locals.lessonActivitySubmitted = true;
					}
					res.redirect(lessonActivity._id);
				});
			});
		} else {
			updater.process(req.body, {
				flashErrors: true,
				fields: 'lessonNo, courseNo, index, description, readingText, readingNote, type, audioUpload, videoUpload',
				errorMessage: 'There was a problem submitting your lessonActivity:'
			}, function(err) {
				if (err) {
					locals.validationErrors = err.errors;
				} else {
					locals.lessonActivitySubmitted = true;
				}
				res.redirect(lessonActivity._id);
			});
		}
	});

	// Render the view
	view.render('lessonActivity');
	
};

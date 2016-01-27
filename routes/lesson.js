var Router = require('express').Router;
var router = new Router();
var middleware = require('./middleware');
var keystone = require('keystone');
var Lesson = keystone.list('Lesson');
var Promise = require('promise');
var qiniu = require('qiniu');
var parser = require('subtitles-parser');
var fs = require('fs');
var moment = require('moment');
var ffmpeg = require('fluent-ffmpeg');
var Sentence = keystone.list('Sentence');
var randomstring = require('randomstring');
var async = require('async');

qiniu.conf.ACCESS_KEY = '07cMjNhILyyOUOy4mes6SWwuwRnytDqrb6Zdlq0U';
qiniu.conf.SECRET_KEY = 'NvlDby_4PcpNdWRfyzb5pli2y9mjquzC6Rv2GDnx';
var qiniuHost = 'http://7xqe0p.com1.z0.glb.clouddn.com';

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

function sliceAudio(lesson) {
	var promises = [];
	var srtPath = lesson.subtitle.path + '/' + lesson.subtitle.filename;
	var data = fs.readFileSync(srtPath, 'utf8');
	fs.writeFileSync(srtPath, data, 'utf8');
	data = fs.readFileSync(srtPath, 'utf8');
	var srt = parser.fromSrt(data);
	console.log(data);
	var audioPath = lesson.audio.path + '/' + lesson.audio.filename;
	var promise = new Promise(function(resolve, reject) {
		async.series(srt.map(function(sub) {
			return function(callback) {
				sub.startTime = sub.startTime.replace(',', '.');
				sub.endTime = sub.endTime.replace(',', '.');
				var duration = moment.duration(sub.endTime) - moment.duration(sub.startTime);
				ffmpeg(audioPath)
				.output(lesson.audio.path + '/' + lesson.courseNo + '_' + lesson.lessonNo + '_' + sub.id + '.mp3')
				.seekInput(sub.startTime)
				.duration(duration / 1000)
				.on('error', function(err) {
					console.log('An error occurred: ' + err.message);
					callback(err);
				})
				.on('end', function() {
					console.log('Processing finished !');
					callback(null, sub);
				})
				.run();
			};
		}), function(err, results){
			if (err) {
				return reject(err);
			}
			return resolve(results);
		});
	});
	return promise;
}

function generateSentences(lesson, subs) {
	return new Promise(function(resolve, reject) {
		async.series(subs.map(function(sub) {
			return function(callback) {
				var sentence = new Sentence.model();
				sentence.courseNo = lesson.courseNo;
				sentence.lessonNo = lesson.lessonNo;
				sentence.sentenceNo = parseInt(sub.id, 10);
				sentence.english = sub.text.split('\n')[0];
				sentence.chinese = sub.text.split('\n')[1];
				// audios: { type: Types.TextArray },
				var putPolicy = new qiniu.rs.PutPolicy('scott');
				var uptoken = putPolicy.token();
				var extra = new qiniu.io.PutExtra();
				var qiniuPath = 'content/audios/' + sentence.courseNo + '/' + sentence.lessonNo + '/' + sentence.sentenceNo + '/' + randomstring.generate(6) + '.mp3';
				var localPath = lesson.audio.path + '/' + lesson.courseNo + '_' + lesson.lessonNo + '_' + sub.id + '.mp3';
				qiniu.io.putFile(uptoken,
					qiniuPath,
					localPath,
					extra,
					function(err, ret) {
						if (err) {
							return callback(err);
						}
						sentence.audios = [qiniuHost + '/' + qiniuPath];
						sentence.save(function(err, result) {
							if (err) {
								return callback(err);
							}
							callback(null, result);
						})
					}
				);

			};
		}), function(err, results) {
			if (err) {
				return reject(err);
			}
			resolve(results);
		});
	});
}

router.post('/', middleware.requireUser, function(req, res, next) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
	var theLesson;
	// Set locals
	locals.section = 'lesson';
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.lessonSubmitted = false;
	new Promise(function(resolve) {
		resolve();
	}).then(function() {
		return Lesson.model.findOne({courseNo: req.body.courseNo, lessonNo: req.body.lessonNo}).exec();
	}).then(function(lesson) {
		if (lesson) {
			return lesson;
		} else {
			req.flash('error', {detail: '课时不存在'});
			throw new Error({detail: '课时不存在'});
		}
	}).then(function(lesson) {
		if (lesson.audio && lesson.subtitle) {
			theLesson = lesson;
			locals.lessonSubmitted = true;
			return lesson;
		}
		req.flash('error', {detail: '课时未上传'});
		throw new Error({detail: '课时未上传'});
	})
	// .then(function(lesson) {
	// 	var putPolicy = new qiniu.rs.PutPolicy('scott');
	// 	var uptoken = putPolicy.token();
	// 	var extra = new qiniu.io.PutExtra();
	// 	return new Promise((resolve, reject) => {
	// 		qiniu.io.putFile(uptoken,
	// 			'content/audios/' + lesson.audio.filename,
	// 			lesson.audio.path + '/' + lesson.audio.filename,
	// 			extra,
	// 			(err, ret) => {
	// 				if (err) {
	// 					return reject(err);
	// 				}
	// 				return resolve(ret);
	// 			}
	// 		);
	// 	});
	// })
	.then(function() {
		return Sentence.model.remove({courseNo: theLesson.courseNo, lessonNo: theLesson.lessonNo}).exec();
	})
	.then(function() {
		return sliceAudio(theLesson);
	})
	.then(function(subs) {
		return generateSentences(theLesson, subs);
	})
	.then(function(sentences) {
		console.log(sentences);
		view.render('lesson');
	})
	.catch(function(err) {
		next(err);
	});
});

exports = module.exports = router;

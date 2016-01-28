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

var runningTask;

router.get('/', middleware.requireUser, function(req, res, next) {
	var view = new keystone.View(req, res);
	var locals = res.locals;
	
	// Set locals
	locals.section = 'lesson';
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.lessonSubmitted = false;
	locals.runningTask = runningTask;

	view.render('lesson');
});

// 获取文件名字 /data/files/{课程号}_{课时号}_{句子号} /data/files/1_1_1
function getNormalName(lesson, sub) {
	return lesson.audio.path + '/' + lesson.courseNo + '_' + lesson.lessonNo + '_' + sub.id;
}

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
				var localPath = getNormalName(lesson, sub) + '.mp3';
				ffmpeg(audioPath)
				.output(localPath)
				.seekInput(sub.startTime)
				.duration(duration / 1000)
				.on('error', function(err) {
					console.log(localPath + ' An error occurred: ' + err.message);
					callback(err);
				})
				.on('end', function() {
					console.log(localPath + ' Processing finished !');
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

// var rates = ['0.8', '1.1', '1.2', '1.4', '2.0']; // prod
var rates = ['0.8', '1.4', '2.0']; // test

// 生成变速文件，变速文件命名规则是 "正常文件名"+"@"+"1_1"+"后缀"，如 /data/files/1_1_1@1_1.mp3
function speed(lesson, subs, rate) {
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
				var normalName = getNormalName(lesson, sub);
				var localPath = normalName + '.mp3';
				var outputFilePath = normalName + '@' + rate.replace('.', '_') + '.mp3';
				ffmpeg(localPath)
				.output(outputFilePath).audioFilters('atempo=' + rate)
				.on('error', function(err) {
					console.log(outputFilePath + ' An error occurred: ' + err.message);
					callback(null, sub);
				})
				.on('end', function() {
					console.log(outputFilePath + ' Processing finished !');
					callback(null, sub);
				})
				.run();
			};
		}), function(err, results) {
			if (err) {
				return reject(err);
			}
			resolve(results);
		});
	});
}

function speeds(lesson, subs) {
	return new Promise(function(resolve, reject) {
		async.series(rates.map(function(rate) {
			return function(callback) {
				speed(lesson, subs, rate).then(function(result) {
					callback(null, result);
				}, function(error) {
					callback(error);
				});
			};
		}), function(err, results) {
			if (err) {
				return reject(err);
			}
			resolve(results);
		});
	});
}

// store as aRSX23/data/files/1_1_1@1_1.mp3
function uploadFiles(lesson, sentence) {
	return new Promise(function(resolve, reject) {
		var normalName = getNormalName(lesson, {id: sentence.sentenceNo}); 
		var localPath = normalName + '.mp3';
		var filePaths = rates.map(function(rate) {
			return normalName + '@' + rate.replace('.', '_') + '.mp3';
		});
		filePaths.push(localPath);
		var randomStr = randomstring.generate(6);
		async.series(filePaths.map(function(filePath) {
			return function(callback) {
				setTimeout(function() {
					var putPolicy = new qiniu.rs.PutPolicy('scott');
					var uptoken = putPolicy.token();
					var extra = new qiniu.io.PutExtra();
					var qiniuPath = randomStr + filePath;
					qiniu.io.putFile(uptoken,
						qiniuPath,
						filePath,
						extra,
						function(err, ret) {
							if (err) {
								console.log('upload error: ', err);
								return callback(err);
							}
							console.log('uploaded: ', ret);
							callback(null, ret);
						}
					);
				}, 100);
			};
		}), function(err, results) {
			if (err) {
				return reject(err);
			}
			resolve(qiniuHost + '/' + randomStr + localPath);
		});
	});
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
				uploadFiles(lesson, sentence).then(function(url) {
					sentence.audios = [url];
					sentence.save(function(err, result) {
						if (err) {
							return callback(err);
						}
						callback(null, result);
					})
				}, function(err) {
					if (err) {
						return callback(err);
					}
				});
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
	if (runningTask) {
		return res.redirect('/lesson');
	}
	var view = new keystone.View(req, res);
	var locals = res.locals;
	var theLesson;
	var theSubs;
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
	.then(function() {
		runningTask = {courseNo: theLesson.courseNo, lessonNo: theLesson.lessonNo};
		view.render('lesson');
		return Sentence.model.remove({courseNo: theLesson.courseNo, lessonNo: theLesson.lessonNo}).exec();
	})
	.then(function() {
		return sliceAudio(theLesson);
	})
	.then(function(subs) {
		theSubs = subs;
		return speeds(theLesson, theSubs);
	})
	.then(function() {
		return generateSentences(theLesson, theSubs);
	})
	.then(function(sentences) {
		console.log(sentences);
		runningTask = null;
	})
	.catch(function(err) {
		console.log(err);
		runningTask = null;
	});
});

exports = module.exports = router;

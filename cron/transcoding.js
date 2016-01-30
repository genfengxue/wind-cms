'use strict';
const keystone = require('keystone');
const Lesson = keystone.list('Lesson');
const Sentence = keystone.list('Sentence');
const Mission = keystone.list('Mission');
const qiniu = require('qiniu');
const parser = require('subtitles-parser');
const fs = require('fs');
const moment = require('moment');
const ffmpeg = require('fluent-ffmpeg');
const randomstring = require('randomstring');
const async = require('async');
const CronJob = require('cron').CronJob;


qiniu.conf.ACCESS_KEY = '07cMjNhILyyOUOy4mes6SWwuwRnytDqrb6Zdlq0U';
qiniu.conf.SECRET_KEY = 'NvlDby_4PcpNdWRfyzb5pli2y9mjquzC6Rv2GDnx';
const qiniuHost = 'http://7xqe0p.com1.z0.glb.clouddn.com';

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
	var audioPath = lesson.audio.path + '/' + lesson.audio.filename;
	var promise = new Promise(function(resolve, reject) {
		async.series(srt.map(function(sub) {
			return function(callback) {
				sub.startTime = sub.startTime.replace(',', '.');
				// 在时间轴前后不足
				const before = 600;
				const after = 300;
				let startTime = moment.duration(sub.startTime) - before;
				startTime = startTime > 0 ? startTime : 0;
				sub.endTime = sub.endTime.replace(',', '.');
				var duration = moment.duration(sub.endTime) - startTime + after;
				var localPath = getNormalName(lesson, sub) + '.mp3';
				ffmpeg(audioPath)
				.output(localPath)
				.seekInput(startTime / 1000)
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

exports = module.exports = () => {
	/**
	 * //////////////run every 30 second/////////////////
	 */
	const threadId = randomstring.generate(4);
	const job = new CronJob('*/30 * * * * *', () => {
		let theMission;
		let theLesson;
		let theSubs;
		console.log('*/30 * * * * * scanning remaining tasks');
		new Promise((resolve, reject) => {
			resolve();
		})
		.then(() => {
			return Mission.model.find({state: 'processing', threadId: threadId}).exec();
		})
		.then((missions) => {
			if (missions && missions.length) {
				// is running
				throw new Error('thread busy');
			}
			return Mission.model.findOne({state: 'pending'}).exec();
		})
		.then((mission) => {
			if (!mission) {
				throw new Error('no pending missions');
			}
			mission.threadId = threadId;
			mission.state = 'processing';
			mission.entryTime = new Date();
			return new Promise((resolve, reject) => {
				mission.save((err, result) => {
					if (err) {
						return reject(err);
					}
					resolve(mission);
				});
			});
		})
		.then((mission) => {
			if (mission.threadId.toString() !== threadId) {
				throw new Error('mission is being processed by other threads');
			}
			theMission = mission;
			console.log('start mission: ', mission);
			const courseNo = mission.courseNo;
			const lessonNo = mission.lessonNo;
			return Lesson.model.findOne({courseNo: courseNo, lessonNo: lessonNo}).exec();
		})
		.then(function(lesson) {
			if (lesson) {
				theLesson = lesson;
				return lesson;
			} else {
				throw new Error('课时不存在');
			}
		})
		.then(function(lesson) {
			if (lesson.audio && lesson.subtitle) {
				return lesson;
			}
			throw new Error({detail: '课时未上传'});
		})
		.then(function() {
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
		})
		.then(function() {
			theMission.state = 'finished';
			theMission.finishedTime = new Date;
			console.log('mission completed: ', theMission);
			return theMission.save();
		})
		.catch((err) => {
			if (theMission) {
				console.log('mission failed: ', theMission);
				theMission.state = 'failed';
				theMission.reason = JSON.stringify(err);
				theMission.save();
			}
			console.log(err);
		})
	}, null, true);
	return job;
};

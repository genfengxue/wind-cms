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
const _ = require('lodash');
var stripBom = require('strip-bom');

qiniu.conf.ACCESS_KEY = '07cMjNhILyyOUOy4mes6SWwuwRnytDqrb6Zdlq0U';
qiniu.conf.SECRET_KEY = 'NvlDby_4PcpNdWRfyzb5pli2y9mjquzC6Rv2GDnx';
const qiniuHost = 'http://7xqe0p.com1.z0.glb.clouddn.com';

// 获取文件名字 /data/files/{课程号}_{课时号}_{句子号} /data/files/1_1_1
function getNormalName(lesson, sub, type) {
	return lesson[type].path + '/' + lesson.courseNo + '_' + lesson.lessonNo + '_' + sub.id;
}

function parseSrt(lesson) {
	var srtPath = lesson.subtitle.path + '/' + lesson.subtitle.filename;

	var data = stripBom(fs.readFileSync(srtPath, 'utf8'));
	var srt = parser.fromSrt(data);
	return srt;
}

function slice(lesson, srt, type) {
	const suffix = type == 'video' ? '.mp4' : '.mp3';
	var promises = [];
	var filePath = lesson[type].path + '/' + lesson[type].filename;
	var promise = new Promise(function(resolve, reject) {
		async.series(srt.map(function(sub) {
			return function(callback) {
				const startTimeStr = sub.startTime.replace(',', '.');
				const endTimeStr = sub.endTime.replace(',', '.');
				// 在时间轴前后补足
				const before = 0;
				const after = 0;
				let startTime = moment.duration(startTimeStr) - before;
				startTime = startTime > 0 ? startTime : 0;
				var duration = moment.duration(endTimeStr) - startTime + after;
				var localPath = getNormalName(lesson, sub, type) + suffix;
				ffmpeg(filePath)
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

var rates = ['0.8', '1.0', '1.1', '1.2', '1.4', '2.0']; // prod
// var rates = ['0.8', '1.0']; // test

// 生成变速文件，变速文件命名规则是 "正常文件名"+"@"+"1_1"+"后缀"，如 /data/files/1_1_1@1_1.mp3
function speed(lesson, subs, rate, type) {
	const suffix = type == 'video' ? '.mp4' : '.mp3';
	return new Promise(function(resolve, reject) {
		async.series(subs.map(function(sub) {
			return function(callback) {
				var sentence = new Sentence.model();
				sentence.courseNo = lesson.courseNo;
				sentence.lessonNo = lesson.lessonNo;
				sentence.sentenceNo = parseInt(sub.id, 10);
				sentence.english = sub.text.split('\n')[0];
				sentence.chinese = sub.text.split('\n')[1];
				var normalName = getNormalName(lesson, sub, type);
				var localPath = normalName + suffix;
				var outputFilePath = normalName + '@' + rate.replace('.', '_') + suffix;
				if (type === 'audio') {
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
				} else {
					ffmpeg(localPath)
					.output(outputFilePath).complexFilter(['setpts='+ (1 / rate).toFixed(4) +'*PTS', 'atempo=' + rate])
					.on('error', function(err) {
						console.log(outputFilePath + ' An error occurred: ' + err.message);
						callback(null, sub);
					})
					.on('end', function() {
						console.log(outputFilePath + ' Processing finished !');
						callback(null, sub);
					})
					.run();
				}
			};
		}), function(err, results) {
			if (err) {
				return reject(err);
			}
			resolve(results);
		});
	});
}

function speeds(lesson, subs, type) {
	return new Promise(function(resolve, reject) {
		async.series(rates.map(function(rate) {
			return function(callback) {
				speed(lesson, subs, rate, type).then(function(result) {
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

function speedsMutedVideo(lesson) {
	return new Promise(function(resolve, reject) {
		const videoPath = lesson.videoMuted.path + '/' + lesson.videoMuted.filename;
		async.series(rates.map(function(rate) {
			return (callback) => {
				var outputFilePath = lesson.videoMuted.path + '/' + lesson.courseNo + '_' + lesson.lessonNo + '_muted' + '@' + rate.replace('.', '_') + '.mp4';
				ffmpeg(videoPath)
				.output(outputFilePath).complexFilter(['setpts='+ (1 / rate).toFixed(4) +'*PTS', 'atempo=' + rate])
				.on('error', function(err) {
					console.log(outputFilePath + ' An error occurred: ' + err.message);
					callback(null, outputFilePath);
				})
				.on('end', function() {
					console.log(outputFilePath + ' Processing finished !');
					callback(null, outputFilePath);
				})
				.run();
			}
		}), function(err, results) {
			if (err) {
				return reject(err);
			}
			resolve(results);
		});
	});
}

function speedsVideo(lesson) {
	return new Promise(function(resolve, reject) {
		const videoPath = lesson.video.path + '/' + lesson.video.filename;
		async.series(rates.map(function(rate) {
			return (callback) => {
				var outputFilePath = lesson.video.path + '/' + lesson.courseNo + '_' + lesson.lessonNo + '@' + rate.replace('.', '_') + '.mp4';
				ffmpeg(videoPath)
				.output(outputFilePath).complexFilter(['setpts='+ (1 / rate).toFixed(4) +'*PTS', 'atempo=' + rate])
				.on('error', function(err) {
					console.log(outputFilePath + ' An error occurred: ' + err.message);
					callback(null, outputFilePath);
				})
				.on('end', function() {
					console.log(outputFilePath + ' Processing finished !');
					callback(null, outputFilePath);
				})
				.run();
			}
		}), function(err, results) {
			if (err) {
				return reject(err);
			}
			resolve(results);
		});
	});
}

// store as aRSX23/data/files/1_1_1@1_1.mp3
function uploadFiles(lesson, sentence, type) {
	const suffix = type == 'video' ? '.mp4' : '.mp3';
	return new Promise(function(resolve, reject) {
		var normalName = getNormalName(lesson, {id: sentence.sentenceNo}, type); 
		var localPath = normalName + suffix;
		var suffixes = ['.mp3', '.ogg', '.wav'];
		var filePaths = _.flatten(suffixes.map((suffix) => {
			return rates.map(function(rate) {
				return normalName + '@' + rate.replace('.', '_') + suffix;
			});
		}));
		filePaths.push(localPath);
		var randomStr = randomstring.generate(6);
		async.series(filePaths.map(function(filePath) {
			return function(callback) {
				var retryTimes = 3;
				var uploadFun = function() {
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
								retryTimes--;
								//{ hash: 'FhfWba548IMqCZb1hi0E2OXTJ5-2',
								// key: 'wkfRxA/data/files/1_28@2_0.mp4' }
								if (err) {
									console.log('upload error: ', err);
									if (retryTimes) {
										console.log('retry uploading');
										return uploadFun();
									}
									return callback(err);
								}
								console.log('uploaded: ', ret);
								fs.unlinkSync(filePath);
								callback(null, ret);
								// remove filePath
							}
						);
					}, 100);
				};
				uploadFun();
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
				sentence.save(function(err, result) {
					if (err) {
						return callback(err);
					}
					callback(null, result);
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

function updateSentences(lesson, sentences, type) {
	return new Promise(function(resolve, reject) {
		async.series(sentences.map(function(sentence) {
			return function(callback) {
				uploadFiles(lesson, sentence, type).then(function(url) {
					sentence[type] = url;
					sentence.save(function(err, result) {
						if (err) {
							return callback(err);
						}
						callback(null, result);
					});
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

function uploadVideos(lesson) {
	return new Promise(function(resolve, reject) {
		var normalNames = [];
		if (lesson.hasVideoMuted) {
			normalNames.push(lesson.audio.path + '/' + lesson.courseNo + '_' + lesson.lessonNo + '_muted');
		}
		if (lesson.hasVideo) {
			normalNames.push(lesson.audio.path + '/' + lesson.courseNo + '_' + lesson.lessonNo);
		}
		var suffixes = ['.mp4'];
		var filePaths = _.flattenDeep(normalNames.map((normalName) => {
			return suffixes.map((suffix) => {
				return rates.map(function(rate) {
					return normalName + '@' + rate.replace('.', '_') + suffix;
				});
			});
		}));
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
							fs.unlinkSync(filePath);
							callback(null, ret);
						}
					);
				}, 100);
			};
		}), function(err, results) {
			if (err) {
				return reject(err);
			}
			lesson.transVideos = filePaths.map((x) => {
				return qiniuHost + '/' + randomStr + x;
			});
			lesson.save(function(err, result) {
				if (err) {
					return reject(err);
				}
				resolve(result);
			})
		});
	});
}

function converts(lesson, subs, type) {
	var suffixes;
	var suffix;
	var filePaths = [];
	if (type === 'audio') {
		suffixes = ['.ogg', '.wav'];
		suffix = '.mp3';
		filePaths = _.flatten(subs.map((sub) => {
			var normalName = getNormalName(lesson, {id: sub.id}, type); 
			var localPath = normalName + suffix;
			return rates.map(function(rate) {
				return normalName + '@' + rate.replace('.', '_') + suffix;
			});
		}));
	} else {
		suffixes = [];
		suffix = '.mp4';
		filePaths = subs;
	}
	return new Promise(function(resolve, reject) {
		async.series(filePaths.map(function(filePath) {
			return (callback) => {
				async.series(suffixes.map(function(outPutSuffix) {
					return (formatCallback) => {
						var outputFilePath = filePath.substr(0, filePath.length - suffix.length) + outPutSuffix;
						ffmpeg(filePath)
						.format(outPutSuffix.substr(1, outPutSuffix.length - 1))
						.on('error', function(err) {
							console.log(outputFilePath + ' An error occurred Converting : ' + err.message);
							formatCallback(null);
						})
						.on('end', function() {
							console.log(outputFilePath + ' Converting finished !');
							formatCallback(null);
						})
						.save(outputFilePath);
					};
				}), function(formatErr, formatResults) {
					if (formatErr) {
						return callback(formatErr);
					}
					callback(null, formatResults);
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
			if ((lesson.hasAudio || lesson.hasVideo) && lesson.subtitle) {
				return lesson;
			}
			throw new Error('课时未上传');
		})
		.then(function() {
			// todo: remove qiniu files
			return Sentence.model.remove({courseNo: theLesson.courseNo, lessonNo: theLesson.lessonNo}).exec();
		})
		.then(function() {
			return parseSrt(theLesson);
		})
		.then(function(srt) {
			theSubs = srt;
			if (theLesson.hasAudio) {
				return slice(theLesson, theSubs, 'audio');
			}
			return;
		})
		.then(function() {
			if (theLesson.hasAudio) {
				return speeds(theLesson, theSubs, 'audio');
			}
			return;
		})
		.then(function() {
			if (theLesson.hasAudio) {
				return converts(theLesson, theSubs, 'audio');
			}
			return;
		})
		.then(function() {
			if (theLesson.hasVideo) {
				return speedsVideo(theLesson);
			}
			return;
		})
		// .then(function(videoPathes) {
		// 	if (theLesson.hasVideo) {
		// 		return converts(theLesson, videoPathes, 'video');
		// 	}
		// 	return;
		// })
		.then(function() {
			if (theLesson.hasVideoMuted) {
				return speedsMutedVideo(theLesson);
			}
			return;
		})
		// .then(function(videoPathes) {
		// 	if (theLesson.hasVideo) {
		// 		return converts(theLesson, videoPathes, 'video');
		// 	}
		// 	return;
		// })
		.then(function() {
			return generateSentences(theLesson, theSubs);
		})
		.then(function(sentences) {
			if (theLesson.hasAudio) {
				return updateSentences(theLesson, sentences, 'audio');
			}
		})
		// .then(function(sentences) {
		// 	if (theLesson.hasVideo) {
		// 		return updateSentences(theLesson, sentences, 'video');
		// 	}
		// })
		.then(function(sentences) {
			if (theLesson.hasVideo||theLesson.hasVideoMuted) {
				return uploadVideos(theLesson);
			}
		})
		.then(function() {
			theMission.state = 'finished';
			theMission.finishedTime = new Date;
			theMission.reason = '';
			console.log('mission completed: ', theMission);
			return theMission.save();
		})
		.catch((err) => {
			if (theMission) {
				theMission.state = 'failed';
				try {
					theMission.reason = JSON.stringify(err);
				} catch (e) {
					theMission.reason = err.toString();
				}
				theMission.save();
				console.log('mission failed: ', theMission);
			}
			console.log(err);
		})
	}, null, true);
	return job;
};

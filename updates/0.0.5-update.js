var keystone = require('keystone'),
async = require('async'),
Course = keystone.list('Course'),
Lesson = keystone.list('Lesson');
Sentence = keystone.list('Sentence');

var courses = [
	{
		"imageUrl": "http://7u2qm8.com1.z0.glb.clouddn.com/family_album_cover.jpg",
		"englishTitle": "Family Album",
		"chineseTitle": "走遍美国",
		"courseNo": 1,
		"description": "中级难度"
	},
];

function createCourse(course, done) {
	var newCourse = new Course.model(course);
	
	newCourse.save(function(err) {
		if (err) {
			console.error("Error adding course " + course.chineseTitle + " to the database:");
			console.error(err);
		} else {
			console.log("Added course " + course.chineseTitle + " to the database.");
		}
		done(err);
	});
}

var lessons = [
	{
		"lessonNo": 77,
		"englishTitle": "Lesson One",
		"chineseTitle": "第一课",
		"courseNo": 1,
	},
];

function createLesson(lesson, done) {
	var newLesson = new Lesson.model(lesson);

	newLesson.save(function(err) {
		if (err) {
			console.error("Error adding lesson " + lesson.chineseTitle + " to the database:");
			console.error(err);
		} else {
			console.log("Added lesson " + lesson.chineseTitle + " to the database.");
		}
		done(err);
	});
}

var sentences = [
	{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 1,
	"chinese": "你喜欢这裙子吗?",
	"english": "Do you like the dress?",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 2,
	"chinese": "我爱它",
	"english": "I love it.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 3,
	"chinese": "我自己设计了它",
	"english": "I designed it myself.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 4,
	"chinese": "它是漂亮的",
	"english": "It's beautiful.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 5,
	"chinese": "你准备好了吗?",
	"english": "Are you ready?",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 6,
	"chinese": "我们应该到那里  在客人来之前",
	"english": "We're supposed to be there before the guests arrive.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 7,
	"chinese": "我知道. 我知道",
	"english": "I know. I know.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 8,
	"chinese": "帮助我弄一下这个领结, 可以吗?",
	"english": "Help me with this tie, will you?",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 9,
	"chinese": "亲爱的, 我害怕得要死",
	"english": "Honey, I'm scared to death.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 10,
	"chinese": "但这是你这些年在努力工作的事情",
	"english": "But this is what you've been working for all these years.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 11,
	"chinese": "不, 不",
	"english": "No, no.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 12,
	"chinese": "我工作的是做出一本相册来",
	"english": "I worked to put together a book of photographs.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 13,
	"chinese": "这是娱乐行业",
	"english": "This is show business.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 14,
	"chinese": "Well, 它都是相同工作的一部分",
	"english": "Well, it's all part of the same job.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 15,
	"chinese": "就放轻松  享受它",
	"english": "Just relax and enjoy it.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 16,
	"chinese": "你是对的",
	"english": "You're right.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 17,
	"chinese": "我挣得了这个, 我将会享受它",
	"english": "I earned this, and I'm going to enjoy it.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 18,
	"chinese": "我一从我的神经紧张的崩溃中恢复过来我就(去享受它)",
	"english": "As soon as I recover from my nervous breakdown.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 19,
	"chinese": "你害怕什么?",
	"english": "What are you afraid of?",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 20,
	"chinese": "一切",
	"english": "Everything.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 21,
	"chinese": "一个评论家在那边  今天早上",
	"english": "A critic was there this morning.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 22,
	"chinese": "他估计讨厌我的作品",
	"english": "He probably hates my work.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 23,
	"chinese": "我不得不签我的书  给许多我过去从来没见过的人",
	"english": "I have to sign copies of my book for a lot of people I never met before.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 24,
	"chinese": "我的新鞋子弄得我的脚很疼⋯",
	"english": "My new shoes hurt my feet...",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 25,
	"chinese": "你将会是一个巨大的成功",
	"english": "You're going to be a great success.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 26,
	"chinese": "你准备好了吗?",
	"english": "Are you ready?",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 27,
	"chinese": "我一把我袖口的扣子系好就(准备好了)",
	"english": "As soon as I get these cuff links on.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 28,
	"chinese": "让我来帮忙",
	"english": "Let me help.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 29,
	"chinese": "妈妈和爸爸已经在他们的路上  去往画廊了",
	"english": "Mom and Dad are already on their way down to the gallery.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 30,
	"chinese": "好了! 你看起来非常有吸引力",
	"english": "There! You look very attractive.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 31,
	"chinese": "谢谢你",
	"english": "Thank you.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 32,
	"chinese": "Well, 我想我已经用光了借口",
	"english": "Well, I suppose I've run out of excuses.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 33,
	"chinese": "Mm-hmm. 让我们走吧⋯",
	"english": "Mm-hmm. Let's go ...",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 34,
	"chinese": "Oh, 稍等一下",
	"english": "Oh, one minute.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 35,
	"chinese": "在我们去画廊之前,",
	"english": "Before we go to the gallery,",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 36,
	"chinese": "我就想告诉你  我永远做不出这本书  如果没有你的帮助和你的爱",
	"english": "I just want to tell you that I never could have done this book without your help and your love.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 37,
	"chinese": "我很感谢",
	"english": "I appreciate it.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 38,
	"chinese": "谢谢",
	"english": "Thanks.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 39,
	"chinese": "现在, 不能再拖延了",
	"english": "Now, no more stalling.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 40,
	"chinese": "怎么了?",
	"english": "What is it?",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 41,
	"chinese": "没有人在这里!",
	"english": "There's nobody here!",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 42,
	"chinese": "当然没有了, Richard",
	"english": "Of course not, Richard.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 43,
	"chinese": "你的展览直到8:30才开始",
	"english": "Your show doesn't begin until eight thirty.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 44,
	"chinese": "Oh. 对的",
	"english": "Oh. Right.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 45,
	"chinese": "Richard! 欢迎! 祝你好运 今晚!",
	"english": "Richard! Welcome! Good luck tonight!",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 46,
	"chinese": "Well, 谢谢",
	"english": "Well, thanks.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 47,
	"chinese": "这是我的出版商, Harvey Carlson",
	"english": "This is my publisher, Harvey Carlson.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 48,
	"chinese": "你已经见过我的妻子Marilyn⋯",
	"english": "You've met my wife Marilyn...",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 49,
	"chinese": "-很荣幸地",
	"english": "-Charmed.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 50,
	"chinese": "-嗨",
	"english": "-Hi",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 51,
	"chinese": "我的妈妈, Ellen Stewart",
	"english": "My mother, Ellen Stewart.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 52,
	"chinese": "Harvey Carlson",
	"english": "Harvey Carlson.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 53,
	"chinese": "见到你很愉快",
	"english": "It's good to meet you.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 54,
	"chinese": "这是我的父亲, Philip Stewart医生⋯",
	"english": "This is my father, Dr. Philip Stewart...",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 55,
	"chinese": "很高兴见到你, Carlson先生",
	"english": "Nice to meet you, Mr. Carlson.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 56,
	"chinese": "我的弟弟Robbie⋯",
	"english": "My brother Robbie...",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 57,
	"chinese": "嗨",
	"english": "Hi.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 58,
	"chinese": "嗨",
	"english": "Hi.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 59,
	"chinese": "这是我的妹妹Susan和她的丈夫Harry Bennett和他的女儿Michelle",
	"english": "And this is my sister Susan and her husband Harry Bennett and his daughter Michelle.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 60,
	"chinese": "很高兴见到你",
	"english": "It's nice to meet you.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 61,
	"chinese": "这位绅士是我的爷爷, Malcolm Stewart",
	"english": "And this gentleman is my grandfather, Malcolm Stewart.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 62,
	"chinese": "欢迎, Stewart先生",
	"english": "Welcome, Mr. Stewart.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 63,
	"chinese": "Well, 让你们自己舒服一些",
	"english": "Well, make yourselves comfortable.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 64,
	"chinese": "有甜点在桌子上, 果汁喷趣酒在吧台",
	"english": "There are hors d'oeuvres at the table, fruit punch at the bar.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 65,
	"chinese": "自己取",
	"english": "Help yourselves.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 66,
	"chinese": "我可以给你弄点什么东西吗, Stewart先生?",
	"english": "Can I get you something, Mr. Stewart?",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 67,
	"chinese": "不用, 谢谢你",
	"english": "No, thank you. ",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 68,
	"chinese": "你可以为你的孙子感到非常自豪, Stewart先生",
	"english": "You can feel very proud of your grandson, Mr. Stewart.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 69,
	"chinese": "我是的",
	"english": "I do.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 70,
	"chinese": "我为我所有的孙子孙女感到自豪, Carlson先生",
	"english": "I'm proud of all my grandchildren, Mr. Carlson.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 71,
	"chinese": "当然了",
	"english": "Of course.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 72,
	"chinese": "请随意四处看看",
	"english": "Feel free to look around.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 73,
	"chinese": "如果你们需要任何东西, 要即可",
	"english": "If you need anything, just ask.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 74,
	"chinese": "谢谢你",
	"english": "Thank you.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 75,
	"chinese": "Harvey?",
	"english": "Harvey?",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 76,
	"chinese": "什么事?",
	"english": "Yes?",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 77,
	"chinese": "Mitchell Johnson的评论出来了吗?",
	"english": "Did Mitchell Johnson's review come out yet?",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 78,
	"chinese": "还没有",
	"english": "Not yet.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 79,
	"chinese": "报纸要等到10点才会出来",
	"english": "The newspapers don't come out till about ten o'clock.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 80,
	"chinese": "当它们出来时, 我们就会拿到它",
	"english": "When they come out, we'll get it.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 81,
	"chinese": "谢谢",
	"english": "Thanks.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 82,
	"chinese": "准备好了吗?",
	"english": "Ready?",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 83,
	"chinese": "是的. 人们来了吗?",
	"english": "Yes. Have the people arrived?",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 84,
	"chinese": "客人们在等了",
	"english": "The guests are waiting.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 85,
	"chinese": "Tom正要开门了",
	"english": "Tom's about to open the doors.",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 86,
	"chinese": "好运! 别担心!",
	"english": "Good luck! And stop worrying!",
},
{	
	"courseNo": 1,
	"lessonNo": 77,
	"sentenceNo": 87,
	"chinese": "他们会爱它的",
	"english": "They're going to love it.",
}
];

var audioPath = 'http://7xqe0p.com1.z0.glb.clouddn.com/content/audios/';

function createSentence(sentence, done) {
	var newSentence = new Sentence.model(sentence);
	var basePath = audioPath + sentence.courseNo + '/' + sentence.lessonNo + '/' + sentence.sentenceNo;
	newSentence.audios = [basePath + '.mp3'];
	newSentence.save(function(err) {
		if (err) {
			console.error("Error adding sentence " + sentence.sentenceNo + " to the database:");
			console.error(err);
		} else {
			console.log("Added sentence " + sentence.sentenceNo + " to the database.");
		}
		done(err);
	});
}

exports = module.exports = function(done) {
	async.series([
		function(callback){
			Course.model.remove({}, function(err, result) {
				callback(null, result);
			});
		},
		function(callback){
			Lesson.model.remove({}, function(err, result) {
				callback(null, result);
			});
		},
		function(callback){
			Sentence.model.remove({}, function(err, result) {
				callback(null, result);
			});
		},
		function(callback){
			async.forEach(courses, createCourse, callback);
		},
		function(callback){
			async.forEach(lessons, createLesson, callback);
		},
		function(callback){
			async.forEach(sentences, createSentence, callback);
		},
	], done);
};

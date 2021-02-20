const { logMessageDate } = require("./utilities");

// List of Expletives
const expletives = {
	fuck: "phlewflaff",
	pussy: "phloomance",
	pussie: "phloomancers",
	dick: "phloopdie",
	bitch: "phliminal",
	nigger: "phloshious",
	titties: "phlophinums",
	titty: "phlophinum",
	shit: "phloopy",
	fuk: "phlewflaff",
	cunt: "phlomingous",
	choad: "phlomoninom",
	twat: "phlololonum",
	wanker: "phlonominium",
	bich: "plinimal",
	cock: "phloopdie",
};
const strictExpletives = {
	hoe: "phloshdradomous",
	chink: "phlomingoromous",
	fk: "phlwflff",
	시발: "힝나삐짐",
};

// Expletive Filter
function explicitWordFilter(message) {
	if (check(message)) {
		logMessageDate();
		message.delete();
		message.channel.send(`${message.author} wrote: "${global.newMessage}"`);
		console.log(`Edited ${message.content} to ${global.newMessage}`);
		message.reply("\nHey! \nI said no bad words! If you don't want to play nice, I'm taking my ball and going home!");
	}
}

/* Checks if message has expletives */
function check(message) {
	global.contentArray = message.content.split(" ");

	let foundExpletive = false;
	global.contentArray.forEach((word, index) => {
		if (word.length < 2) {
			return;
		}
		word = deleet(word);
		/* Filters out any string that includes expletive */
		Object.keys(expletives).forEach((key, v) => {
			if (word.toLowerCase().includes(key.toLowerCase())) {
				foundExpletive = true;
				global.contentArray[index] = expletives[key];
			}
		});
		/* Only filters out exact matches for strictExpletives */
		Object.keys(strictExpletives).forEach((key, v) => {
			if (word.toLowerCase() === key.toLowerCase()) {
				foundExpletive = true;
				global.contentArray[index] = strictExpletives[key];
			}
		});
	});
	global.newMessage = global.contentArray.join(" ");
	return foundExpletive;
}

function deleet(word) {
	return word
		.replace(/\$/g, "s")
		.replace(/5/g, "s")
		.replace(/8/g, "b")
		.replace(/\#/g, "h")
		.replace(/vv/g, "w")
		.replace(/\@/g, "a")
		.replace(/4/g, "a")
		.replace(/3/g, "e")
		.replace(/7/g, "t")
		.replace(/\!/g, "i")
		.replace(/1/g, "i")
		.replace(/0/g, "o");
}

/* ----------------- TO DO ----------------- */
/* Make Korean Filter */
// function checkKorean() {
// 	global.contentArray = message.content.split(/([^\w])/);
// 	// Filters out null indexes of array.
// 	noNulls = global.contentArray.filter(Boolean);

// 	console.log(`CONTENT ARRAY: ${noNulls}`);
// 	foundExpletive = false;
// 	noNulls.forEach((word, index) => {
// 		Object.keys(expletives).forEach((key, v) => {
// 			if (word.includes(key)) {
// 				foundExpletive = true;
// 				noNulls[index] = expletives[key];
// 			}
// 		});
// 		Object.keys(strictExpletives).forEach((key, v) => {
// 			if (word === key) {
// 				foundExpletive = true;
// 				noNulls[index] = strictExpletives[key];
// 			}
// 		});
// 	});
// 	global.newMessage = noNulls.join("");
// 	return foundExpletive;
// }
/* ------------------------------------------------ */

module.exports = { explicitWordFilter };

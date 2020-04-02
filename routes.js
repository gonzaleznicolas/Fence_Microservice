var express = require('express');
var model = require('./model')
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	let someObject = {title: "hi", id: 4};
  res.json(someObject);
});

router.get('/post/get/most_recent/:num_posts', async function (req, res) {

	try{
		// get parameters from the url from the req.params object
		let num_posts = parseInt(req.params.num_posts);

		let posts = await model.getMostRecentPosts(num_posts);
		
		res.json(posts);
	}
	catch (err){
		console.log(err);
	}

});

router.get('/post/get/:post_id', async function (req, res) {

	try{
		// get parameters from the url from the req.params object
		let post_id = parseInt(req.params.post_id);

		let post = await model.getPost(post_id);
		
		res.json(post);
	}
	catch (err){
		console.log(err);
	}

});

router.get('/comments/get/:post_id', async function (req, res) {

	try{
		// get parameters from the url from the req.params object
		let post_id = parseInt(req.params.post_id);

		let commentThread = await model.getCommentThread(post_id);
		
		res.json(commentThread);
	}
	catch (err){
		console.log(err);
	}

});

module.exports = router;

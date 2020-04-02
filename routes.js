var express = require('express');
var model = require('./model')
var router = express.Router();

router.get('/post/get/most_recent/:num_posts', async function (req, res) {
	try{
		let num_posts = parseInt(req.params.num_posts);
		let posts = await model.getMostRecentPosts(num_posts);
		res.json(posts);
	}catch (err){
		console.log(err);
	}
});

router.get('/post/search/:search_string', async function (req, res) {
	try{
		let search_string = req.params.search_string;
		let posts = await model.search(search_string);
		res.json(posts);
	}catch (err){
		console.log(err);
	}
});

router.get('/post/get/all', async function (req, res) {
	try{
		let posts = await model.getAllPosts();
		res.json(posts);
	}catch (err){
		console.log(err);
	}
});

router.get('/post/get/:post_id', async function (req, res) {
	try{
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
		let post_id = parseInt(req.params.post_id);
		let commentThread = await model.getCommentThread(post_id);
		res.json(commentThread);
	}
	catch (err){
		console.log(err);
	}
});

module.exports = router;

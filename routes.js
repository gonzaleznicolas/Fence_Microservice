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
		console.log(num_posts);

		let posts = await model.getMostRecentPosts(num_posts);
		
		res.json(posts);
	}
	catch (err){
		console.log(err);
	}

});

module.exports = router;

var express = require('express');
var model = require('./model')
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	let someObject = {title: "hi", id: 4};
  res.json(someObject);
});

module.exports = router;

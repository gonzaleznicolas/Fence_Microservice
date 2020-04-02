const mysql = require('mysql');
const util = require('util');

var pool = mysql.createPool({
  connectionLimit : 10,
  host: "aa1jkdj3cz1d2sd.cq1jyeha7bzs.us-west-2.rds.amazonaws.com",
  user: "nico",
  password: ".Seng401",
  database: "ebdb"
});

pool.query = util.promisify(pool.query)

var lastIdUpdated = -1;

initTables().then(() => setInterval(updatePosts, 500));

async function initTables(){
  try {
    // create all the tables if not already present
    await Promise.all([
      pool.query("CREATE TABLE IF NOT EXISTS event ( \
        id INT(11) NOT NULL AUTO_INCREMENT, \
        event_name VARCHAR(45) DEFAULT NULL, \
        title VARCHAR(50) DEFAULT NULL, \
        content VARCHAR(3000) DEFAULT NULL, \
        author_id INT(11) DEFAULT NULL, \
        time DATETIME DEFAULT NULL, \
        post_id INT(11) DEFAULT NULL, \
        parent_comment_id INT(11) DEFAULT NULL, \
        PRIMARY KEY(id), \
        UNIQUE id_UNIQUE (id))"),
      pool.query("CREATE TABLE IF NOT EXISTS posts ( \
        id INT(11) NOT NULL, \
        title VARCHAR(50), \
        content VARCHAR(250) NOT NULL, \
        author_id INT(11) NOT NULL, \
        time DATETIME NOT NULL, \
        PRIMARY KEY(id))"),
      pool.query("CREATE TABLE IF NOT EXISTS comments ( \
        id INT(11) NOT NULL, \
        content VARCHAR(3000) DEFAULT NULL, \
        author_id INT(11) DEFAULT NULL, \
        time DATETIME DEFAULT NULL, \
        post_id INT(11) DEFAULT NULL, \
        parent_comment_id INT(11) DEFAULT NULL, \
        PRIMARY KEY(id))")
    ]);
		
		let lastPostInserted = await pool.query("SELECT id FROM posts ORDER BY id DESC LIMIT 1")
		let lastCommentInserted = await pool.query("SELECT id FROM comments ORDER BY id DESC LIMIT 1")
		let lastPostInsertedId = lastPostInserted.length == 0 ? -1 : lastPostInserted[0].id;
		let lastCommentInsertedId = lastCommentInserted.length == 0 ? -1 : lastCommentInserted[0].id;
		
		lastIdUpdated = Math.max(lastPostInsertedId, lastCommentInsertedId)
		
		console.log("lastPostInsertedId:", lastPostInsertedId, "lastCommentInsertedId:", lastCommentInsertedId, "lastIdUpdated:", lastIdUpdated);
		
		/*
    console.log("Clearing posts table so it can be repopulated from events...")
    await pool.query("DELETE FROM posts WHERE id>0")

    console.log("Clearing comments table so it can be repopulated from events...")
    await pool.query("DELETE FROM comments WHERE id>0");
		*/
  }
  catch (err) {
    console.log(err);
  }
}

async function updatePosts(){
  try{
    let newEvents = await pool.query("SELECT * FROM event WHERE id > ? ORDER BY id ASC", [lastIdUpdated]);
    
    // for each event do appropriate updates
    for(var i = 0; i < newEvents.length; i++)
    {
      if(newEvents[i].event_name == "new_post")
      {
        console.log("Inserting post:", newEvents[i]);
        pool.query("INSERT INTO posts () VALUES (?,?,?,?,?)", [
					newEvents[i].id,
          newEvents[i].title,
          newEvents[i].content,
          newEvents[i].author_id,
          newEvents[i].time
        ]);
      }
      else if(newEvents[i].event_name == "comment_on_post" || newEvents[i].event_name == "comment_on_comment")
      {
        console.log("Inserting comment:", newEvents[i]);
        pool.query("INSERT INTO comments () VALUES (?,?,?,?,?,?)", [
					newEvents[i].id,
          newEvents[i].content,
          newEvents[i].author_id,
          newEvents[i].time,
          newEvents[i].post_id,
          newEvents[i].parent_comment_id
        ]);
      }
    }
    if(newEvents.length > 0) {
      lastIdUpdated = newEvents[newEvents.length-1].id;
    }

  }
  catch(err){
    console.log(err);
  }
}

async function getAllPosts(){
	try{
		let posts = await pool.query("SELECT * FROM posts ORDER BY time DESC");
		return posts;
	}
	catch(err){
		console.log(err);
	}
}

async function getMostRecentPosts(num_posts){
	try{
		let posts = await pool.query("SELECT * FROM posts ORDER BY time DESC LIMIT ?", [num_posts]);
		return posts;
	}
	catch(err){
		console.log(err);
	}
}

async function getPost(post_id){
	try{
		let posts = await pool.query("SELECT * FROM posts WHERE id = ?", [post_id]);
		return posts[0];
	}
	catch(err){
		console.log(err);
	}
}

async function getCommentThread(post_id){
	try{
		let firstLevelComments = await pool.query("SELECT * FROM comments WHERE post_id = ? AND parent_comment_id IS NULL", [post_id]);
		
		for (let f = 0; f < firstLevelComments.length; f++){
			let secondLevelComments = await pool.query("SELECT * FROM comments WHERE post_id = ? AND parent_comment_id = ?", [post_id, firstLevelComments[f].id]);
			firstLevelComments[f].comments = secondLevelComments;
			
			for (let s = 0; s < secondLevelComments.length; s++){
				let thirdLevelComments = await pool.query("SELECT * FROM comments WHERE post_id = ? AND parent_comment_id = ?", [post_id, secondLevelComments[s].id]);
				secondLevelComments[s].comments = thirdLevelComments;
			}
		}
		
		return firstLevelComments;
	}
	catch(err){
		console.log(err);
	}
}

module.exports = {
	getMostRecentPosts,
	getPost,
	getCommentThread,
	getAllPosts
}


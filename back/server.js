const express = require('express');
const cors = require('cors');
const app = express();
const port = 8000;
const connection = require('./conf.js');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const signature = require('./signature.js');

app.use(bodyParser.json());

app.use(
	bodyParser.urlencoded({
		extended: true,
	}),
);

app.use(cors());

function verifyToken(req, res, next){
   const bearerHeader = req.headers.authorization
   if (typeof bearerHeader !== 'undefined') {
       const bearer = bearerHeader.split(' ')
       const bearerToken = bearer[1]
	   const authData = jwt.verify(bearerToken, signature)
	   req.authData = authData
       next()
   } else {
       res.sendStatus(403)
   }
}

app.get('/posts', verifyToken, (req, res) => {
	const userId = req.authData.sub
	const sqlQuery = 'SELECT user.bio, user.hobbies, user.email, user.firstname, user.lastname, user.city, user.profile_pic, user.study, post.*, DATE_FORMAT(post.created_at, "Posté le : %d/%m/%y à %H:%i") AS created_at, DATE_FORMAT(post.event_date, "Le %d/%m/%y à %H:%i") AS event_date, COUNT(likes.post_id) AS likes, CASE WHEN EXISTS (SELECT * FROM likes WHERE post.id = likes.post_id AND likes.user_id = ?) THEN TRUE ELSE FALSE END AS likedByUser FROM post LEFT JOIN likes ON post.id=likes.post_id JOIN user on user.id=post.user_id GROUP BY post.id'
	connection.query(sqlQuery, userId, (err, results) => {
    if (err) {
		console.log(err)
      	res.status(500).send('Erreur lors de la récupération des posts');
    } 	else {
      	res.json(results);
    }
  });
});

app.post('/posts', verifyToken, (req, res) => {
  	const formData = {
		user_id: req.authData.sub,
		title: req.body.title,
		category: req.body.category,
		content: req.body.content,
		event_date: req.body.event_date
	}
	const sqlQuery = 'INSERT INTO post SET ?';
  	connection.query(sqlQuery, formData, (err, results) => {
		if (err) {
		console.log(err);
		res.status(500).send("Error sending a new post");
		} else {
		res.sendStatus(200);
		}
  	});
});

app.post('/login', (req, res) => {
	const userPassword = req.body.password;
	const userEmail = req.body.email
	const sqlQuery = 'SELECT id, email, password from user where user.email= ?'
	connection.query(sqlQuery, userEmail, (err, matchs) => {
		if (err) {
			res.status(500).send('error')
			return
		}
		const oneMatchFound = (matchs.length === 1)
		if (!oneMatchFound || matchs[0].password !== userPassword) {
			res.status(400).send('Wrong email or password')
			return
		} else {
			jwt.sign({ sub: matchs[0].id }, signature, {expiresIn: '1200sec'}, (err, token) => {
				res.status(200).json({
					token
				});
			});
		}
	})
})

app.post('/register', (req, res) => {
  	const formData = req.body;
	const sqlQuery = 'INSERT INTO user SET ?';
  	connection.query(sqlQuery, formData, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error registering new user");
    } else {
      res.sendStatus(200);
    }
  	});
})

app.get('/profiles/search/:userdata', verifyToken, (req, res) => {
	const userdata = req.params.userdata
	const sqlQuery = 'SELECT user.firstname, user.lastname, user.study, user.profile_pic, user.city, user.id FROM user WHERE user.firstname = ? OR user.lastname = ? OR user.city = ? OR user.study = ?'
	connection.query(sqlQuery, [userdata, userdata, userdata, userdata], (err, results) => {
		if (err) {
			console.log(err)
			res.status(500).send('error getting user data');
		} else {
			res.json(results)
		}
	})
})

app.get ('/profiles/:userId', verifyToken, (req, res) => {
	const userId = req.authData.sub
	const sqlQuery = 'SELECT * FROM user WHERE user.id = ?'
	connection.query(sqlQuery, userId, (err, results) => {
		if (err) {
			console.log(err)
			res.status(500).send('error getting user data');
		} else {
			res.json(results)
		}
	})
})

app.get('/postsaves', verifyToken, (req, res) => {
	const userId = req.authData.sub
	const sqlQuery = 'SELECT post.id, CASE WHEN EXISTS (SELECT * FROM post_saves WHERE post.id=post_saves.post_id AND post_saves.user_id= ?) THEN TRUE ELSE FALSE END AS savedByUser FROM post LEFT JOIN post_saves ON post.id=post_saves.post_id GROUP BY post.id'
	connection.query(sqlQuery, userId, (err, results) => {
		if (err) {
			console.log(err);
			res.status(500).send('error getting saved posts from user');
		} else {
			res.json(results)
		}
	})
})

app.put('/postsaves', verifyToken, (req, res) => {
	const userId = req.authData.sub
	const postId = req.body.post_id
	const formData = {user_id: userId, post_id: postId}
	const sqlQuery1 = 'SELECT * FROM post_saves WHERE post_id = ? AND user_id = ?'
	connection.query(sqlQuery1, [postId, userId], (err, results) => {
		if (err) {
			console.log(err);
			res.status(500).send('error getting saved posts');
		} else {
			if (results[0]) {
				const sqlQuery2 = 'DELETE FROM post_saves WHERE post_id = ? AND user_id = ?'
				connection.query(sqlQuery2, [postId, userId], err => {
					if (err) {
						console.log(err);
						res.status(500).send("Error deleting saved post");
					} else {
						res.sendStatus(204)
					}
				})
			} else {
				const sqlQuery3 = 'INSERT INTO `post_saves` SET ?';
				connection.query(sqlQuery3, formData, (err, results2) => {
					if (err) {
						console.log(err);
						res.status(500).send("Error saving a post");			
					} else {
						res.json(results2);
					}
				})
			}
		}
	})
})

app.get('/:userId/postsaves', verifyToken, (req, res) => {
	const userId = req.authData.sub
	const sqlQuery = 'SELECT user.firstname, user.lastname, user.city, user.profile_pic, user.study,post.*, DATE_FORMAT(post.created_at, "Posté le : %d/%m/%y à %H:%i") AS created_at, DATE_FORMAT(post.event_date, "Le %d/%m/y% à %H:%i") AS event_date FROM post JOIN post_saves ON post_saves.post_id = post.id JOIN user ON user.id=post.user_id WHERE post_saves.user_id = ?'
	connection.query(sqlQuery, userId, (err, results) => {
		if (err) {
			console.log(err)
			res.status(500).send("Error getting posts in library")
		} else {
			res.json(results)
		}
	})
})

app.get ('/likes', verifyToken, (req, res) => {
	const sqlQuery = 'SELECT * from likes';
	connection.query(sqlQuery, (err, results) => {
		if (err) {
			console.log(err)
			res.status(500).send("Error getting likes");			
		} else {
			res.json(results);
		}	
	})
})

app.put('/likes', verifyToken, (req, res) => {
	const userId = req.authData.sub
	const postId = req.body.post_id
	const formData = {user_id: userId, post_id: postId}
	const sqlQuery1 = 'SELECT * FROM likes WHERE post_id = ? AND user_id = ?'
	connection.query(sqlQuery1, [postId, userId], (err, results) => {
		if (err) {
			console.log(err);
			res.status(500).send('error getting like');
		} else {
			if (results[0]) {
				const sqlQuery2 = 'DELETE FROM likes WHERE post_id = ? AND user_id = ?'
				connection.query(sqlQuery2, [postId, userId], err => {
					if (err) {
						console.log(err);
						res.status(500).send("Error deleting like");
					} else {
						res.sendStatus(204)
					}
				})
			} else {
				const sqlQuery3 = 'INSERT INTO `likes` SET ?';
				connection.query(sqlQuery3, formData, (err, results2) => {
					if (err) {
						console.log(err);
						res.status(500).send("Error adding like");			
					} else {
						res.json(results2);
					}
				})
			}
		}
	})
})

app.get('/:userId/contacts', verifyToken, (req, res) => {
	const userId = req.authData.sub
	const sqlQuery = 'SELECT DISTINCT user.id, user.firstname, user.lastname, user.profile_pic FROM user JOIN messages ON messages.sender_id=user.id WHERE recipient_id= ? UNION SELECT DISTINCT user.id, user.firstname, user.lastname, user.profile_pic FROM user JOIN messages ON messages.recipient_id=user.id WHERE sender_id= ?'
	connection.query(sqlQuery, [userId, userId], (err, results) => {
		if (err) {
			res.status(500).send('Erreur lors de la récupération des contacts');
		} else {			
			res.json(results);
		}
	})
})

app.get('/:userId/contacts/:contactId/conversation', verifyToken, (req, res) => {
	const userId = req.authData.sub
	const contactId = req.params.contactId
	const sqlQuery = 'SELECT messages.* FROM messages WHERE (sender_id= ? AND recipient_id= ?) OR (sender_id= ? AND recipient_id= ?) ORDER BY messages.id DESC'
	connection.query(sqlQuery, [userId, contactId, contactId, userId], (err, results) => {
		if (err) {
			res.status(500).send('Erreur lors de la récupération de la conversation')
		} else {
			res.json(results);
		}
	})
})

app.post('/conversation', verifyToken, (req, res) => {
  	const senderId = req.authData.sub
	const recipientId = req.body.recipient_id
	const content = req.body.content
	const formData = {
		sender_id: senderId,	
		recipient_id: recipientId,
		content: content
	}
	const sqlQuery = 'INSERT INTO messages SET ?'
  	connection.query(sqlQuery, formData, (err, results) => {
		if (err) {
		console.log(err);
		res.status(500).send("Error sending a new post");
		} else {
		res.sendStatus(200);
		}
  	});
});

app.listen(port, err => {
	if (err) {
		throw new Error('Something bad happened...');
	}
	console.log(`Server is listening on ${port}`);
});

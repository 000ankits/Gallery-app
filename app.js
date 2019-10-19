const express = require('express'),
	mongoose = require('mongoose'),
	bodyparser = require('body-parser'),
	passport = require('passport'),
	localStrategy = require('passport-local'),
	session = require('express-session'),
	user = require('./models/user'),
	image = require('./models/image'),
	comment = require('./models/comment'),
	methodOverride = require('method-override'),
	dotEnv = require('dotenv'),
	app = express();

dotEnv.config({ path: './.env' });

console.log('ENV: ', process.env.DBURL);
// mongoose.connect('mongodb://localhost/image_gallery');
mongoose.connect(process.env.DBURL, { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.connect('mongodb+srv://ankits:ankits123@ankits-yxpsb.mongodb.net/test?retryWrites=true&w=majority');

app.set('view engine', 'ejs');
app.use(session({ secret: 'Password Encryption', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	next();
});

passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

var port = process.env.PORT || 8888;

// ===========================
// Gallery Routes
// ===========================

app.get('/', (req, res) => {
	image.find({}, (err, foundImage) => {
		if (err) {
			console.log(err);
			return res.send(res.statusCode);
		}
		res.render('publicGallery', { images: foundImage });
	});
});

// Index
app.get('/gallery', isLoggedIn, (req, res) => {
	image.find({}, (err, foundImage) => {
		if (err) {
			console.log(err);
			return res.send(res.statusCode);
		}
		res.render('userGallery', { images: foundImage });
	});
});

// New
app.get('/gallery/new', isLoggedIn, (req, res) => {
	res.render('new');
});

// Create
app.post('/gallery', isLoggedIn, (req, res) => {
	image.create({ url: req.body.url, desc: req.body.desc, privacy: req.body.privacy }, (err, newImage) => {
		if (err) {
			console.log(err);
			return res.send(res.statusCode);
		} else {
			newImage.owner = req.user._id;
			newImage.save();
			res.redirect('/gallery');
		}
	});
});

// Show
app.get('/gallery/:id', (req, res) => {
	image.findById(req.params.id, (err, foundImage) => {
		if (err) {
			console.log(err);
			return res.send(res.statusCode);
		} else {
			comment.find({}, (err, foundcomments) => {
				if (err) {
					console.log(err);
					return res.send(res.statusCode);
				} else {
					user.findById(foundImage.owner, (err, foundOwner) => {
						if (err) {
							console.log(err);
							return res.send(res.statusCode);
						} else {
							res.render('showImage', { image: foundImage, comment: foundcomments, owner: foundOwner });
						}
					});
				}
			});
		}
	});
});

// Edit
app.get('/gallery/:id/edit', isLoggedIn, (req, res) => {
	image.findById(req.params.id, (err, foundImage) => {
		if (err) {
			console.log(err);
			return res.send(res.statusCode);
		} else {
			res.render('editImage', { image: foundImage });
		}
	});
});

// Update
app.put('/gallery/:id', isLoggedIn, (req, res) => {
	image.findByIdAndUpdate(req.params.id, { url: req.body.url, desc: req.body.desc }, (err, foundImage) => {
		if (err) {
			console.log(err);
			return res.send(res.statusCode);
		} else {
			res.redirect('/gallery/' + req.params.id);
		}
	});
});

// Destroy
app.delete('/gallery/:id', isLoggedIn, (req, res) => {
	image.findByIdAndRemove(req.params.id, (err) => {
		if (err) {
			console.log(err);
			res.redirect('/gallery');
		} else {
			res.redirect('/gallery');
		}
	});
});

// ===========================
// Comment Routes
// ===========================

//Index
app.get('/gallery/:imageId/comment', isLoggedIn, (req, res) => {
	image.findById(req.params.imageId, (err, foundImage) => {
		if (err) {
			console.log(err);
			return res.send(res.statusCode);
		} else {
			res.redirect('/gallery/' + foundImage._id);
		}
	});
});

// New
app.get('/gallery/:imageId/comment/new', isLoggedIn, (req, res) => {
	image.findById(req.params.imageId, (err, foundImage) => {
		if (err) {
			console.log(err);
			return res.send(res.statusCode);
		} else {
			res.render('newComment', { image: foundImage });
		}
	});
});

// Create
app.post('/gallery/:imageId/comment', isLoggedIn, (req, res) => {
	image.findById(req.params.imageId, (err, foundImage) => {
		if (err) {
			console.log(err);
			return res.send(res.statusCode);
		} else {
			comment.create(
				{ text: req.body.text, author: req.user.username, image: foundImage._id, owner: req.user._id },
				(err, newComment) => {
					if (err) {
						console.log(err);
						return res.send(res.statusCode);
					} else {
						foundImage.comments.push(newComment._id);
						newComment.save();
						foundImage.save();
						res.redirect('/gallery/' + req.params.imageId);
					}
				}
			);
		}
	});
});

// edit
app.get('/gallery/:imageId/comment/:commentId/edit', isLoggedIn, (req, res) => {
	comment.findById(req.params.commentId, (err, foundComment) => {
		if (err) {
			console.log(err);
			return res.send(res.statusCode);
		} else {
			res.render('editComment', { comment: foundComment });
		}
	});
});

// Update
app.put('/gallery/:imageId/comment/:commentId', isLoggedIn, (req, res) => {
	comment.findByIdAndUpdate(req.params.commentId, { text: req.body.text }, (err, foundComment) => {
		if (err) {
			console.log(err);
			return res.send(res.statusCode);
		} else {
			res.redirect('/gallery/' + req.params.imageId);
		}
	});
});

// Delete
app.delete('/gallery/:imaged/comment/:commentId', isLoggedIn, (req, res) => {
	comment.findByIdAndRemove(req.params.commentId, (err) => {
		if (err) {
			console.log(err);
			return res.send(res.statusCode);
		} else {
			res.redirect('/gallery/' + req.params.imageId);
		}
	});
});

// ===================
// Auth Routes
// ===================

// Register
app.get('/register', (req, res) => {
	res.render('register');
});

app.post('/register', (req, res) => {
	user.register(new user({ username: req.body.username }), req.body.password, (err, newUser) => {
		if (err) {
			console.log(err);
			res.redirect('/register');
		}
		passport.authenticate('local')(req, res, () => {
			res.redirect('/gallery');
		});
	});
});

// login
app.get('/login', (req, res) => {
	res.render('login');
});

app.post(
	'/login',
	passport.authenticate('local', {
		successRedirect : '/gallery',
		failureRedirect : '/login'
	}),
	(req, res) => {}
);

// LogOut
app.get('/logout', (req, res) => {
	req.logOut();
	res.redirect('/');
});

// ===================
// MiddleWare
// ===================
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

app.listen(port, () => {
	console.log('Server started...');
});

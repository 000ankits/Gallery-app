const express = require('express'),
	mongoose = require('mongoose'),
	bodyparser = require('body-parser'),
	passport = require('passport'),
	localStrategy = require('passport-local'),
	localMongoose = require('passport-local-mongoose'),
	session = require('express-session'),
	user = require('./models/user'),
	image = require('./models/image'),
	methodOverride = require('method-override'),
	app = express();

mongoose.connect('mongodb://localhost/image_gallery');
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

// ===========================
// RESTful Routes
// ===========================
app.get('/', (req, res) => {
	image.find({}, (err, foundImage) => {
		if (err) {
			return res.send(err);
		}
		res.render('publicGallery', { images: foundImage });
	});
});

app.get('/pics', (req, res) => {
	res.send('Console');
});

app.get('/gallery', isLoggedIn, (req, res) => {
	image.find({}, (err, foundImage) => {
		if (err) {
			return res.send(err);
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
	image.create({ url: req.body.url, desc: req.body.desc, display: req.body.display }, (err, newImage) => {
		if (err) {
			console.log(err);
		} else {
			console.log(newImage.desc + ' Created');
			console.log('Display mode: ' + newImage.display);
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
		} else {
			res.render('showImage', { image: foundImage });
		}
	});
});

// Edit
app.get('/gallery/:id/edit', isLoggedIn, (req, res) => {
	image.findById(req.params.id, (err, foundImage) => {
		if (err) {
			console.log(err);
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

app.listen('8888', () => {
	console.log('Server started...');
});

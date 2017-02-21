var express = require('express');
var passport = require('passport');
var config = require('./oauth.js');
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var mongoose = require('mongoose');

// Connect to the database
mongoose.connect('mongodb://localhost/passport');

// Create a user model
var User = mongoose.model('User', {
  platform: String,
  oauthID: Number,
  name: String,
  created: Date,
  token: String,
  sharing: String
});


// Configure the Facebook strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new FacebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL
  },
  function(accessToken, refreshToken, profile, cb) {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile);
  }));

// Configure Twitter strategy
passport.use(new TwitterStrategy( {
    consumerKey: config.twitter.consumerKey,
    consumerSecret: config.twitter.consumerSecret,
    callbackURL: 'http://0.0.0.0:8080/'
  }, 
 function(accessToken, refreshToken, profile, done) {
    // If a twitter user doesn't exist in our database, create one
    User.findOne({ platform: 'twitter' }, function(err, user) {
      if(err) {
        console.log(err);  // handle errors!
      }
      if (!err && user !== null) {
        done(null, user);
      } else {
        user = new User({
          platform: 'twitter',
          oauthID: profile.id,
          name: profile.displayName,
          created: Date.now(),
          token: accessToken,
          sharing: 'true'
        });
        user.save(function(err) {
          if(err) {
            console.log(err);  // handle errors!
          } else {
            console.log("saving user ...");
            done(null, user);
          }
        });
      }
    });
    return cb(null, profile);
  }
));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(obj, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
});


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.

// Facebook
app.get('/login/facebook', 
  passport.authenticate('facebook'));

// app.get('/login/facebook/return', 
//   passport.authenticate('facebook', { failureRedirect: '/login' }),
//   function(req, res) {
//     res.redirect('/');
//   });

// app.get('/profile',
//   require('connect-ensure-login').ensureLoggedIn(),
//   function(req, res){
//     res.render('profile', { user: req.user });
//   });


/* Twitter */

// Only redirect the user to twitter authentication if we don't 
// already have info for twitter
//var authenticateTwitter = function(req, res) {
//  passport.authenticate('twitter');
   //  User.findOne({platform: 'twitter'}, function(err, user) {
   //  if (err || user !== null) {
   //    console.log("An error occured while looking for the user in the db");
   //    res.send({'error': 'An error has occurred'})
   //  } else {
   //    passport.authenticate('twitter');
   //  }
   // });
//}

/* Database updates for twitter */

// Remove the twitter user from the db (i.e. unlink their account)
var removeTwitterUser = function(req, res) {
   User.findOne({ platform: 'twitter' }, function(err, user) {
      if (!err && user !== null) {
        user.remove();
      } else {
        res.send({'error':'An error has occurred'});
      }
    });
}

// Skeleton code for posting to twitter
var postToTwitter = function(req, res) {
  // Info sent to us from the front-end
  var post = req.body;

  // Get the twitter user's info from the db
  User.findOne({platform: 'twitter'}, function(err, user) {
      if (!err && user !== null) {
        // Make request to twitter api
        // some code goes here

        // on success, send a response to our front end saying so
        // some code goes here

      } else {
        // send a response to the front-end saying
        // that we weren't able to post to twitter
        res.send({'error':'An error has occurred'});
      }
  });
}

// Grab the twitter user info (except the token)
var getTwitterUser = function(req, res) {
  User.findOne({platform: 'twitter'}, function(err, user) {
    if (err || user == null) {
      res.send({'error':'unable to get user'});
    } else {
      // We don't want to send the token back over an
      // insecure connection
      delete user.token;
      res.send(user);
    }
  });
}


/* Twitter API for our server*/
//app.get('/login/twitter', authenticateTwitter);
app.get('/login/twitter', passport.authenticate('twitter'));

// Post 
app.get('/twitter/post', postToTwitter);

// Get twitter user if already exists
app.get('/twitter/user', getTwitterUser);

// Remove twitter user (i.e. unlink account)
app.get('/twitter/remove', removeTwitterUser);


app.listen(4000);

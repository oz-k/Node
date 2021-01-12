const googleStrategy = require('passport-google-oauth20').Strategy;
const model = require('../models');
const key = require('./keys')

module.exports = new googleStrategy(key.google, async function(accessToken, refreshToken, profile, done) {
    await model.User.findOrCreate({ where : {userId : profile.id}, defaults : {
        name : profile._json.name,
        provider : 'google'
    }});
    return done(null, {'user':profile.id, 'lawyer':false});
});
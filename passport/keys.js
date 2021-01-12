const path = require('path');
require('dotenv').config({path:path.join(__dirname, '/../resources/info.env')});

module.exports.kakao = {
    clientID : process.env.KAKAO_ID,
    clientSecret : process.env.KAKAO_SECRET,
    callbackURL : process.env.URL+"kakao-login"
};

module.exports.google = {
    clientID : process.env.GOOGLE_ID,
    clientSecret : process.env.GOOGLE_SECRET,
    callbackURL : process.env.URL+'google-callback'
};
const passport = require('passport');
const kakao = require('./kakao.js');
const localUser = require('./local-user.js');
const localLawyer = require('./local-lawyer.js');
const google = require('./google.js');
const model = require("../models");

module.exports = function() {
    passport.serializeUser(function(user, done) { //전달받은 객체를 세션에 저장하는 역할(저장 후 deserialize로 전달)
        user.user = user.user.toString();
        done(null, user);
    });

    passport.deserializeUser(async function(user, done) { //서버로 들어오는 요청마다 세션 정보가 유효한지 검사하는 역할
        var user;
        if(user.lawyer === true) {
            user = await model.lawyer.findOne({
                where : {userid : user.user},
                attributes : ['userId', 'name', 'gender', 'address', 'phone']
            });
        } else {
            user = await model.User.findOne({
                where : {userid : user.user},
                attributes : ['userId', 'name', 'birth', 'gender', 'address', 'cardNum', 'phone']
            });
        }
        done(null, user);
    });

    passport.use("local-user", localUser);
    passport.use('local-lawyer', localLawyer);
    passport.use("kakao", kakao);
    passport.use("google", google);
}
const localStrategy = require("passport-local").Strategy;
const model = require('../models');
const hash = require('../resources/hash');

module.exports = new localStrategy({
        usernameField:'id',
        passwordField:'pw',
    },
    async function(id, pw, done) {
        const user = await model.lawyer.findOne({where:{userId:id}, attributes : ['userId', 'userPw', 'provider']});
        if(user != null && await hash.comp(pw, user.userPw) && user.provider == 'local') {
            return done(null, {'user':user.dataValues.userId, 'lawyer':true});
        }

        return done(null, false, {message:"mismatch"});
    }
);
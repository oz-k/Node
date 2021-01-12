const kakaoStrategy = require('passport-kakao').Strategy;
const model = require('../models');
const key = require('./keys')

module.exports = new kakaoStrategy(key.kakao, async function(accessToken, refreshToken, profile, done) {
    await model.User.findOrCreate({where : {userId : profile.id}, defaults : {
        name : profile._json.properties.nickname,
        gender : profile._json.kakao_account.gender == 'male' ? 1 : 0,
        provider : 'kakao'
        }
    });

    return done(null, {'user':profile.id, 'lawyer':false});
});
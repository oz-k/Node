const hash = require('../resources/hash');
var router = require('express').Router();
var model = require('../models');

router.get('/join', function(req, res) {
    res.render('./joinpage/join.ejs');
});

router.post('/join', async function(req, res) {
    var pw = await hash.hashing(req.body.pw);
    var user = {
        userId:req.body.id,
        userPw:pw,
        name:req.body.name,
        gender:req.body.gender=='남'?1:0, //html script에서 처리
        phone:req.body.phone,
        provider:'local'
    }
    
    if(req.body.lawyer === 'true') {
        model.lawyer.create(user).then(function(result) {
            if(result) res.send("<script>alert('회원가입 성공'); location.href='./login';</script>");
        }).catch(function(err) {
            if(err) res.send("<script>alert('아이디 중복'); location.href='./join';</script>");
        })
    } else {
        model.User.create(user).then(function(result) {
            if(result) res.send("<script>alert('회원가입 성공'); location.href='./login';</script>");
        }).catch(function(err) {
            if(err) res.send("<script>alert('아이디 중복'); location.href='./join';</script>");
        });
    }
});

module.exports = router;
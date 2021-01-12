const passport = require('passport');
const router = require('express').Router();

router.get('/login', function(req, res) { //로그인
    console.log(req.ip);
     //flash()는 한번만 부를 수 있음
     var temp = req.flash();
     var message = temp.message;
     var id, pw, idnull, pwnull, mismatch, lawyer;
     id = temp.idInfo;
     pw = temp.pwInfo;
     lawyer = temp.lawyer;
     if(message) {
         if(message[0] == 'idnull')
             idnull = '아이디가 입력되지 않았습니다.';
         else if(message[0] == 'pwnull')
             pwnull = '비밀번호가 입력되지 않았습니다.';
         else
             mismatch = '가입하지 않은 아이디이거나, 잘못된 비밀번호입니다.';
     }
     res.render(__dirname+'/../views/loginpage/login.ejs', {id:id, pw:pw, idnull:idnull, pwnull:pwnull, lawyer, mismatch:mismatch});
});

router.get("/logout", function(req, res) { //전체 로그아웃(세션 삭제, ***로그인 flash 비움***)
    req.flash();
    req.logout();
    res.redirect('/login');
});

router.get("/auth/fail", function(req, res) { //로그인실패창
    res.send("<script>alert('오류가 발생했습니다.'); location.href='/login';</script>");
});

router.post("/local-login", function(req, res, next) {
    req.flash('idInfo', req.body.id);
    req.flash('pwInfo', req.body.pw);
    //변호사로그인 확인
    if(req.body.lawyer === 'true') {
        req.flash('lawyer', 'true');
    }
    //id가 들어있는지 확인
    if(!req.body.id) {
        req.flash('message', 'idnull');
        return res.redirect('/login');
    }
    //pw가 들어있는지 확인
    if(!req.body.pw) {
        req.flash('message', 'pwnull');
        return res.redirect('/login');
    }

    //변호사 로그인일 때
    if(req.body.lawyer === 'true') {
        passport.authenticate('local-lawyer', function(err, user, info){
            if(err) return next(err);
            logic(user, info);
        })(req, res, next);
    } else {
        passport.authenticate("local-user", function(err, user, info) {
            if(err) return next(err);
            logic(user, info);
        })(req, res, next);
    }
    function logic(user, info) {
        if (info) {
            req.flash('message', info.message);
            return res.redirect('/login');
        }
        req.logIn(user, function(err) {
            if(err) return next(err);
            //메인페이지
            return res.redirect('/main');
        });
    }
});

//kakao-login으로 접속하면 kakao 전략을 실행
router.get("/kakao-login", passport.authenticate("kakao", { //요청 인증 후 성공, 실패 여부 확인 후 redirect
    successRedirect : "/",
    failureRedirect : "/auth/fail"
})); 

router.get("/google-login", passport.authenticate("google", {scope : ['profile']}));
router.get("/google-callback", passport.authenticate('google', {
    successRedirect : "/main",
    failureRedirect : "/auth/fail"
}));

module.exports = router;
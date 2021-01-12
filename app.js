const http = require('http');
const https = require('https');
const express = require('express');
const passport = require('passport');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const models = require("./models/index.js").sequelize;
const fs = require('fs');
require('./passport/index.js')();
app.use(express.static(__dirname+'/views/loginpage'));
app.use(express.static(__dirname+'/views/joinpage'));
app.use(express.static(__dirname+'/views/mainpage'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(flash());

//ssl
const options = {
    key : fs.readFileSync('./ssl/private.pem'),
    cert : fs.readFileSync('./ssl/public.pem')
};

models.sync().then(function() {
    console.log("DB Connected");
}).catch(function(err) {
    console.log("DB Error");
    console.log(err);
});

//session은 req객체 안에 req.session을 만듦, 여기에 값을 대입하거나 삭제해서 세션변경이 가능
//req.session.destroy()로 세션 한번에 삭제 가능
//req.sessionID == 현재 세션 ID

var sessionData = session({
    secret:"asdasda", //비밀키 역할
    resave : false, //요청이 왔을 때 세션에 수정사항이 생기지 않더라도 세션을 다시 저장할지 설정
    saveUninitialized : true, //세션에 저장할 내역이 없더라도 세션을 저장할지 설정
    cookie : {
        httpOnly : true,
        maxAge:60*60*1000,
        secure: false,
    } //1시간으로 세션 시간 제한
});

app.use(sessionData);
app.use(passport.initialize()); //passport 초기화
app.use(passport.session()); //express-session과 연결

//redirect http to https
app.all('*', function(req, res, next) {
    var protocol = req.headers['x-forwarded-proto'] || req.protocol;

    if(protocol == 'https') {
        next();
    } else {
        var to = `https://${req.hostname}${req.url}`;
        res.redirect(to);
    }
})

const ejs = require("ejs");
app.set("view-engine", ejs);

const main = require('./routes/main.js');
app.get("/", main); //메인
app.get('/main', main);
app.get("/message/:id", main);

const login = require('./routes/login.js');
app.get("/login", login); //로그인
app.get("/logout", login); //로그아웃
app.post("/local-login", login); //로컬로그인
app.get("/kakao-login", login); //카카오로그인
app.get("/google-login", login); //구글 로그인
app.get("/google-callback", login); //구글 콜백
app.get("/auth/fail", login); //로그인 실패

const join = require('./routes/join.js');
app.get('/join', join);
app.post('/join', join);

http.createServer(app).listen(80);
var server = https.createServer(options, app);

//socket
require('./resources/socket')(server, sessionData);

server.listen(443, function() {
    console.log("Start Server");
});


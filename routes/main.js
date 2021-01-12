const router = require('express').Router();

router.get('/', function(req, res) { //메인창
    if(req.isAuthenticated()) { //사용자가 인증되어있는 상태를 확인해 boolean 반환
        res.render("./mainpage/main.ejs", {username: req.user.name, userid: req.user.dataValues.userId});
        return;
    }
    res.redirect('/login');
});

router.get('/main', async function(req, res) {
    if(req.isAuthenticated()) {
        var lawyerData = [];
        if(req.user.constructor.name === 'User') {
            const model = require('../models');
            var lawyerList = await model.lawyer.findAll();
            for(key in lawyerList) {
                var dataValues = lawyerList[key].dataValues
                lawyerData.push({name:dataValues.name, id:dataValues.userId});
            }
        }

        res.render("./mainpage/index.ejs", {username:req.user.name, userid:req.user.dataValues.userId, lawyerData:lawyerData})
        return;
    }
    res.redirect('/login');
});

module.exports = router;
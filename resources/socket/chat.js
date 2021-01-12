const model = require('../../models');
const Sequelize = require('sequelize');
const fs = require('fs');

module.exports = function(namespace) {
     // users = {databaseID : {lawyer, socketid}}
     var users = {};

     //io.to(socketId).emit <- 특정 사용자에게만 emit
     namespace.on('connection', function(socket) {
         if(socket.handshake.session.passport) {
            var user = socket.handshake.session.passport['user'];
            users[user['user']] = {'lawyer':user['lawyer'], 'socket':socket.id};

            //최근채팅내역 검색
            (async function getChatHistory() {
                var query = `select *, 
                    if(fromLawyer = 0, (select name from user where userid=fromid), (select name from lawyer where userid=fromid)) as 'fromName', 
                    if(toLawyer = 0, (select name from user where userid=toid), (select name from lawyer where userid=toid)) as 'toName' 
                    from chat
                    where fromid='${user['user']}' or toid='${user['user']}'`;

                var chats = await model.sequelize.query(query)

                for(var i=0; i<chats[0].length; i++) {
                    for(var j=i+1; j<chats[0].length; j++) {
                        if(chats[0][i]) {
                            var ifrom = chats[0][i].fromId, 
                                jfrom = chats[0][j].fromId, 
                                ito = chats[0][i].toId, 
                                jto = chats[0][j].toId;

                            //가장 최근의 메시지만 select
                            if((ifrom === jfrom && ito === jto) || (ifrom === jto && ito === jfrom)) {
                                chats[0].splice(i, 1)
                                i--;
                            }
                        }
                    }
                }
                socket.emit('setChatHistory', chats[0])
            })();

            //채팅내역
            socket.on('getChatLog', async function(toId) {
                var query = `select * from chat where (fromId='${user['user']}' and toId='${toId}') or (fromId='${toId}' and toId='${user['user']}')`;
                var chatLog = await model.sequelize.query(query)
                var chatLog = await model.chat.findAll({
                    where : {
                        [Sequelize.Op.or]:[{fromId:user['user'], toId:toId}, {fromId:toId, toId:user['user']}]
                    }
                });
                for(var i=0; i<chatLog.length; i++) {
                    if(chatLog[i].type === 'img') {
                        chatLog[i].msg = Buffer.from(fs.readFileSync(`${__dirname}/../image/${chatLog[i].msg}.jpg`)).toString('base64');
                    }
                }
                socket.emit('setChatLog', chatLog, toId);
            })

            //메시지전송
            socket.on('sendMsg', async function(msg) {
                var name;
                var insert;
                if(user['lawyer'] === true) {
                    name = await model.lawyer.findOne({where:{userid:user['user']}});
                } else {
                    name = await model.User.findOne({where:{userid:user['user']}});
                }
                if(users[msg.to]) {
                    namespace.to(users[msg.to].socket).emit('bringMsg', {'type':msg.type, 'msg':msg.msg, 'from':user['user'], 'name':name.dataValues.name});
                }
                if(msg.type === 'msg') {
                    insert = {fromId:user['user'], fromLawyer:user['lawyer'], toId:msg.to, toLawyer:!user['lawyer'], msg:msg.msg, type:msg.type};
                } else {
                    var buffer = Buffer.from(msg.msg, 'base64');
                    var filename = fs.readdirSync(`${__dirname}/../image`).length;

                    fs.writeFile(`${__dirname}/../image/${filename}.jpg`, buffer, function(err) {
                        if(err) console.log(err);
                    });
                    insert = {fromId:user['user'], fromLawyer:user['lawyer'], toId:msg.to, toLawyer:!user['lawyer'], msg:filename, type:msg.type};
                }
                
                model.chat.create(insert);
            });

            //socketId와 databaseId mapping
            socket.on('join', function(userid) {
                users[userid.from] = {'id':socket.id, 'to':userid.to, 'webcam':userid.webcam, 'peerid':userid.id};
                if(users[userid.to]) {
                    if(users[userid.to].to === userid.from) {
                        var to, id;
                        if(userid.webcam === true) { //내가 웹캠이 있으면 내가 call
                            to = socket.id; //내 소켓id
                            id = users[userid.to].peerid //상대 peerid
                        } else { //내가 웹캠이 없으면 상대가 call
                            to = users[userid.to].id; //상대 소켓id
                            id = users[userid.from].peerid; //내 peerid
                        }
                        io.to(to).emit('peer', id);
                    }
                }
            })
    
            socket.on('disconnect', function() {
                console.log('disconnect')
                delete users[user['user']];
            });
        }
     });
}
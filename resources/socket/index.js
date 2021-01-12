module.exports = function(server, sessionData) {
    var io = require('socket.io')(server);
    var chat = io.of('/chat');
    var rtc = io.of('/rtc');

    //passport와 socketio session 통합
    chat.use(require('express-socket.io-session')(sessionData, {autoSave:true}))
    rtc.use(require('express-socket.io-session')(sessionData, {autoSave:true}))

    require('./chat.js')(chat);
    require('./webRTC.js')(rtc);
}
module.exports = function(namespace) {
    // users = {databaseID : {lawyer, socketid}}
    var users = {};

    namespace.on('connection', function(socket) {
        if(socket.handshake.session.passport) {
            var user = socket.handshake.session.passport['user'];
            var myId = user['user'];
            users[myId] = {lawyer:user['lawyer'], socket:socket.id, 'toId':undefined};

            socket.on('join', function(id) {
                users[myId].toId = id;
                if(users[id]) {
                    if(users[id].toId === myId) {
                        socket.emit('signaling', {type:'sendOffer'});
                    }
                }
            })

            //시그널링
            socket.on('sendSignal', function(signal) {
                //내 offer 세팅
                if(signal.type === 'offer') {
                    console.log('offer', signal.id, signal.sdp)
                    namespace.to(users[signal.id].socket).emit('signaling', {type:'sendAnswer', sdp:signal.sdp, pc:signal.pc});
                //상대에게 내 answer 보내기
                } else if(signal.type === 'answer') {
                    console.log('answer', signal.id, signal.sdp)
                    namespace.to(users[signal.id].socket).emit('signaling', {type:'bringAnswer', sdp:signal.sdp, pc:signal.pc})
                //상대에게 내 candidate 보내기
                } else if(signal.type === 'candidate') {
                    console.log('candidate', signal.id, signal.candidate);
                    namespace.to(users[signal.id].socket).emit('signaling', {type:'candidate', candidate:signal.candidate, pc:signal.pc})
                }
            });
            
            socket.on('disconnect', function() {
                console.log('disconnect')
                delete users[user['user']];
            });
        }
    });
}
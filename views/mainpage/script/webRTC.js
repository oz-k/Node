
















// function webRTC(from, to, peerid) {
//     const namespace = io('/rtc');
//     const peer = new Peer();

//     //가져올 미디어스트림
//     const mediaStreamConstraints = {
//         video:true,
//     };
//     const localVideo = document.getElementById('localVideo');
//     const remoteVideo = document.getElementById('remoteVideo');

//     var dataConnection;

//     //사용자 비디오 가져오기
//     navigator.mediaDevices.getUserMedia(mediaStreamConstraints).then(function(mediaStream) {
//         socket.emit('join', {'from':from, 'to':to, 'id':peerid, 'webcam':true});
//         localVideo.srcObject = mediaStream;

//         peer.on('call', function(call) { //상대가 전화를 시도할 때 발생하는 이벤트
//             dataConnection = call;
//             call.answer(mediaStream); //전화를 수락하고 자신의 미디어스트림을 보냄
//             call.on('stream', function(userVideoStream) {
//                 remoteVideo.srcObject = userVideoStream;
//             });
//         });

//         socket.on('close', function() {
//             dataConnection.close();
//         });

//         socket.on('peer', function(userId) { //내가아닌 다른 사용자 접속 시 발생하는 이벤트
//             const call = peer.call(userId, mediaStream); //id로 지정된 원격피어를 호출하고 미디어 연결을 반환
//             dataConnection = call;
//             call.on('stream', function(userVideoStream) { //원격 피어가 스트림을 추가할 때 발생하는 이벤트
//                 remoteVideo.srcObject = userVideoStream;
//             });
//         });
//     }).catch(function(err) {
//         console.log('navigator.getUserMedia error :', err);
//         socket.emit('join', {'from':from, 'to':to, 'id':peerid, 'webcam':false});
//         peer.on('call', function(call) {
//             dataConnection = call;
//             call.answer();
//             call.on('stream', function(userVideoStream) {
//                 remoteVideo.srcObject = userVideoStream;
//             });
//         });
        
//         socket.on('close', function() {
//             dataConnection.close();
//         });
//     });
// }
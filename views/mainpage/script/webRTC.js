function webRTC(toId) {
    const namespace = io('/rtc');
    const localVideo = document.getElementById('localVideo');
    const localDisplay = document.getElementById('localDisplay');
    const remoteVideo = document.getElementById('remoteVideo');
    const remoteDisplay = document.getElementById('remoteDisplay');
    const remoteAudio = document.getElementById('remoteAudio');
    var audioList = [];
    var videoList = [];

    var config = ({
        configuration: {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        },
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })
    var peerConnection = new RTCPeerConnection(config);
    var peerConnectionDisplay = new RTCPeerConnection(config);

    //getUserMedia
    var deviceConfig = {
        audio:false,
        video:false
    };

    //빈 오디오스트림 생성
    function dummyAudioStream() {
        let ctx = new AudioContext(), oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        return Object.assign(dst.stream.getAudioTracks()[0], {enabled:false});
    }
    //빈 비디오스트림 생성
    function dummyVideoStream({width=640, height=360} = {}) {
        let canvas = Object.assign(document.createElement('canvas'), {width, height});
        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], {enabled:false});
    }
    
    function init() {
        var audioStream = new MediaStream([dummyAudioStream()]);
        peerConnection.addTrack(audioStream.getTracks()[0], audioStream);
        peerConnectionDisplay.addTrack(audioStream.getTracks()[0], audioStream);

        var videoStream = new MediaStream([dummyVideoStream()]);
        peerConnection.addTrack(videoStream.getTracks()[0], videoStream);
        peerConnectionDisplay.addTrack(videoStream.getTracks()[0], videoStream);
        //사용가능한 device 검색
        navigator.mediaDevices.enumerateDevices().then(function(deviceInfos) {
            //device 분류
            deviceInfos.forEach(function(deviceInfo) {
                if(deviceInfo.kind === 'audioinput') audioList.push(deviceInfo);
                else if(deviceInfo.kind === 'videoinput') videoList.push(deviceInfo);
            });
        }).then(function() {
            if(audioList.length > 0) {
                navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream) {
                    Promise.all(peerConnection.getSenders().map(function(sender) {
                        return sender.replaceTrack(stream.getTracks()[0]);
                    }))
                })
            } else {
                document.getElementById('mute').disabled = true; //마이크없으면 음소거버튼 비활성화
            }
            if(videoList.length === 0) {
                document.getElementById('video').disabled = true; //캠없으면 캠켜기버튼 비활성화
            }
        });

        namespace.emit('join', toId);
    }
    
    //addEvent
    document.getElementById('video').addEventListener('click', function() {
        navigator.mediaDevices.getUserMedia({video:{width:1280, height:720}}).then(function(stream) {
            localVideo.srcObject = stream;

            Promise.all(peerConnection.getSenders().map(function(sender) { //나의 모든 RTCRtpSender 가져옴
                return sender.replaceTrack(stream.getTracks()[0]); //상대가 사용중인 동일한타입의 트랙을 매개변수의 트랙으로 바꿈
            }));
        })
    });
    document.getElementById('display').addEventListener('click', function() {
        navigator.mediaDevices.getDisplayMedia().then(function(stream) {
            localDisplay.srcObject = stream;

            Promise.all(peerConnectionDisplay.getSenders().map(function(sender) {
                return sender.replaceTrack(stream.getTracks()[0]);
            }))
        })
    });
    document.getElementById('mute').addEventListener('click', function() {
        Promise.all(peerConnection.getSenders().map(function(sender) {
            return sender.replaceTrack(new MediaStream([dummyAudioStream()]).getTracks()[0]);
        }))
    });
    document.getElementById('hangup').addEventListener('click', function() {
        peerConnection.close();
        peerConnectionDisplay.close();
    });

    //상대의 track이 발견될때마다
    peerConnection.ontrack = function(event) {
        if(event.track.kind === 'audio') {
            console.log('audio');
            remoteAudio.srcObject = new MediaStream([event.track]);
        } else if(event.track.kind === 'video') {
            console.log('video');
            remoteVideo.srcObject = new MediaStream([event.track]);
        }
    };
    peerConnectionDisplay.ontrack = function(event) {
        if(event.track.kind === 'audio') {
            console.log('audio');
            remoteDisplay.srcObject = new MediaStream([event.track]);
        } else if(event.track.kind === 'video') {
            console.log('video');
            remoteDisplay.srcObject = new MediaStream([event.track]);
        }
    };

    //candidate 후보자 발견
    peerConnection.onicecandidate = function(event) {
        console.log('onicecandidate :', event);
        if(event.candidate) {
            namespace.emit('sendSignal', {type:'candidate', id:toId, candidate:event.candidate, pc:'video'});
        }
    };
    peerConnectionDisplay.onicecandidate = function(event) {
        console.log('onicecandidate :', event);
        if(event.candidate) {
            namespace.emit('sendSignal', {type:'candidate', id:toId, candidate:event.candidate, pc:'display'})
        }
    };

    //candidate 상태
    peerConnection.oniceconnectionstatechange = function(event) {
        console.log('iceConnectionState:', peerConnection.iceConnectionState);
    }

    //연결상태
    peerConnection.onconnectionstatechange = function(event) {
        console.log('connectionState:', this.connectionState)
    }

    //재협상이 필요할때 호출
    peerConnection.onnegotiationneeded = function(event) {
        console.log('onnegotiationeeded');
    }

    //시그널링
    namespace.on('signaling', function(signal) {
        if(signal.type === 'sendOffer') {
            peerConnection.createOffer().then(function(sdp) { //offer 생성
                console.log('createOffer');
                return peerConnection.setLocalDescription(sdp); //내 sdp 설정
            }).then(function() {
                namespace.emit('sendSignal', {type:'offer', id:toId, sdp:peerConnection.localDescription, pc:'video'});
            }).catch(function(err) {
                if(err) console.log('createOfferErr :', err);
            });
            peerConnectionDisplay.createOffer().then(function(sdp) { //offer 생성
                console.log('createOffer');
                return peerConnectionDisplay.setLocalDescription(sdp); //내 sdp 설정
            }).then(function() {
                namespace.emit('sendSignal', {type:'offer', id:toId, sdp:peerConnectionDisplay.localDescription, pc:'display'});
            }).catch(function(err) {
                if(err) console.log('createOfferErr :', err);
            });
        } else if(signal.type === 'sendAnswer') { //응답 보내기
            if(signal.pc === 'video') {
                peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)); //상대 sdp 세팅
                peerConnection.createAnswer().then(function(sdp) {
                    console.log('sendanswer');
                    return peerConnection.setLocalDescription(sdp); //내 sdp 설정
                }).then(function() {
                    namespace.emit('sendSignal', {type:'answer', id:toId, sdp:peerConnection.localDescription, pc:'video'});
                }).catch(function(err) {
                    if(err) console.log('craeteAnswerErr :', err);
                });
            } else if(signal.pc === 'display') {
                peerConnectionDisplay.setRemoteDescription(new RTCSessionDescription(signal.sdp)); //상대 sdp 세팅
                peerConnectionDisplay.createAnswer().then(function(sdp) {
                    console.log('sendanswer');
                    return peerConnectionDisplay.setLocalDescription(sdp); //내 sdp 설정
                }).then(function() {
                    namespace.emit('sendSignal', {type:'answer', id:toId, sdp:peerConnectionDisplay.localDescription, pc:'display'});
                }).catch(function(err) {
                    if(err) console.log('craeteAnswerErr :', err);
                });
            }
        } else if(signal.type === 'bringAnswer') { //응답 받기
            console.log('bringanswer')
            if(signal.pc === 'video') peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)); //상대 sdp 세팅
            else if(signal.pc === 'display') peerConnectionDisplay.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        } else if(signal.type === 'candidate') { //candidate 설정
            console.log('candidate', signal.candidate);
            if(signal.pc === 'video') peerConnection.addIceCandidate(signal.candidate);
            else if(signal.pc === 'display') peerConnectionDisplay.addIceCandidate(signal.candidate);
        }
    });

    navigator.mediaDevices.ondevicechange = findInputDevice;
    function findInputDevice(device) {
        navigator.mediaDevices.enumerateDevices().then(function(deviceInfos) {
            var devices = [];

            //필요한 디바이스 분류
            deviceInfos.forEach(function(deviceInfo) {
                if(deviceInfo.kind === device) devices.push(deviceInfo.label);
            });

            // appendDevice(audios, 'audioinput');
            // appendDevice(videos, 'videoinput');

            //사용가능한 디바이스 체크
            if(devices.length != 0) {
                if(device === 'audioinput') deviceConfig['audio'] = true;
                if(device === 'videoinput') deviceConfig['video'] = true;
                device['audio'] = true;
            }

            if(device['audio']||device['video']) {
                navigator.mediaDevices.getUserMedia(device).then(function(stream) {
                    localVideo.srcObject = stream;
                    stream.getTracks().forEach(function(track) {
                        console.log('addTrack', track, stream);
                        peerConnection.addTrack(track, stream);
                    });
                    namespace.emit('join', toId);
                }).catch(function(err) {console.log(err)});
            } else {
                //mediaDevice가 없을경우를 대비해 의미없는 dataChannel 생성(icecandidate)
                peerConnection.createDataChannel('null');
                namespace.emit('join', toId);
            }
        })
    };

    //디바이스 리스트 추가
    function appendDevice(devices, type) {
        if(document.querySelector(`#${type} p`)) {
            document.getElementById('deviceList').removeChild(document.getElementById(type));
        }
        var div = document.createElement('div');
        div.setAttribute('id', type);
        for(i in devices) {
            var p = document.createElement('p');
            p.innerText = devices[i];
            div.appendChild(p);
        }
        document.getElementById('deviceList').appendChild(div);
    }

    init();
    // findInputDevice('audioinput');
}

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
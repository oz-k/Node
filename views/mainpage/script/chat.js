function chat(myName) {
    var chatList = [];
    const namespace = io('/chat');
    var buttons = document.querySelectorAll('#chat button')
    for(button in buttons) {
        buttons[button].onclick = function(event) {
            init(event.target.id, event.target.previousSibling.innerText);
        }
    }

    //채팅창 생성
    function createChat(id, name) {
        //채팅창 div
        var mainDiv = document.createElement('div');
        mainDiv.setAttribute('id', id);
        var height = 300;
        mainDiv.style.border = '1px solid black'
        mainDiv.style.height = height+'px';
        mainDiv.style.position = 'fixed';
        mainDiv.style.bottom = 30-height+'px';
        mainDiv.style.left = (chatList.length-1)*280+'px';

        //head div
        var div = document.createElement('div');
        div.setAttribute('id', 'head');

        //이름 span
        var span = document.createElement('span');
        span.innerText = name;
        div.appendChild(span);

        //버튼 div
        var buttonDiv = document.createElement('div');
        buttonDiv.style.display = 'flex';
        buttonDiv.style.alignItems = 'center';
        //웹캠 img
        var webcam = document.createElement('img');
        webcam.src = './image/cam.png';
        webcam.style.width = '20px';
        webcam.style.height = '20px';
        webcam.style.marginRight = '10px';
        //영상통화
        webcam.onclick = function(event) {
            event.stopPropagation();
            //webRTC.js
            webRTC(id);
        }
        //닫기버튼 img
        var close = document.createElement('img');
        close.src = './image/close.png';
        close.style.width = '20px';
        close.style.height = '20px';
        
        //채팅창 지우기
        close.onclick = function(event) {
            event.stopPropagation();
            var index = chatList.indexOf(event.target.parentNode.parentNode.parentNode.id);
            chatList.splice(index, 1);
            document.getElementById('chatList').removeChild(document.querySelectorAll('#chatList > div')[index]);
            
            for(let i = index; i < chatList.length; i++) {
                document.querySelector('#chatList > #'+chatList[i]).style.left = i*280+'px';
            }
        }
        buttonDiv.appendChild(webcam);
        buttonDiv.appendChild(close);
        div.appendChild(buttonDiv);

        //채팅창 접기/펼치기
        div.onclick = function(event) {
            if(parseInt(event.target.parentNode.style.bottom, 10) < 0) {
                event.target.parentNode.style.bottom = '0';
            } else {
                event.target.parentNode.style.bottom = '-270px';
            }
        }
        mainDiv.appendChild(div);

        //채팅로그 div
        div = document.createElement('div');
        div.setAttribute('id', 'chatArea');
        div.style.height = (height-60)+'px';
        mainDiv.appendChild(div);

        //foot div
        div = document.createElement('div');
        div.setAttribute('id', 'foot');
        //텍스트필드
        var text = document.createElement('input');
        text.setAttribute('type', 'text');

        //엔터전송
        text.addEventListener('keyup', function(event) {
            if(event.keyCode === 13) {
                event.preventDefault();
                event.target.parentNode.lastChild.click();
            }
        });

        div.appendChild(text);
        //이미지전송 버튼
        var label = document.createElement('label');
        label.onclick = function(event) {
            event.target.nextSibling.click();
        };
        label.setAttribute('id', 'imageLabel');
        div.appendChild(label);
        var image = document.createElement('input');
        image.setAttribute('id', 'image');
        image.setAttribute('accept', '.jpeg, .png, .jpg');
        image.setAttribute('type', 'file');
        image.style.display = 'none';

        //이미지 전송
        image.addEventListener('change', function(event) {
            var toId = event.target.parentNode.parentNode.id;
            var toName = event.target.parentNode.parentNode.firstChild.firstChild.innerText;

            var img = event.target.files;
            var reader = new FileReader();
            reader.onload = function(event_) {
                var bin = event_.target.result;
                namespace.emit('sendMsg', {'type':'img', 'to':toId, 'msg':btoa(bin)});
                var node = document.createElement('img');
                node.setAttribute('src', 'data:image/png;base64,'+btoa(bin));
                var div = document.createElement('div');
                div.setAttribute("style", "text-align:right;");
                div.innerText = document.getElementById('name').innerText+" : ";
                div.appendChild(node);
                event.target.parentNode.parentNode.childNodes[1].appendChild(div);
                event.target.parentNode.parentNode.childNodes[1].scrollTop = event.target.parentNode.parentNode.childNodes[1].scrollHeight;
            }
            reader.readAsBinaryString(img[0]);
            createChatHistory(undefined, myName, toId, toName, undefined, 'img');
        })

        div.appendChild(image);
        label = document.createElement('label');
        label.onclick = function(event) {
            event.target.nextSibling.click();
        };
        label.setAttribute('id', 'sendLabel');
        div.appendChild(label);
        //텍스트전송 버튼
        var send = document.createElement('button');
        send.style.display = 'none';
        send.setAttribute('id', 'send');
        send.setAttribute('type', 'button');

        //텍스트 전송
        send.onclick = function(event) {
            var toId = event.target.parentNode.parentNode.id;
            var toName = event.target.parentNode.parentNode.firstChild.firstChild.innerText;

            var msg = event.target.parentNode.firstChild.value;
            if(msg) {
                namespace.emit('sendMsg', {'type':'msg', 'to':toId, 'msg':msg})

                putChat({'id':event.target.parentNode.parentNode.id, 'name':$('#name')[0].innerText, 'msg':msg, 'type':'msg', 'right':true});
            }
            event.target.parentNode.firstChild.value = "";
            event.target.parentNode.firstChild.focus();
            createChatHistory(undefined, myName, toId, toName, msg, 'msg')
        }

        div.appendChild(send);
        mainDiv.appendChild(div);
        document.getElementById('chatList').appendChild(mainDiv);
    }

    //채팅창 생성 후 채팅로그 가져오기
    function init(id, name) {
        //해당 채팅창이 존재하지 않고 채팅창의 개수가 4개 미만일 때
        if(!(chatList.includes(id)) && chatList.length < 4) {
            chatList.push(id);
            createChat(id, name);
            namespace.emit('getChatLog', id);
        }
    }

    //채팅 삽입
    function putChat(data) {
        if($(`#chatList #${data.id} #chatArea`)[0]) {
            var div = document.createElement('div');
            var img = document.createElement('img');

            if(data.right === true) {
                div.setAttribute('style', 'text-align:right;');
            }
            if(data.type === 'msg') {
                div.innerText = data.name+" : "+data.msg;
            } else if(data.type === 'img') {
                img.setAttribute('src', 'data:image/png;base64,'+data.msg);
                div.innerText = data.name+" : ";
                div.appendChild(img);
            }
            
            $(`#${data.id} #chatArea`)[0].appendChild(div);
            $(`#${data.id} #chatArea`)[0].scrollTop = $(`#${data.id} #chatArea`)[0].scrollHeight;
        }
    }

    //메세지 받기
    namespace.on('bringMsg', async function(msg) {
        putChat({'id':msg.from, 'name':msg.name, 'msg':msg.msg, 'type':msg.type, 'right':false});
        createChatHistory(msg.from, msg.name, undefined, $('#name')[0].innerText, msg.msg, msg.type);
    });

    //채팅목록 삽입
    function createChatHistory(fromId, fromName, toId, toName, message, type) {
        var div = document.createElement('div');
        var name = document.createElement('p');
        var msg = document.createElement('p');
        var id;

        if(myName === fromName) {
            id = toId;
            name.innerText = toName;
        } else {
            id = fromId;
            name.innerText = fromName;
        }
        div.setAttribute('id', id);

        //이미 존재하는 상대면 지우기
        for(var i=0; i<$(`#chatBox div`).length; i++) {
            if($(`#chatBox div`)[i].firstChild.textContent === name.innerText) {
                $('#chatBox')[0].removeChild($(`#chatBox div`)[i]);
            }
        }

        if($(`#chatBox div`)) {
            var user;
            if(id === fromId) {
                user = name.innerText;
            } else {
                user = '나';
            }
            if(type === 'msg') {
                msg.innerText = user+': '+message;
            } else {
                msg.innerText = user+': '+'이미지';
            }
            
            div.appendChild(name);
            div.appendChild(msg);
            div.addEventListener('click', function(event) {
                init(id, name.innerText);
                $(`#chatList #${id}`)[0].style.bottom = 0;
            })
            document.getElementById('chatBox').prepend(div);
        }
    }

    //채팅기록 삽입
    namespace.on('setChatLog', function(chatLog, id) {
        for(var i=0; i<chatLog.length; i++) {
            if(chatLog) {
                var name;
                var right;

                //상대가 보낸 경우
                if(chatLog[i].toId === id) {
                    right = true;
                    name = myName;
                } else {
                    right = false;
                    name = $(`#chatBox #${id}`)[0].firstChild.innerText;
                }

                putChat({'id':id, 'name':name, 'msg':chatLog[i].msg, 'type':chatLog[i].type, 'right':right});
            }
        }
    });

    //채팅목록 받아오기
    namespace.on('setChatHistory', function(chatHistory) {  
        for(var i=0; i<chatHistory.length; i++) {
            createChatHistory(chatHistory[i].fromId, chatHistory[i].fromName, chatHistory[i].toId, chatHistory[i].toName, chatHistory[i].msg, chatHistory[i].type);
        }
    });

    //채팅목록 숨기기
    document.getElementById('showChat').addEventListener('click', showChat);
    function showChat(event) {
        event.stopPropagation();
        var visibility;

        if($('#chatBox')[0].style.visibility === 'hidden') {
            visibility = 'visible';
        } else {
            visibility = 'hidden';
        }
        $('#chatBox')[0].style.visibility = visibility;
        $('#chatBox')[0].focus();
    }
    window.addEventListener('click', function(event) {
        if(!document.getElementById('chatBox').contains(event.target)) {
            $('#chatBox')[0].style.visibility = 'hidden';
        }
    });
}
let $ = require('jquery');

const W3CWebSocket = require('node').w3cwebsocket;
let client = null;

$(document).ready(function () {
    let userName = undefined;
    $(".sendServerInfo").click(function connectUrl() {
        let address = document.querySelector(".address").value;
        let port = document.querySelector(".port").value;
        let chatServer = `ws://${address}:${port}`;
        client = new W3CWebSocket(chatServer);

        console.log("connected");

        client.onmessage = (data) => {
            let messageFromServer = JSON.parse(data.data);
            console.log('서버로부터 메시지 받음' + messageFromServer.type)
            console.log(messageFromServer);

            if (messageFromServer.type == "automaticallyGeneratedId") {
                if (messageFromServer.isUserName) {
                    userName = messageFromServer.id;
                }
                alert(`${messageFromServer.id}가 접속했습니다.`);
                return;
            } else if (messageFromServer.type == "disconnected") {
                alert(`${messageFromServer.id}가 나갔습니다.`);
                return;
            } else if (messageFromServer.type == "setUserId") {
                if (!messageFromServer.notChanged) {
                    alert(`${messageFromServer.originalId}가 ${messageFromServer.id}로 바꼈습니다.`)
                } else {
                    alert('다른 username을 입력하세요');
                }

                if (messageFromServer.validation) {
                    userName = messageFromServer.id;
                    console.log('validation=true: ' + userName);
                }
            } else {    //messageFromServer.type == "message"
                let chatArea = document.querySelector(".chat");
                $(".chat").append(`${messageFromServer.id}]${messageFromServer.text} \n`);
                chatArea.scrollTop(chatArea[0].scrollHeight - chatArea.height());
            }
        }
        console.log("connected2");
    });

    $(".user-name").on('keydown', function (e) {
        if (e.keyCode == 13) {
            let temporaryUserName = $(".user-name").val();
            console.log(`템포러리 유저네임: ${temporaryUserName}`);
            client.send(JSON.stringify({        //구조체를 변수에 넣지않고 구조체 자체를 한방에
                type: "setUserId",
                id: temporaryUserName,
                validation: false       //자바스크립트 특성상 없애는게 나을듯
            }))
        }
    });

    $(".message").on('keydown', function (e) {
        if (e.keyCode == 13) {
            let message = document.querySelector(".message").value;
            let msg = {
                type: "message",
                text: message,
                id: userName
            }
            client.send(JSON.stringify(msg));
            document.querySelector(".message").value="";
        }
    });

    $(".disconnect-button").click(function () {
        client.close();
        console.log('서버와의 연결 끊김2');
    })
})
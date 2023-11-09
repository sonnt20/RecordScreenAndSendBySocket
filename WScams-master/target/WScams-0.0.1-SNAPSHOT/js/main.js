/**
 *
 */
(function () {
    var video = document.querySelector('video');
    var canvas = document.querySelector('canvas');
    var img = document.querySelector('img');
    var context = canvas.getContext('2d');
    var url = "ws://localhost:8080/WScams/wsServer";
    var constraints = {
        video: true,
        audio: false
    };
    var wb;
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.srcObject = stream;
        video.play();
    }).catch(function (err) {

    });


    initWebsocket(url, null, 55000, 55000).then(function (socket) {
        console.log('socket initialized!');
        //do something with socket...
        console.log(socket)
        wb = socket;
        setInterval(main, 3000);

        //if you want to use the socket later again and assure that it is still open:
        initWebsocket(url, 5000, 55000).then(function (socket) {
            console.log(socket)
            //if socket is still open, you are using the same "socket" object here
            //if socket was closed, you are using a new opened "socket" object

        });
    }, function () {
        console.log('init of socket failed!');
    });

    console.log(" WebSocket.CONNECTING: " + WebSocket.CONNECTING)
    console.log(" WebSocket.OPEN: " + WebSocket.OPEN)
    console.log(" WebSocket.CLOSING: " + WebSocket.CLOSING)
    console.log(" WebSocket.CLOSED: " + WebSocket.CLOSED)


    function main() {
        drawCanvas();
        readCanvas();
    }

    function readCanvas() {
        var canvasData = canvas.toDataURL('image/jpeg', 1);
        // var decodeAstring = atob(canvasData.split(',')[1]);
        var decodeAstring = canvasData.replace("data:image/jpeg;base64,","");
        var charArray = [];
        for (var i = 0; i < decodeAstring.length; i++) {
            charArray.push(decodeAstring.charCodeAt(i));
        }
        wb.send(new Blob([new Uint8Array(charArray)], {
            type: 'image/jpeg'
        }));
    }

    function drawCanvas() {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    function initWebsocket(url, existingWebsocket, timeoutMs, numberOfRetries) {
        timeoutMs = timeoutMs ? timeoutMs : 1500;
        numberOfRetries = numberOfRetries ? numberOfRetries : 0;
        var hasReturned = false;
        var promise = new Promise((resolve, reject) => {
            setTimeout(function () {
                if (!hasReturned) {
                    console.info('opening websocket timed out: ' + url);
                    rejectInternal();
                }
            }, timeoutMs);
            if (!existingWebsocket || existingWebsocket.readyState != existingWebsocket.OPEN) {
                if (existingWebsocket) {
                    existingWebsocket.close();
                }
                var websocket = new WebSocket(url);
                websocket.onopen = function () {
                    if (hasReturned) {
                        websocket.close();
                    } else {
                        console.info('websocket to opened! url: ' + url);
                        wb = websocket
                        resolve(websocket);
                    }
                };
                websocket.onclose = function () {
                    console.info('websocket closed! url: ' + url);
                    rejectInternal();
                };
                websocket.onerror = function () {
                    console.info('websocket error! url: ' + url);
                    rejectInternal();
                };
                websocket.addEventListener('message', function (event) {
                    // img.src = 'data:image/jpeg;base64,' + btoa(event.data)
                    img.src = 'data:image/jpeg;base64,' + event.data
                    // img.src = window.URL.createObjectURL(event.data);
                });
            } else {
                resolve(existingWebsocket);
            }

            function rejectInternal() {
                if (numberOfRetries <= 0) {
                    reject();
                } else if (!hasReturned) {
                    hasReturned = true;
                    console.info('retrying connection to websocket! url: ' + url + ', remaining retries: ' + (numberOfRetries - 1));
                    initWebsocket(url, null, timeoutMs, numberOfRetries - 1).then(resolve, reject);
                }
            }
        });
        promise.then(function () {
            hasReturned = true;
        }, function () {
            hasReturned = true;
        });
        return promise;
    };

})();
let btn = document.querySelector(".record-btn"), ws;
// ---------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------
let img = document.querySelector('img'), url = "ws://localhost:8080/WScams/wsServer";

initWebsocket(url, null, 55000, 55000).then(function (socket) {
    console.log('socket initialized!');
    //do something with socket...
    console.log(socket)
    ws = socket;

    //if you want to use the socket later again and assure that it is still open:
    initWebsocket(url, 5000, 55000).then(function (socket) {
        console.log(socket)
        //if socket is still open, you are using the same "socket" object here
        //if socket was closed, you are using a new opened "socket" object

    });
}, function () {
    console.log('init of socket failed!');
});

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
                console.log(event)
                let url = URL.createObjectURL(event.data),
                    videoo = document.querySelector("#video2");
                videoo.src = url
                // img.src = 'data:image/jpeg;base64,' + btoa(event.data)
                // img.src = 'data:image/jpeg;base64,' + event.data
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

// ---------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------

btn.addEventListener("click", async function () {
    let stream = await navigator.mediaDevices.getDisplayMedia({
        video: true, audio: true
    });
    //needed for better browser support
    const mime = MediaRecorder.isTypeSupported("video/webm; codecs=vp9") ? "video/webm; codecs=vp9" : "video/webm"
    let mediaRecorder = new MediaRecorder(stream, {
        mimeType: mime
    })

    let chunks = []
    mediaRecorder.addEventListener('dataavailable', function (e) {
        chunks.push(e.data)
    })

    mediaRecorder.addEventListener('stop', function () {
        let blob = new Blob(chunks, {
            type: chunks[0].type
        })
        console.log(blob)
        let url = URL.createObjectURL(blob)

        let video = document.querySelector("#video1")
        video.src = url

        let a = document.createElement('a')
        a.href = url
        a.download = 'video.webm'
        a.click()

        // ws.send(new Blob([new Uint8Array(charArray)], {
        //     type: 'image/jpeg'
        // }));

        // const reader = new FileReader();
        // reader.onload = (event) => {
        //     const dataUrl = event.target.result;
        //     const [_,a, base64] = dataUrl.split(',');
        //     ws.send(base64.substring(0,1000));
        //
        // };
        // reader.readAsDataURL(blob);

        ws.send(blob);
    })
    mediaRecorder.start()
    //we have to start the recorder manually
});

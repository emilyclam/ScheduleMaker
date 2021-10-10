//let sound = new Audio(chrome.runtime.getURL("bell.wav"))


// practice
//chrome.runtime.sendMessage({greeting: "hellow"})


// when we receive a message from popup.js, start the timer (input=length)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let this_timer;
    
    this_timer = startTimer(request.time)
    
    if (request.time == 'stop') {
        console.log("stop pls")
        clearInterval(this_timer)
        // clear Interval isnt' working for some reason
    }    
    
});

// duration in seconds
function startTimer(duration) {

    let timer = duration;
    let minutes, seconds, display;

    function tick() {
        minutes = Math.floor(parseInt(timer, 10) / 60);
        seconds = parseInt(timer, 10) % 60;

        minutes = minutes < 10 ? '0'+minutes : minutes;
        seconds = seconds < 10 ? '0'+seconds : seconds;
        display = minutes + ":" + seconds;

        // reset the timer if it reaches 0?
        if (timer <= 0) {
            timer = 0
            clearInterval()
            //sound.play()

            // eventually: open the fullscreen.html window
            chrome.windows.create({
                //url: chrome.runtime.getURL("fullscreen.html"),
                //state: fullscreen
            });
        }
        else {
            timer--;
        }

        // send a message to popup.js about the new time
        // would it be better if i stored it, and then on popup.js accessed it in the storage?
        var port = chrome.runtime.connect({name: 'timer'});
        port.postMessage({time: display});
        console.log("sending time")

    }

    tick();
    return setInterval(tick, 100);
}

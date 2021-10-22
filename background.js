
// practice
//chrome.runtime.sendMessage({greeting: "hellow"})


let this_timer;

// when we receive a message from popup.js, start the timer (input=length)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.time == 'stop') {
        clearInterval(this_timer)
    }   
    else {
        this_timer = startTimer(request.time)
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
        }
        else {
            timer--;
        }

        // send a message to popup.js about the new time
        // would it be better if i stored it, and then on popup.js accessed it in the storage?
        var port = chrome.runtime.connect({name: 'timer'});
        port.postMessage({time: display});
    }

    tick();
    return setInterval(tick, 100);
}

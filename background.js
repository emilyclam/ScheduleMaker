
// practice
//chrome.runtime.sendMessage({greeting: "hellow"})


let this_timer;

// when we receive a message from popup.js, start the timer (input=length)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.time) {
        if (request.time == 'stop') {
            clearInterval(this_timer)
            // i'll have to convert this to the alarms api bc this doesn't work for long durations
        }   
        else {  // eg a time in the form 00:00
            this_timer = startTimer(request.time)
        }
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
            timer = 0;

            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {sound: 'on'})
            });

        }
        else {
            timer--;
        }

        // send a message to popup.js about the new time
        // would it be better if i stored it, and then on popup.js accessed it in the storage?
        var port = chrome.runtime.connect({name: 'timer'});
        port.postMessage({time: display});
        // rn theres a lag where the data is received, would it be better if i did outside?
        // keep a port receive here, but also have one up above

    }

    tick();
    return setInterval(tick, 100);
}

// it's enabled!
chrome.action.onClicked.addListener((tab) => {
    console.log("content script active")
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ['content.js']
    })
})

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
            // check if schedule.html is open; if it is, send the alarm there (do both)
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
    return setInterval(tick, 1000);
}

// future: update this so it's less weird
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ['content.js']
    });
});


chrome.alarms.onAlarm.addListener(function() {
    console.log("dos service worker work?")
})
/**
 * alarms won't work. what could work:
 * after the user presses start, we record Date.now()
 * and then do math to see what Date.now() should be 
 * when the timer is done. and we can use that for the timer
 * and this would solve the issue of the worker disconnecting--
 * 
 * since the end time would be saved in sync, and the timer would only
 * show the ticking of time when the popup or scheudle.html is opened
 * and when those events occur, we send a message to the bg script, which would activate it
 * 
 * so
 * 
 * - start button is clicked --> Date.now() and length (in mins) is recorded
 * - math is done to see what Date.now() will be when the alarm is done (assuming no pauses)
 * - if the alarm gets paused, that current Date.now() and length is recorded + synced
 * - when the alarm is unpaused, the math process is done again
 * - when the user is on the popup or schedule page, there will be a port open to show time --> how?
 *      - take the [awaited Date.now()] - [the current Date.now()] and /1000 to get seconds
 *      - feed those seconds into my system
 * - if the service worker is closed, how will it know when Date.now() has reached the appropriate time?
 * and if statement that checks every second whether it's at 0
 * an alarm (like the api) is made... will these still activate when the serice worker is off?
 */
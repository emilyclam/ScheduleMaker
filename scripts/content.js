const alarmSound = new Audio(chrome.runtime.getURL('../assets/bell.wav')) 
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.sound == "on") {
        alarmSound.play()
    }
    else if (request.time == 'stop') {
        alarmSound.pause();
    }
})
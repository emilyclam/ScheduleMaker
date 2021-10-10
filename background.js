// practice
//chrome.runtime.sendMessage({greeting: "hellow"})

// have a timer going


// when we receive a message from popup.js, start the timer (input=length)
// ^^ one way request


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    sendResponse({time: request.time});
    
});


// when popup.js asks for the time, we send it back ()
// when will popup.js need the time? every second? that'll be easiest
// ^^ open connection (port?)
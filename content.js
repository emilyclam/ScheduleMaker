const sound = new Audio("bell.wav")
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.sound == "on") {
        alert("gogogo")
    }
})

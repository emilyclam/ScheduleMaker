const sound = new Audio(chrome.runtime.getURL('bell.wav')) 
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.sound == "on") {
        sound.play()
    }
})
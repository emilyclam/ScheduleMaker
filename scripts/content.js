const sound = new Audio(chrome.runtime.getURL('../assets/bell.wav')) 
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.sound == "on") {
        sound.play()
    }
})
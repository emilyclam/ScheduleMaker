let timer = document.getElementsByClassName('timer')[0];
let activity = document.getElementsByClassName('activity')[0];
let compBtn = document.getElementById('comp');
let incompBtn = document.getElementById('incomp');
let openSchedBtn = document.getElementById('open-schedule');


// update activity
chrome.storage.sync.get('activity', function(data) {
    activity.innerHTML = data.activity;
})

// constantly updates timer
chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((response) => {
        timer.innerHTML = response.time;
    })
})

// what happens when "done" is clicked?
compBtn.onclick = () => {
    alert("cool beans")
}

// opens the schedule editor
openSchedBtn.onclick = () => {
    chrome.windows.create({
        url: chrome.runtime.getURL("popup.html")
    })
}

let timer = document.getElementsByClassName('timer')[0];
let activity = document.getElementsByClassName('activity')[0];
let backBtn = document.getElementById('back');
let pauseBtn = document.getElementById('pause');
let nextBtn = document.getElementById('next');
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

// opens the schedule editor
openSchedBtn.onclick = () => {
    chrome.tabs.create({
        url: chrome.runtime.getURL("popup.html")
        // make this open a 
    })
}


// time-toggle buttons

// back (<<)
backBtn.onClick = () => {
    // find original length of this activity = x
    // find activity in table, find what corresponding length-cell says

    // send a message to bg script to stop that interval
    
    // send message to bg script to make a new timer of length x

    // update length-cell in table, x --> 2x
}

let paused = false

// pause/unpause (II)
pauseBtn.onclick = () => {
    function getSeconds(string) {
        let time = string.split(":")
        let min = parseInt(time[0], 10)
        let sec = parseInt(time[1], 10)
        let totalSeconds = min*60 + sec;
    
        return totalSeconds;
    }    
   
    if (paused) {
        chrome.runtime.sendMessage({time: getSeconds(timer.innerHTML)});  // tells bg script what time is shown
        paused = false
    }
    else {
        chrome.runtime.sendMessage({time: 'stop'});
        paused = true
    }  
}


// next (>>)
nextBtn.onclick = () => {
    // on table: marks current activity as complete
        // find activity; find row and toggleclass('completed-row')
        // find checkbox and toggleclass('checked')
    chrome.runtime.sendMessage({action: 'next'})

    // ends current timer (send message to bg)
    chrome.runtime.sendMessage({time: 'stop'});

    // starts next activity
}
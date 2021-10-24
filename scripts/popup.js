let timer = document.getElementsByClassName('timer')[0];
let activity = document.getElementsByClassName('activity')[0];
let backBtn = document.getElementById('back');
let pauseBtn = document.getElementById('pause');
let nextBtn = document.getElementById('next');
let openSchedBtn = document.getElementById('open-schedule');


// update activity
chrome.storage.sync.get('activity', function(data) {
    activity.innerHTML = data.activity;
});

// constantly updates timer
chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((response) => {
        timer.innerHTML = response.time;
    });
});

// opens the schedule editor
openSchedBtn.onclick = () => {
    chrome.tabs.create({
        url: chrome.runtime.getURL("../pages/schedule.html")
    });
}


// time-toggle buttons

// back (<<)
backBtn.onclick = () => {
    // send a message to bg script to stop that interval
    chrome.runtime.sendMessage({time: 'stop'});
    
    // send message to bg script to make a new timer of length x
    chrome.storage.sync.get('length', function(data) {
        chrome.runtime.sendMessage({time: data.length*60});
    });

    chrome.runtime.sendMessage({time: 'stop'});  // this doesn't work?

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
        pauseBtn.innerHTML = "I I";
        paused = false
    }
    else {
        chrome.runtime.sendMessage({time: 'stop'});
        pauseBtn.innerHTML = "►"
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
    // how do i access the next viable activity+length when schedule.js is closed??
    // i could sync each row in the table individually? but that's what i had initially tried to avoid...
}
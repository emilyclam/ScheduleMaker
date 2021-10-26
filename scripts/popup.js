/**
 * organizing:
 * people put all the functions at the top
 * and then all the event listeners at the bottom
 */

let timer = document.getElementsByClassName('timer')[0];
let activity = document.getElementsByClassName('activity')[0];
let backBtn = document.getElementById('back');
let pauseBtn = document.getElementById('pause');
let nextBtn = document.getElementById('next');
let openSchedBtn = document.getElementById('open-schedule');

let paused = false

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

        if (paused) {
            chrome.runtime.sendMessage({time: 'stop'});
        }
    });

    // update length-cell in table, x --> 2x

}


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
    chrome.runtime.sendMessage({time: 'stop'});

    chrome.storage.sync.get('tableData', (data) => {
        let d = data.tableData
        // find current activity
        // go to the next row (obj in the array) and find their activity
        for (let i = 0; i < d.length; i++) {
            if (d[i]["current"] == true) {
                d[i]["done"] = true;
                // or i can include a key for "current row", and when i'm unpacking the sync, i can update those attributes

                // also need to update current row (class)
                
                // when schedule.html become active, send message: tell it to resync
                // activity; go through dictionary to mark rows as complete
                var query = { active: true, currentWindow: true };
                function callback(tabs) {
                    var currentTab = tabs[0];
                    if (currentTab.title == "Schedule Maker") {
                        chrome.runtime.sendMessage({table: 'resync'});
                    }
                }
                chrome.tabs.query(query, callback);
                
                if (i == d.length-1) {
                    alert("yay! no more items in schedule!");
                }
                else {
                    // this stops if the row below it is completed (even if there are uncompleted rows below that)
                    if (!d[i+1]["done"]) {
                        activity.innerHTML = d[i+1]["activity"]
                        let length = d[i+1]["length"]
                        chrome.storage.sync.set({'activity': activity.innerHTML});
                        chrome.storage.sync.set({'length': length})
                        chrome.runtime.sendMessage({'time': length*60})
                        d[i]["current"] = false;
                        d[i+1]["current"] = true;

                        break;
                    }
                   
                    
                }
            }
        }
        chrome.storage.sync.set({'tableData': d})
    
    })

}
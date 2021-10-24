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



// i want to check what the current tab, and if it is schedule.html


// time-toggle buttons

// back (<<)
backBtn.onclick = () => {
    // send a message to bg script to stop that interval
    chrome.runtime.sendMessage({time: 'stop'});
    
    // send message to bg script to make a new timer of length x
    chrome.storage.sync.get('length', function(data) {
        chrome.runtime.sendMessage({time: data.length*60});
    });

    chrome.runtime.sendMessage({time: 'stop'});

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
            if (d[i]["activity"] == activity.innerHTML) {
                d[i]["done"] = true;

                // also need to update current row (class)
                
                // when schedule.html become active, send message: tell it to resync
                // activity; go through dictionary to mark rows as complete
                
                // this doesn't work... maybe i need to add an event listener
                // it only works when the current tab is scheduleMaker at the same time the next button is clicked
                var query = { active: true, currentWindow: true };
                function callback(tabs) {
                    var currentTab = tabs[0];
                    if (currentTab.title == "Schedule Maker") {
                        chrome.runtime.sendMessage({table: 'resync'});
                    }
                }
                chrome.tabs.query(query, callback);
                chrome.storage.sync.set({'tableData': d})
                
                if (i == d.length-1) {
                    alert("yay! no more items in schedule!");
                }
                else {
                    // should i update it so it shows the row as complete?
                    if (!d[i+1]["done"]) {
                        activity.innerHTML = d[i+1]["activity"]
                        let length = d[i+1]["length"]
                        chrome.storage.sync.set({'activity': activity.innerHTML});
                        chrome.storage.sync.set({'test2': d})
                        chrome.runtime.sendMessage({'time': length*60})

                        
                        break;
                    }
                   
                    
                }
            }
        }
    
    })

}
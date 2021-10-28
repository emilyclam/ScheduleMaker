/**
 * organizing:
 * people put all the functions at the top
 * and then all the event listeners at the bottom
 */

let timer = document.getElementsByClassName('timer')[0];
let activity = document.getElementsByClassName('activity')[0];
let pauseBtn = document.getElementById('pause');
let nextBtn = document.getElementById('next');
let openSchedBtn = document.getElementById('open-schedule');

let paused = false

// update activity


let thisRow;
chrome.storage.sync.get('tableData', function(data) {
    thisRow = data.tableData.find(row => row["current"] == true);
    if (thisRow) {
            activity.innerHTML = thisRow["activity"];

    }
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
document.getElementById('back').onclick = () => {
    // send a message to bg script to stop that interval
    chrome.runtime.sendMessage({time: 'stop'});
    
    // send message to bg script to make a new timer of length x
    chrome.runtime.sendMessage({time: thisRow["length"]*60});

    if (paused) {
        chrome.runtime.sendMessage({time: 'stop'});
    }


    // update length-cell in table, x --> 2x

}


// pause/unpause (II)
pauseBtn.onclick = () => {
    // i can also make this global so i don't have to redefine it in schedule.js
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

                // if schedule.html is currently open, send a message to tell it to resync
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


// experimenting with alarms
let tester = chrome.alarms.create("tester", {when: Date.now() + 90000})
// 90,000 = 15 min

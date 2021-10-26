/**
 * ISSUES
 * X input cell for length is too long
 * X input doesnn't save after you press the "new" button
 * X how to save input in general?
 * X check boxes don't work after the "new" button
 * 
 * 
 * TO DO
 * - the first start time is manually set by the user
 * X automatically calculate all start times
 * X make it so you can only input numbers in the input field
 * X it may be easier to just make it military time
 * X start button: in order for it to work, all inputs must be filled out
 * X when you press the button, it toggles it so it says pause and the color stays light green
 * X the activity/data from that row move to the bar at the top
 * X find out how to have a count down timer!
 * X when you press the checkbox for the row, the whole row's opacity goes to 50% or som
 * X ISSUE: when the start button is pressed more than once, it freaks out (instead of pausing)
 * X when the start button doesn't have the class .checked, remove the set interval but save the time
 * X how do i make the values save? after the user exits out of the popup, all the data disappears
 * X make the timer run in the background (script)
 * X the info on the timer saves when you close an come back
 * X ui/ux = what happens when the timer reaches 0?
 * X---> alarm sounds!
 * X how can i make all values automatically save once you press new? (so you don't have to press enter everytime)
 * X add in the "dashboard" in the beginning.
 * 
 * X pausing the alarm: cancel the current alarm, and when you unpause, just start a new alarm
 * X when alarm = 0: can i stop the countdown from the background timer?
 * X popup.js: in order to stop the alarm, you press one of the controls buttons
 *  X back --> resets that assignment (same length)
 *      - on schedule.js, it doesn't create a new assignment, it just changes the length?
 *  X pause --> stops the alarm, and timer sits at 0
 *  X next --> starts timer on next assignment
 *      X pressing this also marks it complete on the schedule table
 * X get the audio alarm working 
 * 
 * - make the items moveable!
 * - start time of the first item is the current time (when you first press start)
 * X make a save button (sync the table)
 * X fix the button style + transitions in schedule.html
 * - timer only runs in mins and secs... fix it so 90min --> 1 hour and 30 min!
 * - add a "total time" counter at the bottom (hour and mins!)
 * 
 * 
 * BUGS
 * - deciding nex row when (>>) is pressed (rn it only work if the next viable row is directly below)
        - if you complete them out of order, move the rows around so that they are back in order
        - what would happen to start time?
 * X if you edit a row after you press start, and then hit (>>), the changes won't go through
 *      X implement a save button
 * - alarm sound is very finnicky... it only works if it's a new page (you opened it after the timer started) and if you've clicked on it
 * - switch from setInterval() to the alarms api (the service worker becomes inactive after long periods of time)
 * X back button the length doesn't update
 *      X if you press the back button when the timer is ucrrently paused, the paused button no longer works
 * - next button -- if you use the start btn on schedule.html to pause, the "next" btn on popup stops working
 * - if you use schedule's "start" btn to pause and then unpause, the current row gets unselected (toggled) -- but the length of the time updats
 * 
 * LATER
 * - user is able to choose the sound of the alarm 
 * - work on incorporating eye breaks! (automatically create a row; if an activity is long enough, it's ok to
 * break that into two rows with the break row in between?)
 * - able to delete items
 * - standardize the sync? (rn i have the large dictionary and i also have seperate "activity", "length", etc)
 * 
 * icon attribution:
 * <div>Icons made by <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">Smashicons</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
*/

let sound = new Audio(chrome.runtime.getURL("../assets/bell.wav"))
// i'll need sound later-- if alarm goes off while the current tab is schedule.js, i'll invoke the alarm in here

let go_btn = document.getElementsByClassName("start_stop")[0];
let curr_clock = document.getElementsByClassName("clock")[0];  // clock on top bar
let curr_act = document.getElementsByClassName("activity")[0];  // activity on top bar

const defaultRow = "<tr class='row'><td><button class='check-box'></button></td><td class='start-cell'>2:15</td><td><input class='activity-cell'></td><td><input class='length-cell' type='number' min='1' value='1'></td></tr>";
const defaultSchedule = "<tr><th>done?</th><th>Start</th><th>Activity</th><th id='len'>length (min)</th></tr>" + defaultRow;

// main
checkBoxes()
setStarts()


/* // message sending practice
chrome.runtime.sendMessage({greeting: "hey"})
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    alert("greet " + request.greeting)
    alert("reply" + request.reply)
})*/


// get time from background script
chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((response) => {
        curr_clock.innerHTML = response.time;
    })
})


/**
 * UNPACK DATA
 * unpack all of the data in the storage and put it in the table
 * the names of all the variables will be standardized
 */

// get data table from storage
chrome.storage.sync.get('whole', function(data) {
    //document.getElementById("schedule").innerHTML = data.whole;
})

document.addEventListener("visibilitychange", function() {
    if (!document.hidden) {
        //syncTable();
    }
});

// get current activity from storage
function syncActivity() {
    chrome.storage.sync.get('activity', function(data) {
        document.getElementsByClassName('activity')[0].innerHTML = data.activity;
    });
}


function syncTable() {
    syncActivity();
    
    // go through rows, compare with  and add "completed-row"
    let rows = document.getElementsByClassName('row');
    chrome.storage.sync.get('tableData', (data) => {
        for (let i = 0; i < rows.length; i++) {
            if (data.tableData[i]["done"]) {
                if (!rows[i].classList.contains("completed-row")) {
                    markComplete(rows[i]);
                }
            }
            console.log(data.tableData[0])
            if (data.tableData[i]["current"]) {
                console.log(i);
                rows[i].classList.add("current-row");
            }
            else {
                rows[i].classList.remove("current-row");

            }
        }
    })
}

syncActivity();


// resynching the contents of the table
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.table == "resync") {
        syncTable();
    }
})


/*
* "NEW" BUTTON
*/
document.getElementById("new").addEventListener('click', () => {

    let rows = document.getElementsByClassName("row")
    rows[rows.length-1].insertAdjacentHTML('afterend', defaultRow); 
    checkBoxes()
    setStarts()
    
    chrome.storage.sync.set({'whole': document.getElementById("schedule").innerHTML})
});




/**
 * CALCULATE START TIMES
 */

/**
 * the original start time must be manually set by the user
 */

// function that takes in seconds and outputs the 00:00 notation (in a string)
function timeNotation(s) {
    let time = s;
    let minutes = Math.floor(time/60)
    let seconds = time % 60

    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    return minutes + ":" + seconds;
}

// in: timeNotation, out: total time in seconds
function getSeconds(string) {
    let time = string.split(":")
    let min = parseInt(time[0], 10)
    let sec = parseInt(time[1], 10)
    let totalSeconds = min*60 + sec;

    return totalSeconds;
}

function setStarts() {
    function setStart(start, length) {  // length in minutes
        time = start.split(":")
        hour = parseInt(time[0], 10)
        min = parseInt(time[1], 10)
        
        min += length
        hour += Math.floor(min/60)
        min = min % 60
        time = hour + ":" + min
    
        if (min < 10) {
            min = '0' + min
            time = hour + ":" + min
        }
        return time
    }
    
    let lengths = document.getElementsByClassName("length-cell")
    let starts = document.getElementsByClassName("start-cell")
    for (let i=0; i < lengths.length-1; i++) {
        let s_cell = starts[i].innerHTML
        let l_cell = parseInt(lengths[i].value)
        starts[i+1].innerHTML = setStart(s_cell, l_cell)
    }   
}


/**
 * CHECK BOX
 */
// when you click on a check-box button it turns blue
// note: getElementsByClassName returns an array; but to use onclick you have giveo nly one elememt

function markComplete(row) {
    row.classList.toggle("completed-row");
    row.children[0].children[0].classList.toggle("checked");
    chrome.storage.sync.set({'whole': document.getElementById("schedule").innerHTML})
}

function checkBoxes () {
    let checkBoxes = document.getElementsByClassName("check-box")
    for (let i=0; i < checkBoxes.length; i++) {
        //checkBoxes[i].addEventListener('onclick', markComplete(checkBoxes[i].parentElement.parentElement));
        checkBoxes[i].onclick = () =>{
            markComplete(checkBoxes[i].parentElement.parentElement)
        }
    }
}


/**
 * START BUTTON
 */

function decideRow() {
    // decide what the activity is
    let rows = document.getElementsByClassName("row");

    // it'll find the first item that hasn't been checked off
    for (let i = 0; i < rows.length; i++) {
        if (!rows[i].classList.contains("completed-row")) {
            return rows[i];
        }
    }
}

// eventually i will organize all of my functions
function saveTableData() {
    let rowData = []
    let rows = document.getElementsByClassName("row");
    // have an array that holds object; each obj represents a row from the table
    for (let i = 0; i < rows.length; i++) {
        let temp = {
            "done": rows[i].children[0].children[0].classList.contains('checked'),
            "activity": rows[i].children[2].children[0].value,
            "length": rows[i].children[3].children[0].value,
            "current": rows[i].classList.contains("current-row")
        }
        rowData.push(temp);
    }
    chrome.storage.sync.set({'tableData': rowData});
    chrome.storage.sync.set({'whole': document.getElementById("schedule").innerHTML});
}

/**
 * i really want to get rid of the start button on this page, but
 * i don't know how i'd implement all these changes if i had to trigger them from the popup page
 * 
 * i could chnage it to the dictionary that's synced, and then load all those syncs...
 * also, if i can do all of this in the bg script (with the help of synching, of course) i think that'd be good/clean?
 * i don't really know...
 */
go_btn.onclick = () => {
    function updateUI(this_row) {
        // toggle the style
        go_btn.classList.toggle("running");  // start button
        this_row.classList.toggle("current-row");

        // and change the innerHTML of the bar at the top to match this_row
        let this_length = this_row.getElementsByClassName("length-cell")[0];
        curr_act.innerHTML = this_row.getElementsByClassName("activity-cell")[0].value;
        
        
        // this needs to happen any time that a new activity starts (eg NOT when an activity is unpaused)
        curr_clock.innerHTML = timeNotation(parseInt(this_length.value, 10)*60);
        
    }
    
    // pause
    if (go_btn.classList.contains('running')) {
        go_btn.classList.remove('running')
        chrome.runtime.sendMessage({time: 'stop'});  // sends a message to the bg script to pause the timer
        return;
    }
    
    let this_row = decideRow()  // this needs to happen any time a new row starts
    updateUI(this_row)
    saveTableData()
    setStarts()
    
    // it's kind of annoying that it's sent in seconds
    chrome.runtime.sendMessage({time: getSeconds(curr_clock.innerHTML)});  // tells bg script what time is shown
    chrome.storage.sync.set({'activity': curr_act.innerHTML}); // put current activity in memory
    chrome.storage.sync.set({'length' : this_row.getElementsByClassName("length-cell")[0].value})
}


/**
 * BUTTONS AT THE BOTTOM
 */

// delete button
document.getElementById("delete").onclick = () => {
    document.getElementsByClassName("confirm-delete")[0].classList.toggle("visible");
}

document.getElementsByClassName('confirm-delete')[0].onclick = () => {
        // god this is a mess and i could brute force my way through, but i really want to go an clean everything up...

    chrome.runtime.sendMessage({'time': 'stop'});
    chrome.storage.sync.set({'whole': defaultRow});
    chrome.storage.sync.set({'tableData': ''});
    chrome.storage.sync.set({'activity': ''});
    chrome.storage.sync.set({'length': 0});
    
    go_btn.classList.remove('running');
    document.getElementById('schedule').innerHTML = defaultSchedule;
    document.getElementsByClassName("confirm-delete")[0].classList.toggle("visible");
    curr_act.innerHTML = '';
    curr_clock.innerHTML = '00:00';

}

// save button
document.getElementById("save").onclick = () => {
    saveTableData();
}
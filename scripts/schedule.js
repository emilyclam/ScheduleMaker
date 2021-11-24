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
 * X add a "total time" counter at the bottom (hour and mins!)
 * X be able to delete activities?
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
 * X the rows themselves save when you refresh the page, but the values in the inputs DONT
 * - this may be part of setInterval --> Alarm, but when it is done for too long, it throws errors that make it crash?
 * X checkboxes can be finnicky... (upon refreshing it doesn't work...only works after you press "new"...)
 *      X it was bc of asynch functinos T_Ti worked around it but... i'm sure i'll have to learn how to use callbacks and promises and whatnot in the futre
 * 
 * LATER
 * - user is able to choose the sound of the alarm 
 * - work on incorporating eye breaks! (automatically create a row; if an activity is long enough, it's ok to
 * break that into two rows with the break row in between?)
 * X able to delete items
 * - standardize the sync? (rn i have the large dictionary and i also have seperate "activity", "length", etc)
 * 
 * icon attribution:
 * <div>Icons made by <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">Smashicons</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
*/

let alarmSound = new Audio(chrome.runtime.getURL("../assets/bell.wav"))
// i'll need sound later-- if alarm goes off while the current tab is schedule.js, i'll invoke the alarm in here

let go_btn = document.getElementsByClassName("start_stop")[0];
let curr_clock = document.getElementsByClassName("clock")[0];  // clock on top bar
let curr_act = document.getElementsByClassName("activity")[0];  // activity on top bar

const defaultRow = "<tr class='row'><td class='floater-col move-col'>||||</td><td><button class='check-box'></button></td><td class='start-cell'>2:15</td><td><input class='activity-cell'></td><td><input class='length-cell' type='number' min='1' value='1'></td><td class='floater-col del-col'>X</td></tr>";

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


// automatically synches the entire table when schedule.html is opened
document.addEventListener('DOMContentLoaded', () => {
    syncTable();
});


// resynching the contents of the table while user is currently on the page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.table == "resync") {
        syncTable();
    }
});

// retreives saved data and adds visual changes (text, completion, current row) to table

// i wodner if it'd be better to split this into multiple different functions? like still have this,
// but it's composed of smaller functions.
// becasue sometimes i only want to save one thing (checkboxes; inputs) but i have to call the entire function...
function syncTable() { 
    // get's the structure of the table + the non input values
    let rows;
    chrome.storage.sync.get('whole', function(data) {
        document.getElementsByTagName('tbody')[0].innerHTML = data.whole;
        
        // these have to be here, bc they have to be after the DOM loads in ^
        rows = document.getElementsByClassName('row');        
        checkBoxes(rows);
        autosaveRows(rows);
        checkDelRow();
    });

    chrome.storage.sync.get('tableData', (data) => {
        for (let i = 0; i < rows.length; i++) {
            // updates the bar at the top
            rows[i].getElementsByClassName('activity-cell')[0].value = data.tableData[i]["activity"] ? data.tableData[i]["activity"] : "";
            rows[i].getElementsByClassName('length-cell')[0].value = data.tableData[i]["length"];

            // marks rows complete
            if (data.tableData[i]["done"]) {
                if (!rows[i].classList.contains("completed-row")) {
                    markComplete(rows[i]);
                }
            }

            // finds the current row and highlights it blue
            if (data.tableData[i]["current"]) {
                document.getElementsByClassName('activity')[0].innerHTML = data.tableData[i]["activity"];
                rows[i].classList.add("current-row");
            }
            else {
                rows[i].classList.remove("current-row");

            }
        }

        // this has to be here bc it has to occur after tableData is saved
        calcCompletion();
    })
}

// saves the data into storage
function saveTableData() {
    let rowData = []
    let rows = document.getElementsByClassName("row");
    // have an array that holds object; each obj represents a row from the table
    for (let i = 0; i < rows.length; i++) {
        let temp = {
            "done": rows[i].children[1].children[0].classList.contains('checked'),
            "activity": rows[i].children[3].children[0].value,
            "length": rows[i].children[4].children[0].value,
            "current": rows[i].classList.contains("current-row")
        }
        rowData.push(temp);
    }
    chrome.storage.sync.set({'tableData': rowData});
    chrome.storage.sync.set({'whole': document.getElementsByTagName('tbody')[0].innerHTML});
}


/** 
 * RING THE ALARM!
 * **/
chrome.runtime.onMessage.addListener((request, response, sendResponse) => {
    if (request.sound == 'on') {
        alarmSound.play();
        console.log("sounding alarm from schedule.js")
    }
});


/*
* "NEW" BUTTON
*/

function addRow() {
    let rows = document.getElementsByClassName("row")
    rows[rows.length-1].insertAdjacentHTML('afterend', defaultRow); 
    checkBoxes(rows);
    checkDelRow();
    setStarts();
    autosaveRows(rows);
    saveTableData();
    calcCompletion();
    
    chrome.storage.sync.set({'whole': document.getElementsByTagName('tbody')[0].innerHTML});
}

document.getElementById("new").addEventListener('click', addRow);




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

// updates the start times
function setStarts() {
    function setStart(start, length) {  // length in minutes
        time = start.split(":");
        hour = parseInt(time[0], 10);
        min = parseInt(time[1], 10);
        
        min += length;
        hour += Math.floor(min/60);
        hour %= 24;
        min = min % 60;
        time = hour + ":" + min;
    
        if (min < 10) {
            min = '0' + min;
            time = hour + ":" + min;
        }
        return time
    }
    
    let lengths = document.getElementsByClassName("length-cell");
    let starts = document.getElementsByClassName("start-cell");
    for (let i=0; i < lengths.length-1; i++) {
        let s_cell = starts[i].innerHTML;
        let l_cell = parseInt(lengths[i].value);
        starts[i+1].innerHTML = setStart(s_cell, l_cell);
    }   
}


/**
 * CHECK BOX
 */
// when you click on a check-box button it turns blue
// note: getElementsByClassName returns an array; but to use onclick you have giveo nly one elememt

function markComplete(row) {
    row.classList.toggle("completed-row");
    row.children[1].children[0].classList.toggle("checked");
    //chrome.storage.sync.set({'whole': document.getElementsByTagName('tbody')[0].innerHTML})  // do i need this?
}

// makes every checkbox clickable
function checkBoxes (rows) {
    for (let i=0; i < rows.length; i++) {
        rows[i].children[1].children[0].onclick = () => {
            markComplete(rows[i]);
            calcCompletion();
            saveTableData();
        }
    }
}


/**
 * START BUTTON
 */

// finds the first activity that isn't checked off
function decideRow() {
    let rows = document.getElementsByClassName("row");
    for (let i = 0; i < rows.length; i++) {
        if (!rows[i].classList.contains("completed-row")) {
            return rows[i];
        }
    }
}


/**
 * i really want to get rid of the start button on this page, but
 * i don't know how i'd implement all these changes if i had to trigger them from the popup page
 * 
 * i could chnage it to the dictionary that's synced, and then load all those syncs...
 * also, if i can do all of this in the bg script (with the help of synching, of course) i think that'd be good/clean?
 * i don't really know...
 */
let firstTime = true;
go_btn.onclick = () => {
    function updateUI(this_row) {
        // toggle the style
        go_btn.classList.add("running");  // start button
        this_row.classList.add("current-row");

        if (firstTime) {

        }
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
    console.log('go button go')
    
    // start
    chrome.runtime.sendMessage({time: getSeconds(curr_clock.innerHTML)});  // tells bg script what time is shown
    chrome.storage.sync.set({'activity': curr_act.innerHTML}); // put current activity in memory
    chrome.storage.sync.set({'length' : this_row.getElementsByClassName("length-cell")[0].value})
}


/**
 * ROW BUTTONS
 */

// update it so the button only shows when user is hovering over that row
// button to delete a row!
function checkDelRow() {
    let delColBtns = document.getElementsByClassName('del-col');
    for (let i = 0; i < delColBtns.length; i++) {
        delColBtns[i].onclick = () => {
            // second click --> deletes row
            if (delColBtns[i].classList.contains('del-confirm')) {
                delColBtns[i].parentElement.remove();
                setStarts();
                calcCompletion();
                saveTableData();
                checkDelRow();
            }
            // first click --> turns red (asks for confirmation)
            else
                delColBtns[i].classList.add('del-confirm');
        }
    }

    // red color/confirm goes away once you mouse out
    delColBtns = document.getElementsByClassName('del-col');
    for (let i = 0; i < delColBtns.length; i++) {
        delColBtns[i].onmouseout = () => {
            delColBtns[i].classList.remove('del-confirm');
        }
    }
}



/**
 * BUTTONS AT THE BOTTOM
 */

// get current time; outputs the string
function getCurrentTime() {
    let time = new Date();
    let h = time.getUTCHours() - time.getTimezoneOffset()/60;
    let m = time.getUTCMinutes();
    if (h < 0) {
        h += 24;
    }
    if (m < 10) {
        m = '0'+m;
    }
    return `${h}:${m}`;
}


// delete button
document.getElementById("delete").onclick = () => {
    document.getElementsByClassName("confirm-delete")[0].classList.toggle("visible");
}

document.getElementsByClassName('confirm-delete')[0].onclick = () => {
    // god this is a mess and i could brute force my way through, but i really want to go an clean everything up...
    if (document.getElementsByClassName('confirm-delete')[0].classList.contains('visible')) {
        chrome.runtime.sendMessage({'time': 'stop'});
        chrome.storage.sync.set({'whole': defaultRow});
        chrome.storage.sync.set({'tableData': ''});
        
        go_btn.classList.remove('running');
        document.getElementsByTagName('tbody')[0].innerHTML = defaultRow;
        document.getElementsByClassName("confirm-delete")[0].classList.toggle("visible");
        curr_act.innerHTML = '';
        curr_clock.innerHTML = '00:00';

        // also set the time on the first activity to the current time
        document.getElementsByClassName('start-cell')[0].innerHTML = getCurrentTime();
        calcCompletion();
    }
}

// updates the completion numbers at the bottom
let actProg = document.getElementsByClassName('completion')[0].children[1];
let timeProg = document.getElementsByClassName('completion')[0].children[2];

// WHY IS THIS LIKE THIS
function calcCompletion() {
    saveTableData();
    chrome.storage.sync.get('tableData', function(data) {
        
        let actsDone = 0;
        let totalActs = Object.keys(data.tableData).length;
        let timeDone = 0;  // in mins
        let totalTime = 0;  // in mins

        for (let i = 0; i < totalActs; i++) {
            totalTime += parseInt(data.tableData[i]["length"]);
            if (data.tableData[i]["done"]) {
                actsDone++;
                timeDone += parseInt(data.tableData[i]["length"]);
            }
        }
        actProg.innerHTML = `${actsDone}/${totalActs} activities (${Math.round(actsDone/totalActs*100)}%)`;
        timeProg.innerHTML = `${timeDone}/${totalTime} minutes (${Math.round(timeDone/totalTime*100)}%)`;        
    });
}



// save button... which doesn't serve a purpose anymore!
document.getElementById("save").onclick = () => {
    setStarts();
    saveTableData();
    calcCompletion();
}

// autosave?
function autosaveRows(rows) {
    for (let i = 0; i < rows.length; i++) {
        rows[i].onchange = () => {
            saveTableData();
        }
    }
}

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
 * - ui/ux = what happens when the timer reaches 0?
 * X---> alarm sounds!
 * X how can i make all values automatically save once you press new? (so you don't have to press enter everytime)
 * X add in the "dashboard" in the beginning.
 * - make the items moveable!
 * 
 * X pausing the alarm: cancel the current alarm, and when you unpause, just start a new alarm
 * - when alarm = 0: can i stop the countdown from the background timer?
 * - simple.js: in order to stop the alarm, you press one of the controls buttons
 *  - back --> resets that assignment (same length)
 *      - on popup.js, it doesn't create a new assignment, it just changes the length?
 *  - pause --> stops the alarm, and timer sits at 0
 *  - next --> starts timer on next assignment
 *      - in order to move on, you have to press next
 *      - pressing this also marks it complete on the schedule table
 
 * - i'm thinking of removing the "start" button from the schedule table page
 * 
 * 
 * - work on incorporating eye breaks! (automatically create a row; if an activity is long enough, it's ok to
 * break that into two rows with the break row in between?)
 * - make the hovering more satisfying:
 *      - smooth fade in/fade out
 *      - change the mouse
 * 
 * 
 * LATER
 * - right now the current bar's opacity also changes when the checkbox is chekced... figure out if i'm okay with this
 * - user is able to choose the sound of the alarm 
 * - the welcome bar --
*/

let sound = new Audio(chrome.runtime.getURL("bell.wav"))
sound.play()

let go_btn = document.getElementsByClassName("start_stop")[0];
let curr_clock = document.getElementsByClassName("clock")[0];  // clock on top bar
let curr_act = document.getElementsByClassName("activity")[0];  // activity on top bar
let first = true;

// main
checkBoxes()
setStarts()

// message sending practice

//chrome.runtime.sendMessage({greeting: "hey"})
/*
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

// get activity from storage
chrome.storage.sync.get('activity', function(data) {
    document.getElementsByClassName('activity')[0].innerHTML = data.activity;
})



/*
* "NEW" BUTTON
*/
document.getElementById("new").onclick = function() {

    let rows = document.getElementsByClassName("row")
    rows[rows.length-1].insertAdjacentHTML('afterend', "<tr class='row'><td><button class='check-box'></button></td><td class='start-cell'></td><td><input class='activity-cell'></td><td><input class='length-cell' type='number' value='0'></td></tr>") 
    checkBoxes()
    setStarts()
    
    chrome.storage.sync.set({'whole': document.getElementById("schedule").innerHTML})
}




/**
 * CALCULATE START TIMES
 */
// calculate the start times of items based on the length and start time of the previous activity

/**
 * the original start time must be manually set by the user
 * times are displayed 00:00
 * when we add minutes to them, they are disected into indivudal variables, hours and mins, and the math is done
 * when it'd plugged into the value, it's put back into string form
 * but when the time changes
 * whenver times or lengths are changed, all the start times underneath it must change...
 * 
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

function checkBoxes () {
    let checkBoxes = document.getElementsByClassName("check-box")
    for (let i=0; i < checkBoxes.length; i++) {
        document.getElementsByClassName("check-box")[i].onclick = function() {
            this.classList.toggle("checked")
            
            // the row's opacity changes
            this.parentElement.parentElement.classList.toggle("completed-row")
        }
    }
}


// after recieving message from simple.js (wil it send if popup is closed? will it backlog?),
// find the current activity's corresponding row + checkbox and mark it complete

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    alert(request.action);
    
    // if request.action is "back", send activity length (or i can just do the messaging here?) + change innerHTML
    if (request.action == 'back') {

    }

    // if request.action is "next", mark that activity as complete and [...]
    
})


/**
 * START BUTTON
 */

function decideRow() {
    // decide what the activity is
    let rows = document.getElementsByClassName("row");

    // it'll find the first item that hasn't been checked off
    for (let i = 0; i < rows.length; i++) {
        if (!rows[i].getElementsByClassName("check-box")[0].classList.contains("checked")) {
            return rows[i];
        }
    }
}

go_btn.onclick = () => {
    function updateUI(this_row) {
        // toggle the style
        go_btn.classList.toggle("running");  // start button
        this_row.classList.toggle("current-row");

        // and change the innerHTML of the bar at the top to match this_row
        let this_length = this_row.getElementsByClassName("length-cell")[0];
        curr_act.innerHTML = this_row.getElementsByClassName("activity-cell")[0].value;
        
        
        // this needs to happen any time that a new activity starts (eg NOT when an activity is unpaused)
        if (first) {
            curr_clock.innerHTML = timeNotation(parseInt(this_length.value, 10)*60);
        }
    }

    // pause
    if (go_btn.classList.contains('running')) {
        go_btn.classList.remove('running')
        chrome.runtime.sendMessage({time: 'stop'});  // sends a message to the bg script to pause the timer
        return;
    }
    
    let this_row = decideRow()  // this needs to happen any time a new row starts
    updateUI(this_row)
    
    // it's kind of annoying that it's sent in seconds
    chrome.runtime.sendMessage({time: getSeconds(curr_clock.innerHTML)});  // tells bg script what time is shown
    chrome.storage.sync.set({'activity': curr_act.innerHTML}); // put current activity in memory

    
    first = false
}


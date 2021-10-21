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
 * - when alarm = 0: can i stop the countdown from the background timer?
 * - simple.js: in order to stop the alarm, you press one of the controls buttons
 *  - back --> resets that assignment (same length)
 *      - on popup.js, it doesn't create a new assignment, it just changes the length?
 *  - pause --> stops the alarm, and timer sits at 0
 *  - next --> starts timer on next assignment
 *      - in order to move on, you have to press next
 *      - pressing this also marks it complete on the schedule table
 
 * 
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



// main
checkBoxes()
setStarts()
editCells()

// message sending practice

//chrome.runtime.sendMessage({greeting: "hey"})
/*
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    alert("greet " + request.greeting)
    alert("reply" + request.reply)
})*/

curr_clock = document.getElementsByClassName('clock')[0];


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

// data table
chrome.storage.sync.get('whole', function(data) {
    //document.getElementById("schedule").innerHTML = data.whole;
})

// activity
chrome.storage.sync.get('activity', function(data) {
    document.getElementsByClassName('activity')[0].innerHTML = data.activity;
})




let sound = new Audio(chrome.runtime.getURL("bell.wav"))
sound.play()


/*
* "NEW" BUTTON
*/
document.getElementById("new").onclick = function() {
    // saving values as placeholder
    let acts = document.getElementsByClassName('activity-cell');
    let lengths = document.getElementsByClassName('length-cell');
    console.log("hey")
    for (let i = 0; i < acts.length; i++) {
        acts[i].placeholder = acts[i].value;
        lengths[i].placeholder = lengths[i].value;
    }
    // in the future i'll get rid of all placeholder things cus i don't think it's necessary.. but i'm too lazy rn


    let rows = document.getElementsByClassName("row")
    rows[rows.length-1].insertAdjacentHTML('afterend', "<tr class='row'><td><button class='check-box'></button></td><td class='start-cell'></td><td><input class='activity-cell'></td><td><input class='length-cell' type='number' value='0'></td></tr>") 
    checkBoxes()
    setStarts()
    editCells()
    

    // i just save the data here for now, but in the future i'll have a 'save' button
    chrome.storage.sync.set({'whole': document.getElementById("schedule").innerHTML})
}



/**
 * EDITING ACTIVITY OR TIME CELLS
 */
// when you click on a td you can edit it
// future: work on a better way to save the cell.value s
function editCells() {
    let cells = document.getElementsByTagName("input")
    for (let i=0; i < cells.length; i++) {
        document.getElementsByTagName("input")[i].onclick = function() {
            // get user typing input

            // after clicking on a td, you can press enter to unfocus
            document.addEventListener('keydown', (event) => {

               if (event.key == "Enter") {
                    this.blur()
                    this.placeholder = this.value
                    // it's annoying that you ahve to press enter for the value to save...
                    // maybe whenever you press the "new" button it automaically saves everything?
                    // or in general it just automatically saves everything...
                }

            }, false)


        }
    }
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
    let lengths = document.getElementsByClassName("length-cell")
    let starts = document.getElementsByClassName("start-cell")
    for (let i=0; i < lengths.length-1; i++) {
        let s_cell = starts[i].innerHTML
        let l_cell = parseInt(lengths[i].placeholder)
        starts[i+1].innerHTML = setStart(s_cell, l_cell)
    }   
}

// !this can use some major updating?
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

    // error: starts isn't defined in this scope
    return time
    

    
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

let go_btn = document.getElementsByClassName("start_stop")[0];
let first = true


go_btn.onclick = () => {

    // save all the values in activity and length as placeholders
    let acts = document.getElementsByClassName('activity-cell');
    let lengths = document.getElementsByClassName('length-cell');
    console.log("hey")
    for (let i = 0; i < acts.length; i++) {
        acts[i].placeholder = acts[i].value;
        lengths[i].placeholder = lengths[i].value;
    }

    // pause
    if (go_btn.classList.contains('running')) {
        
        // will need to send a message to the bg script to pause the timer
        chrome.runtime.sendMessage({time: 'stop'});


        go_btn.classList.remove('running')
        chrome.storage.sync.set({'state': 'paused'})
        return;
    }

    // unpause/start
    chrome.storage.sync.set({'state': 'running'})

    // check if all inputs are filled out (value/placeholder != none)
    let cells = document.getElementsByTagName("input")
    for (let i = 0; i < cells.length; i++) {
        if (!cells[i].placeholder) {
            alert("please fill out all input cells first!");
            return;
        }
    }
    
    // find what the first activity is
    let curr_clock = document.getElementsByClassName("clock")[0];  // clock on top bar
    let curr_act = document.getElementsByClassName("activity")[0];  // activity on top bar
    let this_row = decideRow()

    // toggle the style
    go_btn.classList.toggle("running");  // start button
    this_row.classList.toggle("current-row");

    // and change the innerHTML of the bar at the top to match this_row
    let this_length = this_row.getElementsByClassName("length-cell")[0];
    curr_act.innerHTML = this_row.getElementsByClassName("activity-cell")[0].placeholder;

    // save the current activity in storage
    chrome.storage.sync.set({'activity': curr_act.innerHTML});

    if (first) {
        curr_clock.innerHTML = timeNotation(parseInt(this_length.placeholder, 10)*60);
    }


    // send a message to the bg script
    chrome.runtime.sendMessage({time: getSeconds(curr_clock.innerHTML)});

    
    first = false
}


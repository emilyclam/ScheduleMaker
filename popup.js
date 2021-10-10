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
 * - make the timer run in the background (script)
 * - ui/ux = what happens when the timer reaches 0?
 * X---> alarm sounds!
 * ---> there's a popup that covers the entire window that asks if you're done. (done or continue working). 
 * ---> if you press continue, it asks you to set another timer.
 * ---> if you press done, then it checks that box off (add .checked to it) and starts the next activity?
 * ---> also, when you press done, it records the actual length of the activity? 
 * - how can i make all values automatically save once you press new? (so you don't have to press enter everytime)
 * X add in the "dashboard" in the beginning.
 * - make the welcome bar look better
 * 
 * 
 * - work on incorporating eye breaks! (automatically create a row; if an activity is long enough, it's ok to
 * break that into two rows with the break row in between?)
 * - make the hovering more satisfying:
 *      - smooth fade in/fade out
 *      - change the mouse
 * 
 * ISSUE:
 * - pressing "new" will save all rows but the last row. the edit/save button that i plan on
 * adding will hopefully fix this
 * 
 * LATER
 * - if: in order to change something, you have to click an edit button which will than allo wyou to change the input values
 *      - so there'll be a button on the right that says edit/done
 *      - in order to make the field unedittable, set the placeholder value and then do: disabled="true"
 * - right now the current bar's opacity also changes when the checkbox is chekced... figure out if i'm okay with this
 * - user is able to choose the sound of the alarm 
*/



// main
setWelcome()
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


/**
 * UNPACK DATA
 * unpack all of the data in the storage and put it in the table
 * the names of all the variables will be standardized
 */

chrome.storage.sync.get('whole', function(data) {
    //document.getElementById("schedule").innerHTML = data.whole;
})

let sound = new Audio(chrome.runtime.getURL("bell.wav"))
sound.play()


/*
 * WELCOME BAR
 * set the current date and time
 */

// it's nice putting things in functions so i am able to reuse the same variable names for different things...
function setWelcome() {
    let date_cell = document.getElementById("date")
    let time_cell = document.getElementById("time")

    let today = new Date();
    let d = today.getDate();
    let m = today.getMonth();
    var y = today.getFullYear();
    date_cell.innerHTML = m + '/' + d + '/' + y;

    let h = today.getHours();
    let ampm = 'AM'
    if (h > 12) {
        ampm = 'PM'
        h -= 12
    }
    m = today.getMinutes()
    m = m < 10 ? '0' + m : m
    time_cell.innerHTML = h + ':' + m + ' ' + ampm
}



/*
* "NEW" BUTTON
*/
document.getElementById("new").onclick = function() {
    document.getElementById("schedule").innerHTML += "<tr class='row'><td><button class='check-box'></button></td><td class='start-cell'></td><td><input class='activity-cell'></td><td><input class='length-cell' type='number' placeholder='0'></td></tr>"
       
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
// ERROR: after pressing "NEW" none of the checkboxes work

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
 * COUNTDOWN TIMER
 */

// duration in seconds
function startTimer(duration, display) {
    let timer = duration;
    let minutes, seconds;
    function tick() {
        minutes = Math.floor(parseInt(timer, 10) / 60);
        seconds = parseInt(timer, 10) % 60;

        minutes = minutes < 10 ? '0'+minutes : minutes;
        seconds = seconds < 10 ? '0'+seconds : seconds;
        display.innerHTML = minutes + ":" + seconds;

        // reset the timer if it reaches 0?
        if (timer <= 0) {
            //timer = duration;
            timer = 0
            sound.play()
        }
        else {
            timer--;
        }

    }

    tick();
    //clearInterval(this_timer)
    return setInterval(tick, 100);
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

// idk if this will work but:
let this_timer = setInterval(function(){}, 0)
go_btn.onclick = () => {

    // pause
    if (go_btn.classList.contains('running')) {
        clearInterval(this_timer)
        go_btn.classList.remove('running')
        return;
    }

    // unpause/start

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

    // hey

    // and change the innerHTML of the bar at the top to match this_row
    let this_length = this_row.getElementsByClassName("length-cell")[0];
    curr_act.innerHTML = this_row.getElementsByClassName("activity-cell")[0].placeholder;
    if (first) {
        curr_clock.innerHTML = timeNotation(parseInt(this_length.placeholder, 10)*60);
    }





    // send a message to the bg script
    chrome.runtime.sendMessage({time: curr_clock.innerHTML}, (response) => {
        alert(response.time)
    });






    this_timer = startTimer(getSeconds(curr_clock.innerHTML), curr_clock)
    // start-cell = current time when you pressed the button
    
    first = false
}

// idk maybe later if i try to clean things up ill figure out hwo to fit this in
// time object: minutes, seconds, total seconds, time notation
class Time {
    constructor(minutes) {
        this.time = minutes*60;
        this.mins = minutes;
        this.secs = minutes*60;
        this.string = this.getTimeNotation()
    }

    tick() {
        this.time--;
    }

    getTimeNotation() {
        let m = this.mins < 10 ? '0' + this.mins : this.mins;
        let s = this.secs < 10 ? '0' + this.secs : this.secs;
        this.string = m + ":" + s;
    }

}


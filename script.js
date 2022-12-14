console.log('ASD Chinese Typing Test')
console.log('Created by Liam Gifford')
console.log('Last Updated 16 November | 12:32 PM')

// SwitchPage Setup
const switchBtns = document.getElementsByClassName('switch')
for (var i=0; i<switchBtns.length; i++){
    switchBtns[i].onclick = switchPage
}

document.getElementById('simplified').onclick = onSimplifiedChange
document.getElementById('input').value = ''

// Constants Setup
let units = {}
let words = []
let usedUnits = []
let testParams = 'this is a test'
let initSeconds = 15
const lngth = 50

createText(testParams.split(''))
const sheets = readCharacterSheets('words')

// Calls functions to setup test-text
function setupText() {
   testParams = randomizeWords(words)
   deleteText()
   createText(testParams.split(''))
}

// sends text to test-text in increments of a single character.
function createText(list) {
    list.forEach((char, index) => {
        const letter = document.createElement('span')
        letter.setAttribute('data-text-pos', index)
        letter.innerHTML = char 
        letter.classList.add('test-letter')
        letter.style.color = 'black'
        document.getElementById('test-text').appendChild(letter)
    })
}

// deletes the text from test-text
function deleteText() {
    const parent = document.getElementById('test-text')
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild)
    }
}

function readCharacterSheets(name) {
// "use strict";
    $(document).ready(function () {
        $.get(name + '.yaml')
        .done(function (data) {
          createCharSheetData(jsyaml.load(data));
        });
    });
}

function createCharSheetData(data) {
    for (const unit in data) {
        const div = document.createElement('div')
        const checkbox = document.createElement('input')
        const label = document.createElement('label')
        const br = document.createElement('br')
        
        div.classList.add('form-check')

        checkbox.id = unit
        checkbox.setAttribute('type', 'checkbox')
        checkbox.onclick = onModWords
        checkbox.classList.add('form-check-input', 'check-space')
        
        label.setAttribute('for', unit)
        label.innerHTML = '    ' + data[unit].name
        label.classList.add('form-check-label')
    
        document.getElementById('unitList').appendChild(checkbox)
        document.getElementById('unitList').appendChild(label)
        document.getElementById('unitList').appendChild(br)
    }
    units = data
}

// Randomizes words in arr
// Array - Array with chinese characters
// Length - test length
function randomizeWords(array) {
    output = []
    const wordsFlattened = array.flat()
    for (var i=0; i<lngth; i++) {
        randNum = Math.floor(Math.random()*wordsFlattened.length)
        output.push(wordsFlattened[randNum])
    }
    return output.join('')
}

// Trigger for char sheets checkboxes
function onModWords(e) {
   const unit = e.target.id
   const simpBool = document.getElementById('simplified').checked

   if (e.target.checked) {
    addWords(unit, simpBool)
   } else {
    removeWords(unit, simpBool)
   }

   setupText()
}

// Trigger for simplified checkbox
function onSimplifiedChange(e) {
    swapSimp(e.target.checked, usedUnits)
    randomizeWords(words, lngth)
}

// Internal functions for onModWords / onSimplifiedChange
// addWords -> adds words to list
// removeWords -> removes words from list
// swapSimp -> swaps all current words to the opposite of simp
function addWords(unit, simpBool) {
    words.push((simpBool) ? units[unit].simpWords : units[unit].words)
    usedUnits.push(unit)
}

function removeWords(unit, simpBool) {
    words.forEach((set, index) => {
        if (set == (simpBool) ? units[unit].simpWords : units[unit].words) {
            words.splice(index, 1)
        }
    })
    
    const ind = usedUnits.indexOf(unit)
    usedUnits.splice(ind, 1)
}

function swapSimp(simpBool, usedUnits) {
    words.length = 0
    if (simpBool) {
        usedUnits.forEach(unit => words.push(units[unit].simpWords))
    } else {
        usedUnits.forEach(unit => words.push(units[unit].words))
    }
}
// end internal functions for onModWords

// Switches Pages
// e - onclick event
// data-target - Attribute for id to switch the page to
function switchPage(e, target) {
    
    const pages = document.getElementById('pages')
    let futurePage;
    if (target == undefined) {
        futurePage = e.target.getAttribute('data-target')
    } else {
        futurePage = target
    }

    for (var i=0; i<pages.children.length; i++) {
        const page = pages.children[i]
        page.style.display = 'none'
        
        document.getElementById(futurePage).style.display = 'block'
    }

    if (futurePage == 'test') {
        document.getElementById('input').focus()
        intervalRegulator()
    }

    if (futurePage != 'test') {
        document.getElementById('input').blur()
    }
}

// Regulates the two intervals, the color interval and the timer interval. I could not get them to work together, so they are seperate.
// Color Interval --> Sets color of text has people type
// Timer Interval --> Changes time, also switches page when time finishes.
function intervalRegulator(){
    var seconds = initSeconds
    document.getElementById('timer').innerHTML = seconds

    var interval = setInterval(testLoop, 100);
    var timer = setInterval(function(){
        document.getElementById('timer').innerHTML = Math.floor(seconds)
        seconds -= .5
        
        if (seconds <= 0) {
            clearInterval(interval)
            clearInterval(timer)
            
            evalStats(testParams, document.getElementById('input'), initSeconds)
            document.getElementById('unitStatList').children.forEach((child) => document.getElementById('unitStatList').removeChild(child))
            switchPage('', 'stats')
            setupText()
            document.getElementById('input').value = ''
        }
    }, 500)
    
}

// Adds color in on real time
function testLoop() {
    let inputLength = 0
    const testTextInds = document.getElementById('test-text').children
    const input = document.getElementById('input').value
    
    if (inputLength < input.length || inputLength > input.length) {
        if(input.length <= testTextInds.length) {    
            const dataList = compareText(testParams, input)
            
            for (var i=inputLength; i<dataList.length; i++) {
                testTextInds[i].style.color = dataList[i] == 0 ? 'red' : dataList[i] == 1 ? 'green' : dataList[i] == 2 ? 'black': 'black';
            }
        }    
    }
    
    inputLength = input.length
}

// Compares input to test
function compareText(test, input) {
    let output = []
    for (var i=0; i<input.length; i++) {
        if (test[i] != input[i]) {
            output.push(0)
        } else {
            output.push(1)
        }
    }
    for (var i=0; i<(test.length-input.length); i++) {
        output.push(2)
    }

    return output;
}

function evalStats(test, input, time) {
   let correct = 0
   let total = input.value.length
   
   const inputList = input.value.split('')
   for (var i=0; i<total; i++) {
        correct += (inputList[i] == test.split('')[i]) ? 1 : 0
   }
   document.getElementById('accpercent').innerHTML = correct/total * 100 + '%'
   document.getElementById('acctotal').innerHTML = `${correct}/${total}`

   let cpm = correct / time * 60
   document.getElementById('cpm').innerHTML = cpm

   usedUnits.forEach(unit => {
    const li = document.createElement('li')
    li.innerHTML = units[unit].name
    document.getElementById('unitStatList').appendChild(li)
   })
}
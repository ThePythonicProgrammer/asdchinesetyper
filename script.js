console.log('ASD Chinese Typing Test')
console.log('Created by Liam Gifford')
console.log('Last Updated 16 November | 08:06 AM')

// SwitchPage Setup
const switchBtns = document.getElementsByClassName('switch')
for (var i=0; i<switchBtns.length; i++){
    switchBtns[i].onclick = switchPage
}

document.getElementById('simplified').onclick = onSimplifiedChange

// Constants Setup
let units = {}
let words = []
let usedUnits = []
let testParams = 'this is a test'
let initSeconds = 3
const lngth = 50

createText(testParams.split(''))
const sheets = readCharacterSheets('words')

// sends text to test-text in increments of a single character.
function createText(list) {
    list.forEach((char, index) => {
        const letter = document.createElement('span')
        letter.setAttribute('data-text-pos', index)
        letter.innerHTML = char 
        letter.classList.add('test-letter')
        document.getElementById('test-text').appendChild(letter)
    })
}

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
          console.log('File load complete');
          createCharSheetData(jsyaml.load(data));
        });
    });
}

function createCharSheetData(data) {
    console.log('running create char sheet data')
    console.log({data})
    for (const unit in data) {
        const checkbox = document.createElement('input')
        const label = document.createElement('label')
        const br = document.createElement('br')
        
        checkbox.id = unit
        checkbox.setAttribute('type', 'checkbox')
        checkbox.onclick = onModWords
        
        label.setAttribute('for', unit)
        label.innerHTML = data[unit].name

        console.log(label)
        document.getElementById('unitList').appendChild(checkbox)
        document.getElementById('unitList').appendChild(label)
        document.getElementById('unitList').appendChild(br)
    }
    units = data
    console.log({units})
}

// Randomizes words in arr
// Array - Array with chinese characters
// Length - test length
function randomizeWords(array, length) {
    output = []
    const wordsFlattened = array.flat()
    for (var i=0; i<wordsFlattened.length; i++) {
        randNum = Math.floor(Math.random()*wordsFlattened[i].length)
        output.push(wordsFlattened[randNum])
    }
    console.log({randomWords: output})
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

   console.log({words})
   testParams = randomizeWords(words, lngth)
   deleteText()
   createText(testParams.split(''))
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
    usedUnits.push(units[unit])
    console.log({addWords: words, simpBool, unit})
}

function removeWords(unit, simpBool) {
    words.forEach((set, index) => {
        if (set == units[unit].words) {
            words.splice(index, 1)
        }
    })
    // units[unit].words.forEach((word) => words = words.filter(val => val != word))
    // usedUnits = usedUnits.filter(val => units[unit] != val)
}

function swapSimp(simpBool, usedUnits) {
    words = []
    for (var i=0; i<usedUnits.length; i++) {
        if (simpBool) {
            usedUnits[i].simpWords.forEach(word => {words.push(word)})
        } else {
            usedUnits[i].words.forEach(word => {words.push(word)})
        }
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
        intervalRegulator()
    }
}

// Regulates the two intervals, the color interval and the timer interval. I could not get them to work together, so they are seperate.
function intervalRegulator(){
    var seconds = initSeconds
    document.getElementById('timer').innerHTML = seconds

    var interval = setInterval(testLoop, 500);
    var timer = setInterval(function(){
        document.getElementById('timer').innerHTML = Math.floor(seconds)
        seconds -= .5
        if (seconds <= 0) {
            clearInterval(interval)
            clearInterval(timer)
            
            evalStats(testParams, document.getElementById('input'), initSeconds)
            switchPage('', 'stats')
        }
    }, 500)
    
}

// Adds color in on real time
function testLoop() {
    let inputLength = 0
    const testTextInds = document.getElementById('test-text').children
    const input = document.getElementById('input').value
    
    if (inputLength < input.length || inputLength > input.length) {    
        const dataList = compareText(testParams, input)
        
        for (var i=inputLength; i<dataList.length; i++) {
            testTextInds[i].style.color = (dataList[i]) ? 'green' : 'red'
        }    
    }
    
    inputLength = input.length
}

// Compares input to test
function compareText(test, input) {
    let output = []
    for (var i=0; i<input.length; i++) {
        if (test[i] == input[i]) {
            output.push(1)
        } else {
            output.push(0)
        }
    }
    return output
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
}
let validGuesses = new Set();
let wordListLoaded = false;

// Fetch valid word list
fetch('https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt')
    .then(response => response.text())
    .then(text => {
        text.split('\n').forEach(word => validGuesses.add(word.trim().toUpperCase()));
        wordListLoaded = true;
        console.log("Word list loaded, total words:", validGuesses.size);
        document.getElementById("loadingOverlay").style.display = "none";
    })
    .catch(() => {
        alert("Failed to load word list!");
        document.getElementById("loadingOverlay").innerText = "Failed to load word list!";
    });

let answerIndex = Math.floor(Math.random() * array.length);
let answer = array[answerIndex].toUpperCase();
console.log("Answer is:", answer);

function gameBoard() {
    let board = document.getElementById("board");

    for (let i = 0; i < 6; i++) {
        let row = document.createElement("div");
        row.className = "row";

        for (let j = 0; j < 5; j++) {
            let box = document.createElement("div");
            box.className = "box";
            box.contentEditable = "true";
            box.style.border = "1px solid black";
            box.style.width = "40px";
            box.style.height = "40px";
            box.style.display = "inline-block";
            box.style.textAlign = "center";
            box.style.verticalAlign = "middle";
            box.style.lineHeight = "40px";
            box.style.fontSize = "24px";
            box.style.margin = "2px";
            row.appendChild(box);
        }

        board.appendChild(row);
    }

    let firstBox = document.querySelector(".box");
    firstBox.focus();
}

gameBoard();

function checkGuess(guess, answer) {
    return guess.toUpperCase() === answer.toUpperCase();
}

function applyColorsToBoxes(guess, answer, boxes) {
    let letterCount = {};
    answer = answer.toUpperCase();
    guess = guess.toUpperCase();

    for (let char of answer) {
        letterCount[char] = (letterCount[char] || 0) + 1;
    }

    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === answer[i]) {
            boxes[i].style.backgroundColor = "green";
            letterCount[guess[i]]--;
        }
    }

    for (let i = 0; i < guess.length; i++) {
        if (boxes[i].style.backgroundColor === "green") continue;
        if (letterCount[guess[i]] > 0) {
            boxes[i].style.backgroundColor = "yellow";
            letterCount[guess[i]]--;
        } else {
            boxes[i].style.backgroundColor = "gray";
        }
    }
}

document.addEventListener("keydown", (keypress) => {
    let pressedKey = keypress.key;
    let activeBox = document.activeElement;

    if (!wordListLoaded) return;  // Don't allow actions before word list loads

    if (activeBox && activeBox.classList.contains("box")) {
        if (pressedKey.length === 1) {
            let nextBox = activeBox.nextElementSibling;
            if (nextBox && nextBox.classList.contains("box")) {
                nextBox.focus();
            }
            activeBox.textContent = pressedKey.toUpperCase();
            keypress.preventDefault();
        } else if (pressedKey === "Backspace") {
            activeBox.textContent = "";
            let prevBox = activeBox.previousElementSibling;
            if (prevBox && prevBox.classList.contains("box")) {
                prevBox.focus();
            }
            keypress.preventDefault();
        } else if (pressedKey === "Enter" || pressedKey === "Return") {
            let row = activeBox.parentElement;
            let nextRow = row.nextElementSibling;
            let boxes = row.querySelectorAll(".box");
            let isFilled = true;
            for (let i = 0; i < boxes.length; i++) {
                if (!boxes[i].textContent.trim()) {
                    isFilled = false;
                    break;
                }
            }
            if (isFilled) {
                let guess = "";
                for (let i = 0; i < boxes.length; i++) {
                    boxes[i].contentEditable = "false";
                    guess = guess + boxes[i].textContent;
                }

                guess = guess.toUpperCase();

                if (!validGuesses.has(guess)) {
                    console.log(`Invalid guess attempted: ${guess}`);
                    alert("Not a valid word!");
                    for (let i = 0; i < boxes.length; i++) {
                        boxes[i].contentEditable = "true";
                    }
                    boxes[0].focus();
                    return;
                }

                applyColorsToBoxes(guess, answer, boxes);

                if (checkGuess(guess, answer)) {
                    alert("Congratulations! You've guessed the correct word: " + answer);
                    showReplayButton();
                }

                if (!nextRow) {
                    let allBoxesFilled = true;
                    document.querySelectorAll('.box').forEach(box => {
                        if (!box.textContent.trim()) {
                            allBoxesFilled = false;
                        }
                    });
                    if (allBoxesFilled && !checkGuess(guess, answer)) {
                        alert("Sorry, you've used up all your guesses. The correct answer is: " + answer);
                        showReplayButton();
                    }
                } else {
                    let firstBoxNextRow = nextRow.querySelector(".box");
                    firstBoxNextRow.focus();
                }

                keypress.preventDefault();
                return false;
            }
        }
    }
});

function showReplayButton() {
    let replayButton = document.getElementById("replayButton");
    if (replayButton) {
        replayButton.style.display = "block";
    }
}

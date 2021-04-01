var board = [];
const height = 200;
const width = 200;

var curEpoch = 0;
var totalEpochs = 5000;

var initialNeighbourhood = 20;
var initialLearning = 0.5;
const delta = totalEpochs / Math.log(initialNeighbourhood);

var epochsInputElement, initialNeighbourhoodElement, initialLearningElement;
var go;

// setup for p5.js canvas
function setup() {
    createCanvas(height, width);
    noLoop();
}

window.onload = () => {
    epochsInputElement = document.getElementById('numEpochs');
    initialNeighbourhoodElement = document.getElementById('initNeighbourhood');
    initialLearningElement = document.getElementById('initLearning');

    epochsInputElement.value = totalEpochs;
    initialNeighbourhoodElement.value = initialNeighbourhood;
    initialLearningElement.value = initialLearning;
    go = true;
}

// main draw call for p5.js canvas
function draw() {
    if(!go) return;
    
    clear();
    for(let i = 0; i < height; i++){
        for(let j = 0; j < width; j++){
            let colour = weightsToColour(board[i][j]);
            fill(colour[0], colour[1], colour[2]);
            noStroke();
            rect(i, j, 1, 1);
        }
    }   
}

const start = () => {
    initBoard();
    curEpoch = 0;

    if(epochsInputElement.value){
        totalEpochs = epochsInputElement.value;
    } else {
        totalEpochs = 5000;
    }

    if(initialNeighbourhoodElement.value){
        initialNeighbourhood = initialNeighbourhoodElement.value;
    } else {
        initialNeighbourhood = 20;
    }

    if(initialLearningElement.value){
        initialLearning = initialLearningElement.value;
    } else {
        initialLearning = 0.8;
    }

    while(curEpoch < totalEpochs){
        epoch();
    }

    redraw();
}

// one training epoch
const epoch = () => {
    curEpoch++;

    let randomVector = createRandomVector();
    let indexesBMU = findBMU(randomVector);
    let colourBMU = board[indexesBMU[0]][indexesBMU[1]];

    let curNeighbourhood = initialNeighbourhood * Math.exp(-1 * curEpoch / delta);
    let curLearning = initialLearning * Math.exp(-1 * curEpoch / delta);

    for(let i = 0; i < board.length; i++){
        for(let j = 0; j < board[i].length; j++){
            let dist = positionDistance(indexesBMU, [i,j]);
            
            if(dist <= curNeighbourhood){
                let theta = Math.exp((-1 * (dist * dist)) / (2 * curNeighbourhood * curNeighbourhood));

                for(let k = 0; k < 3; k++){
                    // mistake is here, heh
                    board[i][j][k] = board[i][j][k] + (theta * curLearning * (colourBMU[k] - board[i][j][k]));
                }
            }
        }
    }
}

// converts the [0, 1) vectors to [0, 255)
const weightsToColour = (vector) => {
    return [Math.round(vector[0] * 256), Math.round(vector[1] * 256), Math.round(vector[2] * 256)]
}

// makes the initial board filled with the [0, 1) vectors
const initBoard = () => {
    board = [];
    for(let i = 0; i < height; i++){
        board.push([]);
        for(let j = 0; j < width; j++){
            board[i].push(createRandomVector());
        }
    }
}

// calculates the difference between two vectors
const colourDistance = (c1, c2) => {
    let r = 0;
    for(let i = 0; i < c1.length; i++){
        r += Math.pow(c1[i] - c2[i], 2);
    }
    return Math.sqrt(r);
}

// calculates the differences between two positions
const positionDistance = (p1, p2) => {
    let r = 0;
    r += Math.pow(p1[0] - p2[0], 2);
    r += Math.pow(p1[1] - p2[1], 2);
    return Math.sqrt(r);
}

// creates a random 3d vector with values [0, 1)
const createRandomVector = () => {
    return [Math.random(), Math.random(), Math.random()];
}

// find the best matching unit in the board
const findBMU = (inputVector) => {
    let resultI = 0;
    let resultJ = 0;
    let resultD = 999999;
    
    for(let i = 0; i < height; i++){
        for(let j = 0; j < width; j++){
            let curD = colourDistance(inputVector, board[i][j]);
            if(curD < resultD){
                resultI = i;
                resultJ = j;
                resultD = curD;
            }
        }
    }

    return [resultI, resultJ];
}
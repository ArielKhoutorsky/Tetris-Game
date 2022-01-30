document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid");
  let squares = Array.from(document.querySelectorAll(".grid div"));
  const scoreDisplay = document.querySelector("#score");
  const startBtn = document.querySelector("#start-button");
  const resetBtn = document.querySelector("#reset-button");
  const width = 10;
  let nextRandom = 0;
  let timerId; //controls whether the blocks keep falling
  let score = 0
  let lost = false //switch to disable moving the tetromino down when game over occurs

  const colors = [
    'orange',
    'red',
    'purple',
    'yellow',
    'cyan'
  ]

  // the tetrominoes
  const lTetromino = [
    [1, width + 1, width * 2 + 1, 2],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, width + 1, width * 2 + 1, width * 2],
    [width, width * 2, width * 2 + 1, width * 2 + 2],
  ];

  const tTetromino = [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1],
  ];

  const oTetromino = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
  ];

  const iTetromino = [
    [1, width + 1, width * 2 + 1, width*3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width*3 + 1],
    [width, width + 1, width + 2, width + 3],
  ];  
  

  const zTetromino = [
    [0, width, width + 1, width * 2 + 1],
    [width, width + 1, 1, 2],
    [0, width, width + 1, width * 2 + 1],
    [width, width + 1, 1, 2],
  ];
  

  const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino,];

  let currentPosition = 4;
  let random = Math.floor(Math.random()*theTetrominoes.length);
  let currentRotation = 0;
  let current = theTetrominoes[random][currentRotation]; //relative position of the current tetromino
  
  //draw the tetromino
  function draw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.add('tetromino');
      squares[currentPosition + index].style.backgroundColor = colors[random]
      squares[currentPosition + index].style.boxShadow = 'inset -3px -3px 5px 3px rgba(131,131,131,0.55)'
    });
  }
  
  //undraw the tetromino
  function undraw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.remove('tetromino');
      squares[currentPosition + index].style.backgroundColor = ''
      squares[currentPosition + index].style.boxShadow = ''
    });
  }
  
  //assign functions to KeyCodes
  function control(e) {
    if (timerId === null) { //no commands executed when the game is not running
      return
    }
    if (lost){
      return
    }
    if (e.keyCode === 37){
      moveLeft();
    }
    else if(e.keyCode === 38){
      rotate();
    }
    else if(e.keyCode === 39){
      moveRight();
    }
    else if(e.keyCode === 40){
      moveDown()
    }
  }
  document.addEventListener('keyup', control);
  
  //move down function
  function moveDown() {
    if (lost){
      return
    }
    undraw();
    if (!(current.some(index => (squares[index + currentPosition + width]).classList.contains('taken')))){ //tetromino moves down only if nothing is below it
      currentPosition += width
    }
    draw()
    freeze();
  }
  
  //freeze function
  function freeze() {
    if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))){
      current.forEach(index => squares[currentPosition + index].classList.add('taken'));
    
      //start a new tetromino falling
      random = nextRandom;
      nextRandom = Math.floor(Math.random() * theTetrominoes.length);
      current = theTetrominoes[random][currentRotation];
      currentPosition = 4
      draw()
      displayShape()
      addScore()
      gameOver()
    }
  }

  //move left unless there is blockage
  function moveLeft() {
    undraw()
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);

    if (!isAtLeftEdge) currentPosition -= 1;

    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))){
      currentPosition +=1;
    }
    draw();
  }

  //move right unless there is blockage
  function moveRight() {
    undraw();
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);

    if (!isAtRightEdge) currentPosition += 1;

    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))){
      currentPosition -=1;
    }
    draw();
  }

  //fixing rotation of a tetromino at the edge
  function isAtRight() {
    return current.some(index => (currentPosition + index + 1) % width === 0 )
  }

  function isAtLeft() {
    return current.some(index => (currentPosition + index) % width === 0 )
  }

  function checkRotatedPosition(P) {
    P = P || currentPosition  //get current position, then check if the piece is near the left side
    if ((P+1) % width < 4) {
      if (isAtRight()) { //if the tetromino flips throught the left edge, adjust back
        currentPosition +=1
        checkRotatedPosition(P)
      }
    }
    else if (P % width > 5) {
      if (isAtLeft()){ //if the tetromino flips throught the right edge, adjust back
        currentPosition -=1
        checkRotatedPosition(P)
      }
    }
  }
  
  //rotate the tetromino
  function rotate() {
  
    let currentFlipped = theTetrominoes[random][(currentRotation + 1) % 4]
    if (currentFlipped.some(index => squares[index + currentPosition].classList.contains('taken'))){//if flipping would have caused collision, don't flip
      return
    }
    if (random === 1 && currentRotation === 2 && isAtRight()){ //specific flip case error
      return
    }
    undraw();
    currentRotation++;
    if(currentRotation === current.length) {
      currentRotation = 0;
    }
    current = theTetrominoes[random][currentRotation]
    checkRotatedPosition()
    draw();
  }

  //show up next tetromino in mini-grid
  const displaySquares = document.querySelectorAll(".mini-grid div")
  const displayWidth = 4;
  let displayIndex = 1;
  
  

  //the Tetrominos without rotations
  const upNextTetrominoes = [
    [1, displayWidth+1, displayWidth*2+1, 2,], //lTetromino
    [0, displayWidth, displayWidth+1, displayWidth*2+1,], //zTetromino
    [1, displayWidth, displayWidth+1, displayWidth+2,], //tTetromino
    [0, 1, displayWidth, displayWidth+1,], //oTetromino
    [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1,], //iTetromino
  ];
  

  //display the shape in the mini-grid display
  function displayShape() {
    displaySquares.forEach(square => {
      square.classList.remove("tetromino")
    square.style.backgroundColor = ''
    square.style.boxShadow = ''})
    
      
    upNextTetrominoes[nextRandom].forEach( index => {
      displaySquares[displayIndex + index].classList.add('tetromino');
      displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
      displaySquares[displayIndex + index].style.boxShadow = 'inset -3px -3px 5px 3px rgba(131,131,131,0.55)'
    })
  }

  //add functionality to  start/stop button
  startBtn.addEventListener('click', () => {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    } else {
      draw()
      timerId = setInterval(moveDown, 500)
      nextRandom = Math.floor(Math.random()*theTetrominoes.length)
      displayShape()
    }
  })

  //add functionality to reset button
  resetBtn.addEventListener('click', () => {
    lost = false
    score=0
    scoreDisplay.innerHTML = score
    squares.forEach(element => element.classList.remove('taken'))
    squares.forEach(element => element.classList.remove('tetromino'))
    squares.forEach(element => element.style.backgroundColor = '')
    squares.forEach(element => element.style.boxShadow = '')
    for (let i = 200; i<210; i++){
      squares[i].classList.add('taken')
    }
    clearInterval(timerId)
    timerId = null
    currentPosition = 4
    draw()

  })

  

  //add score
  function addScore() {
    for (let i = 0; i<199 ; i+=width) {
      const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]

      if(row.every(index => squares[index].classList.contains('taken'))){
        score+=10 //adds score if there is a line
        scoreDisplay.innerHTML = score
        row.forEach(index => {
          squares[index].classList.remove('taken')
          squares[index].classList.remove('tetromino')
          squares[index].style.backgroundColor = '' //removes the formed line
          squares[index].style.boxShadow = ''
        })
        const squaresRemoved = squares.splice(i, width) 
        squares = squaresRemoved.concat(squares)
        squares.forEach(cell => grid.appendChild(cell)) //removes the squares and reappends them to the grid from the top
      }
    }
  }

  //game over
  function gameOver() {
    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))){
      scoreDisplay.innerHTML = 'Game Over =>'+ score
      clearInterval(timerId)
      lost = true
      
    }
  }
});

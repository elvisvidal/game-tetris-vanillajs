document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid');
  let squares = Array.from(document.querySelectorAll('.grid div'));
  const scoreDisplay = document.querySelector('#score');
  const startBtn = document.querySelector('#start-button');
  const width = 10;
  let nextRandom = 0;
  let timerId;
  let score = 0;
  const colors = [
    'orange',
    'red',
    'purple',
    'green',
    'orange',
  ];

  /**
   * Tetrominoes
   * The way to think of how to draw these shapes is:
   * 1. Imagine a box/array of 3x3 (4x4 for I)
   *    - - - -
   *    - - - -
   *    - - - -
   * 
   *    0  1  2  3
   *    10 11 12 13
   *    20 21 22 23
   * 
   * 2. To draw a shape, we fill each space in a column/row
   *    - o o -
   *    - o - -
   *    - o - -
   * 
   * 3. So to make the shape above we fill in the following
   * index positions:
   *    - 1  2 -
   *    - 11 - -
   *    - 21 - -
   */
  // ========= L shape
  const lTetromino = [
    // - o o -
    // - o - -
    // - o - -
    [1, width+1, width*2+1, 2],
    // - - - -
    // o o o -
    // - - o -
    [width, width+1, width+2, width*2+2],
    // - o - -
    // - o - -
    // o o - -
    [width*2, 1, width+1, width*2+1],
    // - - - -
    // o - - -
    // o o o -
    [width, width*2, width*2+1, width*2+2],
  ];
  // ========= Z shape
  const zTetromino = [
    // o - - -
    // o o - -
    // - o - -
    [0, width, width + 1, width * 2 + 1],
    // - - - -
    // - o o -
    // o o - -
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1]
  ];
  // ========= T shape
  const tTetromino = [
    // - o - -
    // o o o -
    // - - - -
    [1, width, width + 1, width + 2],
    // - o - -
    // - o o -
    // - o - -
    [1, width + 1, width + 2, width * 2 + 1],
    // - - - -
    // o o o -
    // - o - -
    [width, width + 1, width + 2, width * 2 + 1],
    // - o - -
    // o o - -
    // - o - -
    [1, width, width + 1, width * 2 + 1]
  ];
  // ========= O shape
  const oTetromino = [
    // o o - -
    // o o - -
    // - - - -
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1]
  ];
  // ========= I shape
  const iTetromino = [
    // - o - -
    // - o - -
    // - o - -
    // - o - -
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    // - - - -
    // o o o o
    // - - - -
    // - - - -
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3]
  ];

  // tetrominoes position and rotation
  const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];
  let currentPosition = 4;
  let currentRotation = 0;
  // random Tetromino
  let random = Math.floor(Math.random() * theTetrominoes.length);
  let current = theTetrominoes[random][currentRotation];

  // draw the tetromino
  function draw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.add('tetromino');
      squares[currentPosition + index].style.backgroundColor = colors[random];
    });
  }

  // undraw the tetromino
  function undraw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.remove('tetromino');
      squares[currentPosition + index].style.backgroundColor = '';
    });
  }

  // controls
  function control(e) {
    if (e.keyCode === 37) {
      moveLeft();
    } else if (e.keyCode === 39) {
      moveRight()
    } else if (e.keyCode === 38) {
      rotate();
    } else if (e.keyCode === 40) {
      moveDown();
    }
  }
  document.addEventListener('keyup', control);
  
  // move tetromino down every second
  function moveDown() {
    undraw();
    currentPosition += width;
    draw();
    freeze();
  }

  // freeze
  function freeze() {
    if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
      current.forEach(index => squares[currentPosition + index].classList.add('taken'));
      // start a new tetromino
      random = nextRandom;
      nextRandom = Math.floor(Math.random() * theTetrominoes.length);
      current = theTetrominoes[random][currentRotation];
      currentPosition = 4;
      draw();
      displayShape();
      addScore();
      gameOver();
    }
  }

  // move, unless is at the edge or there is a blockage
  function moveLeft() {
    undraw();
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);

    if (!isAtLeftEdge) currentPosition -= 1;

    if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      currentPosition += 1;
    }

    draw();
  }
  function moveRight() {
    undraw();
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width -1);

    if (!isAtRightEdge) currentPosition += 1;

    if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      currentPosition -= 1;
    }

    draw();
  }

  // rotate the tetromino
  function rotate() {
    undraw();
    currentRotation ++;
    // reset rotation position if it gets to max 4
    if (currentRotation === current.length) {
      currentRotation = 0;
    }
    current = theTetrominoes[random][currentRotation];
    draw();
  }

  // ============ MINI-GRID ============
  const displaySquares = document.querySelectorAll('.mini-grid div');
  const displayWidth = 4;
  let displayIndex = 0;

  // Tetrominos without rotations
  const upNextTetrominoes = [
    [1, displayWidth + 1, displayWidth * 2 + 1, 2], /* lTetromino */
    [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], /* zTetromino */
    [1, displayWidth, displayWidth + 1, displayWidth + 2], /* tTetromino */
    [0, 1, displayWidth, displayWidth + 1], /* oTetromino */
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1], /* iTetromino */
  ];

  // display the shape in hte mini-grid display
  function displayShape() {
    // remove any trace of a tetromino
    displaySquares.forEach(square => {
      square.classList.remove('tetromino');
      square.style.backgroundColor = '';
    })
    // add next
    upNextTetrominoes[nextRandom].forEach(index => {
      displaySquares[displayIndex + index].classList.add('tetromino');
      displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom];
    })
  }

  // add functionality to the button
  startBtn.addEventListener('click', () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    } else {
      timerId = setInterval(moveDown, 1000);
      nextRandom = Math.floor(Math.random() * theTetrominoes.length);
      displayShape();
    }
  });

  // score
  function addScore() {
    for (let i = 0; i < 199; i += width) {
      const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];

      if (row.every(index => squares[index].classList.contains('taken'))) {
        score += 10;
        scoreDisplay.innerHTML = score;
        row.forEach(index => {
          squares[index].classList.remove('taken');
          squares[index].classList.remove('tetromino');
          squares[index].style.backgroundColor = '';
        });

        const squaresRemoved = squares.splice(i, width);
        squares = squaresRemoved.concat(squares);
        squares.forEach(cell => grid.appendChild(cell));
      }
    }
  }

  // game over
  function gameOver() {
    if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      scoreDisplay.innerHTML = 'Game Over!';
      clearInterval(timerId);
    }
  }
});

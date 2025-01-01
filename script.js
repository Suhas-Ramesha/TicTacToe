const X = "X";
const O = "O";
const EMPTY = null;

let currentBoard = initial_state();
let humanPlayer = X;
let aiPlayer = O;
let gameOver = false;

const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const resetButton = document.getElementById("reset");

// Initialize the board
function initializeBoard() {
  boardElement.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.addEventListener("click", handleCellClick);
      boardElement.appendChild(cell);
    }
  }
}

// Handle cell click
function handleCellClick(event) {
  if (gameOver) return;

  const row = parseInt(event.target.dataset.row);
  const col = parseInt(event.target.dataset.col);

  if (currentBoard[row][col] !== EMPTY) return;

  currentBoard = result(currentBoard, [row, col]);
  updateBoard();

  if (terminal(currentBoard)) {
    endGame();
    return;
  }

  // AI's turn
  const aiMove = minimax(currentBoard);
  currentBoard = result(currentBoard, aiMove);
  updateBoard();

  if (terminal(currentBoard)) {
    endGame();
  }
}

// Update the board UI
function updateBoard() {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
      cell.textContent = currentBoard[i][j];
    }
  }
}

// End the game
function endGame() {
  gameOver = true;
  const winnerPlayer = winner(currentBoard);
  if (winnerPlayer) {
    statusElement.textContent = `${winnerPlayer} wins!`;
  } else {
    statusElement.textContent = "It's a tie!";
  }
}

// Reset the game
resetButton.addEventListener("click", () => {
  currentBoard = initial_state();
  gameOver = false;
  statusElement.textContent = "";
  initializeBoard();
  updateBoard();
});

// Initialize the game
initializeBoard();
updateBoard();

// Game logic functions (from your Python code)
function initial_state() {
  return [
    [EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY]
  ];
}

function player(board) {
  let x_count = 0, o_count = 0;
  for (let row of board) {
    x_count += row.filter(cell => cell === X).length;
    o_count += row.filter(cell => cell === O).length;
  }
  return x_count > o_count ? O : X;
}

function actions(board) {
  let possible_actions = new Set();
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === EMPTY) {
        possible_actions.add([i, j]);
      }
    }
  }
  return possible_actions;
}

function result(board, action) {
  if (![...actions(board)].some(([i, j]) => i === action[0] && j === action[1])) {
    throw new Error("Invalid action");
  }
  let new_board = JSON.parse(JSON.stringify(board)); // Deep copy
  let current_player = player(board);
  new_board[action[0]][action[1]] = current_player;
  return new_board;
}

function winner(board) {
  // Check rows and columns
  for (let i = 0; i < 3; i++) {
    if (board[i][0] === board[i][1] && board[i][1] === board[i][2] && board[i][0] !== EMPTY) {
      return board[i][0];
    }
    if (board[0][i] === board[1][i] && board[1][i] === board[2][i] && board[0][i] !== EMPTY) {
      return board[0][i];
    }
  }
  // Check diagonals
  if (board[0][0] === board[1][1] && board[1][1] === board[2][2] && board[0][0] !== EMPTY) {
    return board[0][0];
  }
  if (board[0][2] === board[1][1] && board[1][1] === board[2][0] && board[0][2] !== EMPTY) {
    return board[0][2];
  }
  return null;
}

function terminal(board) {
  return winner(board) !== null || board.every(row => row.every(cell => cell !== EMPTY));
}

function utility(board) {
  let win = winner(board);
  if (win === X) {
    return 1;
  } else if (win === O) {
    return -1;
  } else {
    return 0;
  }
}

function minimax(board) {
  if (terminal(board)) {
    return null;
  }

  let current_player = player(board);
  let best_action = null;

  if (current_player === X) {
    let best_value = -Infinity;
    for (let action of actions(board)) {
      let value = minimax_value(result(board, action));
      if (value > best_value) {
        best_value = value;
        best_action = action;
      }
    }
  } else {
    let best_value = Infinity;
    for (let action of actions(board)) {
      let value = minimax_value(result(board, action));
      if (value < best_value) {
        best_value = value;
        best_action = action;
      }
    }
  }

  return best_action;
}

function minimax_value(board) {
  if (terminal(board)) {
    return utility(board);
  }

  let current_player = player(board);
  if (current_player === X) {
    let best_value = -Infinity;
    for (let action of actions(board)) {
      let value = minimax_value(result(board, action));
      best_value = Math.max(best_value, value);
    }
    return best_value;
  } else {
    let best_value = Infinity;
    for (let action of actions(board)) {
      let value = minimax_value(result(board, action));
      best_value = Math.min(best_value, value);
    }
    return best_value;
  }
}
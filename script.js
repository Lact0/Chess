//Constants
const width = window.innerWidth;
const height = window.innerHeight;
const unit = parseInt(height / 9);
const boardX = parseInt((width - (8 * unit)) / 2);
const boardY = parseInt(unit / 2);
const colors = ['rgb(238,238,210)','rgb(118,150,86)'];
const image = new Image();
image.src = 'Chess Sprite.png';
const horseMovement = [[2, 1], [-2, 1], [2, -1], [-2, -1], [1, 2], [-1, 2], [1, -2], [-1, -2]];
const kingMovement = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const edge = 3;
const promotion = ['q', 'r', 'b', 'h'];

//Board passant is in this order:
//[Ghost pos, Real Pos, Color];
// 0, 1,      2,3,      4

class Board {
  constructor(inp) {
    this.check = false;
    this.main = false;
    this.clicked = false;
    if(inp) {

      //Set Parameters
      const board = inp[0];
      this.board = [];
      for(let x = 0; x < 8; x++) {
        let temp = [];
        for(let y = 0; y < 8; y++) {
          temp.push(board.board[x][y]);
        }
        this.board.push(temp);
      }
      this.orientation = board.orientation;
      this.passant = false;

      //Check if this is a Check board
      if(inp.length == 6 && inp[5] == 'check') {
        this.check = true;
      }

      //Determine Type of Move and Make Move
      const piece = this.board[inp[1]][inp[2]];
      if(piece.substring(1,2) == 'p' && (inp[4] == 0 || inp[4] == 7)) {
        const newPiece = piece.substring(0, 1) + inp[5];
        this.board[inp[3]][inp[4]] = newPiece;
        this.board[inp[1]][inp[2]] = 'n';
      } else {
        this.board[inp[3]][inp[4]] = piece;
        this.board[inp[1]][inp[2]] = 'n';
      }

      //Check for En Passant
      if(piece.substring(1,2) == 'p' && Math.abs(inp[4] - inp[2]) == 2) {
        this.passant = [inp[1], (inp[2] + inp[4]) / 2, inp[3], inp[4]];

      }
      if(inp.length == 6 && inp[5] == 'passant') {
        this.board[inp[3]][inp[2]] = 'n';
      }

      //Set Turn
      if(board.toMove == 'w') {
        this.toMove = 'b';
      } else {
        this.toMove = 'w';
      }

    } else {
      this.main = true;
      this.toMove = 'w';
      this.passant = false;
      const board = [['br', 'bp', 'n', 'n', 'n', 'n', 'wp', 'wr'],
                    ['bh', 'bp', 'n', 'n', 'n', 'n', 'wp', 'wh'],
                    ['bb', 'bp', 'n', 'n', 'n', 'n', 'wp', 'wb'],
                    ['bq', 'bp', 'n', 'n', 'n', 'n', 'wp', 'wq'],
                    ['bk', 'bp', 'n', 'n', 'n', 'n', 'wp', 'wk'],
                    ['bb', 'bp', 'n', 'n', 'n', 'n', 'wp', 'wb'],
                    ['bh', 'bp', 'n', 'n', 'n', 'n', 'wp', 'wh'],
                    ['br', 'bp', 'n', 'n', 'n', 'n', 'wp', 'wr']];
      if(rand(0, 1) == 0) {
        this.board = board;
        this.orientation = 0; //White on bottom, black on top
      } else {
        this.orientation = 1; //Black on bottom, white on top
        this.board = [];
        for(let x = 7; x >= 0; x--) {
          let temp = [];
          for(let y = 7; y >= 0; y--) {
            temp.push(board[x][y]);
          }
          this.board.push(temp);
        }
      }
    }

    this.moves = this.getMoves();
  }

  draw() {
    const canvas = document.querySelector('.canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(boardX - edge, boardY - edge, 8 * unit + 2 * edge, 8 * unit + 2 * edge);
    for(let x = 0; x < 8; x++) {
      for(let y = 0; y < 8; y++) {
        ctx.fillStyle = colors[(x + y) % 2];
        ctx.fillRect(boardX + unit * x, boardY + unit * y, unit, unit);
        let pos = false;
        switch(this.board[x][y]) {
          case 'br':
            pos = [4, 1];
            break;
          case 'bh':
            pos = [3, 1];
            break;
          case 'bb':
            pos = [2, 1];
            break;
          case 'bq':
            pos = [1, 1];
            break;
          case 'bk':
            pos = [0, 1];
            break;
          case 'bp':
            pos = [5, 1];
            break;
          case 'wr':
            pos = [4, 0];
            break;
          case 'wh':
            pos = [3, 0];
            break;
          case 'wb':
            pos = [2, 0];
            break;
          case 'wq':
            pos = [1, 0];
            break;
          case 'wk':
            pos = [0, 0];
            break;
          case 'wp':
            pos = [5, 0];
            break;
        }
        if(pos) {
          ctx.drawImage(image, 210 * pos[0], 210 * pos[1], 210, 210, boardX + unit * x, boardY + unit * y, unit, unit);
        }
      }
    }
    if(this.clicked) {
      this.hover(this.clicked[0], this.clicked[1]);
      this.drawMoves(this.clicked[0], this.clicked[1]);
    }
  }

  click(x, y) {
    if(!this.clicked) {
      const piece = this.board[x][y];
      if(piece == 'n' || this.moves[String(x) + String(y)].length == 0) {
        return;
      }
      this.clicked = [x, y];
      this.drawMoves(this.clicked[0], this.clicked[1]);
    } else {
      const key = String(this.clicked[0]) + String(this.clicked[1]);
      const moves = this.moves[key]
      for(let i = 0; i < moves.length; i++) {
        if(moves[i][0] == x && moves[i][1] == y) {
          const move = [this, this.clicked[0], this.clicked[1]];
          this.move(move.concat(moves[i]));
          break;
        }
      }
      this.clicked = false;
      this.draw();
    }
  }

  getMoves() {
    const moves = {};
    for(let x = 0; x < 8; x++) {
      for(let y = 0; y < 8; y++) {
        const key = String(x) + String(y);
        moves[key] = [];
        switch(this.board[x][y]) {
          case 'br':
            if(this.toMove == 'w') {
              break;
            }
            {let off = 1;
            while(valid(x + off, y)) {
              const piece = this.board[x + off][y];
              if(piece.substring(0,1) == 'b') {
                break;
              }
              moves[key].push([x + off, y]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x - off, y)) {
              const piece = this.board[x - off][y];
              if(piece.substring(0,1) == 'b') {
                break;
              }
              moves[key].push([x - off, y]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x, y + off)) {
              const piece = this.board[x][y + off];
              if(piece.substring(0,1) == 'b') {
                break;
              }
              moves[key].push([x, y + off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x, y - off)) {
              const piece = this.board[x][y - off];
              if(piece.substring(0,1) == 'b') {
                break;
              }
              moves[key].push([x, y - off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }}
            break;
          case 'bh':
            if(this.toMove == 'w') {
              break;
            }
            {for(let i = 0; i < horseMovement.length; i++) {
              const move = horseMovement[i];

              if(valid(x + move[0], y + move[1]) && this.board[x + move[0]][y + move[1]].substring(0,1) != 'b') {
                moves[key].push([x + move[0], y + move[1]]);
              }}
            }
            break;
          case 'bb':
            if(this.toMove == 'w') {
              break;
            }
            {let off = 1;
            while(valid(x + off, y + off)) {
              const piece = this.board[x + off][y + off];
              if(piece.substring(0,1) == 'b') {
                break;
              }
              moves[key].push([x + off, y + off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x - off, y + off)) {
              const piece = this.board[x - off][y + off];
              if(piece.substring(0,1) == 'b') {
                break;
              }
              moves[key].push([x - off, y + off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x - off, y - off)) {
              const piece = this.board[x - off][y - off];
              if(piece.substring(0,1) == 'b') {
                break;
              }
              moves[key].push([x - off, y - off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x + off, y - off)) {
              const piece = this.board[x + off][y - off];
              if(piece.substring(0,1) == 'b') {
                break;
              }
              moves[key].push([x + off, y - off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }}
            break;
          case 'bq':
            if(this.toMove == 'w') {
              break;
            }
            {let off = 1;
            while(valid(x + off, y)) {
              const piece = this.board[x + off][y];
              if(piece.substring(0,1) == 'b') {
                break;
              }
              moves[key].push([x + off, y]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x - off, y)) {
              const piece = this.board[x - off][y];
              if(piece.substring(0,1) == 'b') {
                break;
              }
              moves[key].push([x - off, y]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x, y + off)) {
              const piece = this.board[x][y + off];
              if(piece.substring(0,1) == 'b') {
                break;
              }
              moves[key].push([x, y + off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x, y - off)) {
              const piece = this.board[x][y - off];
              if(piece.substring(0,1) == 'b') {
                break;
              }
              moves[key].push([x, y - off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }}
            {let off = 1;
            while(valid(x + off, y + off)) {
              const piece = this.board[x + off][y + off];
              if(piece.substring(0,1) == 'b') {
                break;
              }
              moves[key].push([x + off, y + off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x - off, y + off)) {
              const piece = this.board[x - off][y + off];
              if(piece.substring(0,1) == 'b') {
                break;
              }
              moves[key].push([x - off, y + off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x - off, y - off)) {
              const piece = this.board[x - off][y - off];
              if(piece.substring(0,1) == 'b') {
                break;
              }
              moves[key].push([x - off, y - off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x + off, y - off)) {
              const piece = this.board[x + off][y - off];
              if(piece.substring(0,1) == 'b') {
                break;
              }
              moves[key].push([x + off, y - off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }}
            break;
          case 'bk':
            if(this.toMove == 'w') {
              break;
            }
            {for(let i = 0; i < kingMovement.length; i++) {
              const move = kingMovement[i];
              if(valid(x + move[0], y + move[1]) && this.board[x + move[0]][y + move[1]].substring(0,1) != 'b') {
                moves[key].push([x + move[0], y + move[1]]);
              }
            }}
            break;
          case 'bp':
            if(this.toMove == 'w') {
              break;
            }
            switch(this.orientation) {
              case 0:
                if(valid(x, y + 1) && this.board[x][y + 1] == 'n') {
                  if(y + 1 == 7) {
                    for(let i = 0; i < 4; i++) {
                      moves[key].push([x, y + 1, promotion[i]]);
                    }
                  } else {
                    moves[key].push([x, y + 1]);
                  }

                  if(y == 1 && this.board[x][y + 2] == 'n') {
                    moves[key].push([x, y + 2]);
                  }
                }
                if(valid(x + 1, y + 1) && this.board[x + 1][y + 1].substring(0,1) == 'w') {
                  if(y + 1 == 7) {
                    for(let i = 0; i < 4; i++) {
                      moves[key].push([x + 1, y + 1, promotion[i]]);
                    }
                  } else {
                    moves[key].push([x + 1, y + 1]);
                  }
                }
                if(valid(x - 1, y + 1) && this.board[x - 1][y + 1].substring(0,1) == 'w') {
                  if(y + 1 == 7) {
                    for(let i = 0; i < 4; i++) {
                      moves[key].push([x - 1, y + 1, promotion[i]]);
                    }
                  } else {
                    moves[key].push([x - 1, y + 1]);
                  }
                }
                if(this.passant && y + 1 == this.passant[1] && Math.abs(this.passant[0] - x) == 1) {
                  moves[key].push([this.passant[0], this.passant[1], 'passant']);
                }
                break;
              case 1:
                if(valid(x, y - 1) && this.board[x][y - 1] == 'n') {
                  if(y - 1 == 0) {
                    for(let i = 0; i < 4; i++) {
                      moves[key].push([x, y - 1, promotion[i]]);
                    }
                  } else {
                    moves[key].push([x, y - 1]);
                  }
                  if(y == 6 && this.board[x][y - 2] == 'n') {
                    moves[key].push([x, y - 2]);
                  }
                }
                if(valid(x + 1, y - 1) && this.board[x + 1][y - 1].substring(0,1) == 'w') {

                  if(y - 1 == 0) {
                    for(let i = 0; i < 4; i++) {
                      moves[key].push([x + 1, y - 1, promotion[i]]);
                    }
                  } else {
                    moves[key].push([x + 1, y - 1]);
                  }
                }
                if(valid(x - 1, y - 1) && this.board[x - 1][y - 1].substring(0,1) == 'w') {
                  if(y - 1 == 0) {
                    for(let i = 0; i < 4; i++) {
                      moves[key].push([x - 1, y - 1, promotion[i]]);
                    }
                  } else {
                    moves[key].push([x - 1, y - 1]);
                  }
                }
                if(this.passant && y - 1 == this.passant[1] && Math.abs(this.passant[0] - x) == 1) {
                  moves[key].push([this.passant[0], this.passant[1], 'passant']);
                }
                break;
            }
            break;
          case 'wr':
            if(this.toMove == 'b') {
              break;
            }
            {let off = 1;
            while(valid(x + off, y)) {
              const piece = this.board[x + off][y];
              if(piece.substring(0,1) == 'w') {
                break;
              }
              moves[key].push([x + off, y]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x - off, y)) {
              const piece = this.board[x - off][y];
              if(piece.substring(0,1) == 'w') {
                break;
              }
              moves[key].push([x - off, y]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x, y + off)) {
              const piece = this.board[x][y + off];
              if(piece.substring(0,1) == 'w') {
                break;
              }
              moves[key].push([x, y + off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x, y - off)) {
              const piece = this.board[x][y - off];
              if(piece.substring(0,1) == 'w') {
                break;
              }
              moves[key].push([x, y - off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }}
            break;
          case 'wh':
            if(this.toMove == 'b') {
              break;
            }
            {for(let i = 0; i < horseMovement.length; i++) {
              const move = horseMovement[i];
              if(valid(x + move[0], y + move[1]) && this.board[x + move[0]][y + move[1]].substring(0,1) != 'w') {
                moves[key].push([x + move[0], y + move[1]]);
              }
            }}
            break;
          case 'wb':
            if(this.toMove == 'b') {
              break;
            }
            {let off = 1;
            while(valid(x + off, y + off)) {
              const piece = this.board[x + off][y + off];
              if(piece.substring(0,1) == 'w') {
                break;
              }
              moves[key].push([x + off, y + off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x - off, y + off)) {
              const piece = this.board[x - off][y + off];
              if(piece.substring(0,1) == 'w') {
                break;
              }
              moves[key].push([x - off, y + off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x - off, y - off)) {
              const piece = this.board[x - off][y - off];
              if(piece.substring(0,1) == 'w') {
                break;
              }
              moves[key].push([x - off, y - off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x + off, y - off)) {
              const piece = this.board[x + off][y - off];
              if(piece.substring(0,1) == 'w') {
                break;
              }
              moves[key].push([x + off, y - off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }}
            break;
          case 'wq':
            if(this.toMove == 'b') {
              break;
            }
            {let off = 1;
            while(valid(x + off, y)) {
              const piece = this.board[x + off][y];
              if(piece.substring(0,1) == 'w') {
                break;
              }
              moves[key].push([x + off, y]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x - off, y)) {
              const piece = this.board[x - off][y];
              if(piece.substring(0,1) == 'w') {
                break;
              }
              moves[key].push([x - off, y]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x, y + off)) {
              const piece = this.board[x][y + off];
              if(piece.substring(0,1) == 'w') {
                break;
              }
              moves[key].push([x, y + off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x, y - off)) {
              const piece = this.board[x][y - off];
              if(piece.substring(0,1) == 'w') {
                break;
              }
              moves[key].push([x, y - off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }}
            {let off = 1;
            while(valid(x + off, y + off)) {
              const piece = this.board[x + off][y + off];
              if(piece.substring(0,1) == 'w') {
                break;
              }
              moves[key].push([x + off, y + off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x - off, y + off)) {
              const piece = this.board[x - off][y + off];
              if(piece.substring(0,1) == 'w') {
                break;
              }
              moves[key].push([x - off, y + off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x - off, y - off)) {
              const piece = this.board[x - off][y - off];
              if(piece.substring(0,1) == 'w') {
                break;
              }
              moves[key].push([x - off, y - off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }
            off = 1;
            while(valid(x + off, y - off)) {
              const piece = this.board[x + off][y - off];
              if(piece.substring(0,1) == 'w') {
                break;
              }
              moves[key].push([x + off, y - off]);
              if(piece.substring(0,1) != 'n') {
                break;
              }
              off += 1;
            }}
            break;
          case 'wk':
            if(this.toMove == 'b') {
              break;
            }
            {for(let i = 0; i < kingMovement.length; i++) {
              const move = kingMovement[i];
              if(valid(x + move[0], y + move[1]) && this.board[x + move[0]][y + move[1]].substring(0,1) != 'w') {
                moves[key].push([x + move[0], y + move[1]]);
              }
            }}
            break;
          case 'wp':
            if(this.toMove == 'b') {
              break;
            }
            switch(this.orientation) {
              case 1:
                if(valid(x, y + 1) && this.board[x][y + 1] == 'n') {
                  if(y + 1 == 7) {
                    for(let i = 0; i < 4; i++) {
                      moves[key].push([x, y + 1, promotion[i]]);
                    }
                  } else {
                    moves[key].push([x, y + 1]);
                  }
                  if(y == 1 && this.board[x][y + 2] == 'n') {
                    moves[key].push([x, y + 2]);
                  }
                }
                if(valid(x + 1, y + 1) && this.board[x + 1][y + 1].substring(0,1) == 'b') {
                  if(y + 1 == 7) {
                    for(let i = 0; i < 4; i++) {
                      moves[key].push([x + 1, y + 1, promotion[i]]);
                    }
                  } else {
                    moves[key].push([x + 1, y + 1]);
                  }
                }
                if(valid(x - 1, y + 1) && this.board[x - 1][y + 1].substring(0,1) == 'b') {
                  if(y + 1 == 7) {
                    for(let i = 0; i < 4; i++) {
                      moves[key].push([x - 1, y + 1, promotion[i]]);
                    }
                  } else {
                    moves[key].push([x - 1, y + 1]);
                  }
                }
                if(this.passant && y + 1 == this.passant[1] && Math.abs(this.passant[0] - x) == 1) {
                  moves[key].push([this.passant[0], this.passant[1], 'passant']);
                }
                break;
              case 0:
                if(valid(x, y - 1) && this.board[x][y - 1] == 'n') {
                  if(y - 1 == 0) {
                    for(let i = 0; i < 4; i++) {
                      moves[key].push([x, y - 1, promotion[i]]);
                    }
                  } else {
                    moves[key].push([x, y - 1]);
                  }
                  if(y == 6 && this.board[x][y - 2] == 'n') {
                    moves[key].push([x, y - 2]);
                  }
                }
                if(valid(x + 1, y - 1) && this.board[x + 1][y - 1].substring(0,1) == 'b') {
                  if(y - 1 == 0) {
                    for(let i = 0; i < 4; i++) {
                      moves[key].push([x + 1, y - 1, promotion[i]]);
                    }
                  } else {
                    moves[key].push([x + 1, y - 1]);
                  }
                }
                if(valid(x - 1, y - 1) && this.board[x - 1][y - 1].substring(0,1) == 'b') {
                  if(y - 1 == 0) {
                    for(let i = 0; i < 4; i++) {
                      moves[key].push([x - 1, y - 1, promotion[i]]);
                    }
                  } else {
                    moves[key].push([x - 1, y - 1]);
                  }
                }
                if(this.passant && y - 1 == this.passant[1] && Math.abs(this.passant[0] - x) == 1) {
                  moves[key].push([this.passant[0], this.passant[1], 'passant']);
                }
                break;
            }
            break;
        }
      }
    }

    if(this.check) {
      return moves;
    }

    for(const pos in moves) {
      const moveArr = moves[pos];
      const coord = [parseInt(pos.substring(0,1)),parseInt(pos.substring(1,2))];
      for(let x = moveArr.length - 1; x >= 0; x--) {
        const newBoard = new Board([this, coord[0], coord[1], moveArr[x][0], moveArr[x][1], 'check']);
        if(newBoard.getCheck()) {
          moveArr.splice(x,1);
        }
      }
    }

    return moves;
  }

  drawMoves(x, y) {
    const canvas = document.querySelector('.canvas');
    const ctx = canvas.getContext('2d');
    const moves = this.moves[String(x) + String(y)];
    ctx.fillStyle = 'rgba(255, 0, 0, 0.2';
    for(let i = 0; i < moves.length; i++) {
      ctx.fillRect(moves[i][0] * unit + boardX, moves[i][1] * unit + boardY, unit, unit);
    }
  }

  hover(x, y) {
    const canvas = document.querySelector('.canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(x * unit + boardX, y * unit + boardY, unit, unit);
  }

  move(inp) {
    const newBoard = new Board(inp);
    mainBoard = newBoard;
    mainBoard.main = true;
    mainBoard.draw();
  }

  getCheck() {
    //return true if the not toMove player is in check
    let lookFor = '';
    if(this.toMove == 'w') {
      lookFor = 'bk';
    } else {
      lookFor = 'wk';
    }

    for(const pos in this.moves) {
      for(let x = 0; x < this.moves[pos].length; x++) {
        const move = this.moves[pos][x];
        if(this.board[move[0]][move[1]] == lookFor) {
          return true;
        }
      }
    }

    return false;

  }

}

//Game Vars
let mainBoard = new Board(false);

//Main Functions
function load() {
  const canvas = document.querySelector('.canvas');
  canvas.width = width;
  canvas.height = height;
  mainBoard.draw();
}

function boardHover() {
  const canvas = document.querySelector('.canvas');
  const ctx = canvas.getContext('2d');
  let x = event.clientX;
  let y = event.clientY;
  ctx.clearRect(0, 0, width, height);
  mainBoard.draw();
  if(validPos(x,y)) {
    x = parseInt((x - boardX) / unit)
    y = parseInt((y - boardY) / unit)
    mainBoard.hover(x, y);

  }
}

function boardClick() {
  let x = event.clientX;
  let y = event.clientY;
  if(validPos(x,y)) {
    x = parseInt((x - boardX) / unit);
    y = parseInt((y - boardY) / unit);
    mainBoard.click(x, y);
  }
}

//Useful Functions

function validPos(x, y) {
  return x > boardX && x < boardX + 8 * unit && y > boardY && y < boardY + 8 * unit;
}

function valid(x, y) {
  return x < 8 && x >= 0 && y < 8 && y >= 0;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max-min+1)) + (min);
}

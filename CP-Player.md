here, we will build the computer player

to start

`$ git checkout cp-player`

this branch is the starting point for the lesson

it includes code written to run a 2 player local game

we will now write a cpMove function to select a valid move from the board

we will call the function from `componentDidUpdate` in `Game` when it is newly the computer's turn

the pieces will be updated and rendered

isTurnOver will be refactored out of Game..onClickCell into util..isTurnOver(prevPieces, pieces)

thus it can be used once the cpMove function returns, in order to update the turn when correct to do so.


---

our first draft the CP will randomly select from the list of valid moves

it is certainly possible to write a decent CP arithmetically

it is also possible to do so with an ML algorithm.

likely, the ML will run remotely, as it will likely be written in python!

---

---


./src/Game.js
```js

  onClickCell = (col, row)=> {
    if( this.props.mode === 'cp' && this.state.turn !== 'p1' ) return;
```


./src/App.js
```js
import React, { Component } from 'react';
import './App.css';

import Game from './Game';

class App extends Component {
  state = {
    winner: null,
  }

  onWinner = winner=>
    this.setState({ winner })

  cpMove = (pieces, cpPlayer='p2')=>{
    // this is where we'll decide on our cp move.
    return pieces; // cp will do nothing for now
  }
  
  render() {
    return (
      <div className="App">
        {this.state.winner ? (
           <div className='winner'>
             { this.state.winner } WINS!
           </div>
        ) : (
           <Game onWinner={this.onWinner}
                 rules='strict'
                 mode='cp'
                 cpMove={this.cpMove}
           />
        )}
      </div>
    );
  }
}

export default App;
```

trigger the cp

./src/Game.js
```js
  componentDidUpdate(prevProps, prevState){
    if(
      ( this.props.mode === 'cp' && this.state.turn === 'p2' ) &&
      ( prevState.turn !== 'p2' )
    ) this.makeCPmove();
  }

  makeCPmove = ()=>{
    const cpMove = this.props.cpMove(this.state.pieces, this.state.jumpingFrom);
    console.log(cpMove);

    // if turn is over, delay 500ms -> setState({ turn: 'p1', pieces: nextPieces })

    // if cp jumped and didn't finish turn, delay -> recurse.
  }

```

random decision

- generate list of valid moves
- randomly select one


here, we'll demonstrate that our game works with a cp player, albeit not much of an intellectual.


##### generate list of all valid moves

./src/App.js
```js
import { validMoves, strictValidMoves } from './util';


const playerPieces = pieces.reduce((otherPieces, rowOfPieces, colIndex)=>
      [...otherPieces,
       ...rowOfPieces.map((piece, rowIndex)=> ((piece||'').includes(player) ? [colIndex, rowIndex] : null))
       .filter(i=> i)
      ], []);

    const moves = playerPieces.reduce((movesSoFar, piece)=> [
      ...movesSoFar,
      ...calculateMoves(pieces, piece[0], piece[1], !'jumping'),
    ], []);
```

but this will only generate the list of 1-depth moves

for multijumps which may be available, we need to calculate deeper

... refactor validMoves -> + validMovesCR, also for strict


./src/util.js
```js
export const calculateAllMoves = (pieces, player)=> {
  const playerPieces = calculatePlayerPieces(pieces, player);

  const moves = playerPieces.reduce((movesSoFar, piece)=> [
    ...movesSoFar,
    validMovesCR(pieces, piece[0], piece[1], !'jumping')
      .map(move=> {
        if( Math.abs(move[0] - piece[0]) === 1) return [piece, move];
        else {
          // here we have a jump, need to check for multijump
        }
      }),
  ], []);

};
```

to calculate the next moves on the next state of the board, we must refactor the logic which computes that from Game into a pure function (in util)

by writing all of our logic pure, we'll be able to reuse all of our functions whenever we want!

./src/Game.js
```js
  calculatePiecesAfterMove,

    } else if(selectedMove){
      if(selectedPiece && (col !== jumpingFrom[0] || row !== jumpingFrom[1] || !selectedPiece.includes('king'))) return;
      
      const { jumping, turnOver, pieces } = calculatePiecesAfterMove(
        this.state.pieces,
        [selectedSquare, [col, row]],
        jumpingFrom,
        calculateMoves
      );
      
      const otherPlayer = turn === 'p1' ? 'p2' : 'p1';
      const nextTurn = turnOver ? otherPlayer : turn;
      const nextJumpingFrom = turnOver ? null : [col, row];
      
      this.setState({
        moves: jumping && !turnOver ? moves : [],
        pieces,
        turn: nextTurn,
        jumpingFrom: nextJumpingFrom,
        selectedSquare: nextJumpingFrom,
      }, ()=> turnOver && this.checkEndGame());
    }

```

./src/util.js
```js
export const calculatePiecesAfterMove = (inputPieces, [moveFrom, moveTo], jumpingFrom, calculateMoves )=>{
  let jumping = false;
  let pieces = JSON.parse( JSON.stringify( inputPieces ) );

  const prevClickedSquare = pieces[ moveTo[0] ][ moveTo[1] ];
  
  const prevPiece = pieces[ moveFrom[0] ][ moveFrom[1] ];
  const nextPiece = prevPiece + (
    (moveTo[1] === pieces.length-1 || !moveTo[0]) &&
    !prevPiece.includes('king') ? '-king' : ''
  );
  
  pieces[ moveTo[0] ][ moveTo[1] ] = nextPiece;
  pieces[ moveFrom[0] ][ moveFrom[1] ] = prevClickedSquare;

  if( Math.abs( moveTo[0] - moveFrom[0] ) === 2 ){
    jumping = true;

    // here apply "-jumped" tag to piece for removing it later
    // remember though that kings can rejump pieces
    if( !pieces[ (moveTo[0] + moveFrom[0])/2 ][(moveTo[1] + moveFrom[1])/2 ].includes('jumped') )
      pieces[ (moveTo[0] + moveFrom[0])/2 ][(moveTo[1] + moveFrom[1])/2 ] += '-jumped';
  }


  // if turn is over...
  const moves = calculateMoves(pieces, moveTo[0], moveTo[1], jumping);

  const turnOver = !jumping || ( jumping && !moves.any ) ||
                   
                   (moveTo[0] === jumpingFrom[0] && moveTo[1] === jumpingFrom[1] &&
                    (prevClickedSquare||'').includes('king')) ||
                   
                   (nextPiece.includes('king') && !prevPiece.includes('king'));
  

  if(turnOver)
    pieces = pieces.map( pieceRow => pieceRow.map( cell=> (cell||'').includes('jumped') ? null : cell ));

  return { jumping, turnOver, pieces };
};
```

so now we can calculate all moves

```js
export const calculateAllMoves = (pieces, player)=> {
  const playerPieces = calculatePlayerPieces(pieces, player);

  const moves = playerPieces.reduce((movesSoFar, piece)=> [
    ...movesSoFar,
    ...validMovesCR(pieces, piece[0], piece[1], !'jumping')
      .map(move=> {
        if( (Math.abs(move[0] - piece[0]) === 1) || (!move[1] || move[1] === pieces.length-1) ) return [piece, move];
        else {
          // here we have a jump and are not at end of board, need to check for multijump

          const nextPieces = calculatePiecesAfterMove( pieces, [piece, move], validMoves);
          const nextMoves = validMovesCR(nextPieces, move[0], move[1], !!'jumping');

          console.log(nextMoves);
        }
      }),
  ], []).filter(ms=> ms.length);

  return moves;
};

```






and we can make a move

./src/App.js
```js
    const allMoves = calculateMoves(pieces, 'p2');
    console.log(allMoves);
    
    return allMoves[0]; // pick a move
```


./src/Game.js
```js

  makeCPmove = ()=>{
    const calculateMoves = this.props.rules === 'strict' ? strictValidMoves : validMoves;
    const cpMove = this.props.cpMove(this.state.pieces);
    console.log(cpMove);

    const { jumping, turnOver, pieces } = calculatePiecesAfterMove(
      this.state.pieces,
      cpMove,
      calculateMoves
    );

    setTimeout(()=> this.setState({ pieces, turn: turnOver? 'p1' : 'p2' }), 500);
    // if turn is over, delay 500ms -> setState({ turn: 'p1', pieces: nextPieces })

    // if cp jumped and didn't finish turn, delay -> recurse.
  }
```

...




use timeout to mimic player thinking


...


writing a minimax algorithm

(hope this isn't too technical)

[minimax](https://en.wikipedia.org/wiki/Minimax)

- generate a tree
- fill in leaf node's game state value
- minimax bubble the values
- select a move



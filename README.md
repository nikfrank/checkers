this is a course on how to build a checkers game using reactJS

it covers:

- flex box
- svg in `<img/>`
- svg as `<svg />`
- react lifecycle, state management, network behaviour
- an algorithm! (calculate a list of legal checkers moves at any given board)
- createUser & login & gameplay using a game server (http using fetch)
- writing a game server in dynamoDB + lambda + apiGateway
- another algorithm! (writing a computer player)
- unit testing for algorithms using jest, component testing with enzyme + jest


```
if you can't explain it to freshmen, you don't understand it well enough
                     - r p feynman
```


## agenda

1. 2p local game

- make a board Component
- render game pieces onto the board
- take `onClick` from `<Board pieces={this.state.pieces} />`
- calculate legal checkers moves, test
  - render legal checkers moves as piece on `Board`
- move pieces, giving each player his turn
- calculate when the game has ended, test

2. 1p v cp local

- select cp game or 2p local game
- onUpdate lifecycle -> trigger cp play
- algorithm for selecting move, test

3. 2p over network

- assume game server exists
- create a user UX
- signin UX
- create game UX
- join game UX
- use network hook to send my moves & load other player's moves
- chat?

4. cloud game server

- aws account
- dynamoDB
- POST /user
  - apiGateway, lambda, dynamo table + create call
- /login -> JWT
  - apiGateway, lambda, dynamo check call
- POST /game
  - apiGateway + JWT authorizer, lambda, dynamo table + create call
- /joinTable
  - apiGateway, lambda, dynamo update call
- PUT /game { move }
  - apiGateway, lambda, dynamo update call
- GET /game/:id
  - apiGatewat, lambda, dynamo read call
- chat?


### 2p local game

#### make a board Component

`$ touch ./src/Board.js`

./src/Board.js
```js
import React from 'react';
import './Board.css';

export default ({
  size=8,
  pieces=[[]],
})=> (
  <div className='Board'>
    {Array(size).fill(0).map((_, rowIndex)=> (
      <div key={'row'+rowIndex} className='BoardRow'>
        {Array(size).fill(0).map((_, colIndex)=> (
          <div key={'cell'+rowIndex+','+colIndex} className='BoardCell'>
          </div>
        ) )}
      </div>
    ))}
  </div>
);
```

`$ touch ./src/Board.css`

./src/Board.css
```css
.Board {
  height: 80vh;
  max-height: 80vw;
  
  width: 80vh;
  max-width: 80vw;
  
  margin: 10vh auto;
  background-color: #911;

  display: flex;
  flex-direction: column-reverse;
}

.Board .BoardRow {
  width: 100%;
  display: flex;
  flex-direction: row;
  height: 12.5%;
}

.Board .BoardRow .BoardCell {
  height: 100%;
  width: 12.5%;
}

.Board .BoardRow:nth-child(2n) .BoardCell:nth-child(2n) {
  background-color: black;
}

.Board .BoardRow:nth-child(2n+1) .BoardCell:nth-child(2n+1) {
  background-color: black;
}
```

[read about nth child selectors](https://www.google.com/search?q=nth+child+css)


./src/App.js
```js
import Board from './Board';

//...

render(){
  return (
    <div className='App'>
      <Board />
    </div>
  );
}
```

./src/App.css
```css
.App {
  text-align: center;
  width: 100%;
}

/* we can delete the rest of this file! */
```

great, our board looks fantastic



#### render game pieces onto the board

let's make a `Piece` Component

`$ touch ./src/Piece.js`

./src/Piece.js
```js
import React from 'react';

export default ({
  glyph='circle'
})=> (
  <svg className='Piece' viewBox='0 0 100 100'>
    <circle r={20} cx={50} cy={50} fill={glyph === 'p1' ? 'grey' : 'green'}/>
  </svg>
);
```

so we can render it from `Board`

./src/Board.js
```js
import React from 'react';
import './Board.css';

import Piece from './Piece';

const defaultPieces = [
  [ 'p1', null, 'p1', null, null, null, 'p2', null ],
  [ null, 'p1', null, null, null, 'p2', null, 'p2' ],
  [ 'p1', null, 'p1', null, null, null, 'p2', null ],
  [ null, 'p1', null, null, null, 'p2', null, 'p2' ],
  [ 'p1', null, 'p1', null, null, null, 'p2', null ],
  [ null, 'p1', null, null, null, 'p2', null, 'p2' ],
  [ 'p1', null, 'p1', null, null, null, 'p2', null ],
  [ null, 'p1', null, null, null, 'p2', null, 'p2' ],
];

export default ({
  size=8,
  pieces=defaultPieces,
})=> (
  <div className='Board'>
    {Array(size).fill(0).map((_, rowIndex)=> (
      <div key={'row'+rowIndex} className='BoardRow'>
        {Array(size).fill(0).map((_, colIndex)=> (
          <div key={'cell'+rowIndex+','+colIndex} className='BoardCell'>
            {pieces[colIndex] && pieces[colIndex][rowIndex] ? (
               <Piece glyph={pieces[colIndex][rowIndex]} />
            ) : null}
          </div>
        ) )}
      </div>
    ))}
  </div>
);
```

great, that looks fantastic

we should move those pieces into the `state` on `App`

./src/App.js
```js
import React, { Component } from 'react';
import './App.css';

import Board from './Board';

const initCheckersBoard = [
  [ 'p1', null, 'p1', null, null, null, 'p2', null ],
  [ null, 'p1', null, null, null, 'p2', null, 'p2' ],
  [ 'p1', null, 'p1', null, null, null, 'p2', null ],
  [ null, 'p1', null, null, null, 'p2', null, 'p2' ],
  [ 'p1', null, 'p1', null, null, null, 'p2', null ],
  [ null, 'p1', null, null, null, 'p2', null, 'p2' ],
  [ 'p1', null, 'p1', null, null, null, 'p2', null ],
  [ null, 'p1', null, null, null, 'p2', null, 'p2' ],
];

class App extends Component {
  state = {
    pieces: initCheckersBoard,
  }
  
  render() {
    return (
      <div className="App">
        <Board pieces={this.state.pieces}/>
      </div>
    );
  }
}

export default App;
```


#### take `onClick` from `<Board pieces={this.state.pieces} />

./src/App.js
```js
//...

class App extends Component {
  state = {
    pieces: initCheckersBoard,
  }

  onClickCell = (col, row)=> console.log(col, row, this.state.pieces[col][row])

  render() {
    return (
      <div className="App">
        <Board pieces={this.state.pieces} onClick={this.onClickCell}/>
      </div>
    );
  }
}

export default App;
```


./src/Board.js
```js
//...

export default ({
  size=8,
  onClick=(()=>0),
  pieces=[[]],
})=> (
//...
          <div key={'cell'+rowIndex+','+colIndex}
               onClick={()=> onClick(colIndex, rowIndex)}
               className='BoardCell'>
//...
```

great, now we see the coordinates and current occupant piece logged

now we can start the game logic


#### calculate legal checkers moves, test

now, in our `onClickCell` function, we can respond to the input by displaying legal moves on the board

when writing an algorithm (even simple ones like this) I like to do some pseudo code first

```
user selected a piece (assert it to be his turn and his piece)

a simple piece can - at very least - move forward diagonally into empty squares
  -> list all empty spaces forward diagonal one move

a king can - at the very least - move in any diagonal into an empty space
  -> list all empty spaces diagonal one move

a simple piece can capture by jumping a piece diagonally in front of it with an empty space beyond it
  -> list all empty spaces forward diagonal two moves with an opponent piece diagonal one

a king can capture by jumping a piece diagonally any direction with an empty space beyond it
  -> list all empty spaces diagonal two moves with an opponent piece diagonal one

when a piece hits the end of the board it becomes a king (can move/jump backwards)

a piece may continue jumping opponent pieces suchly until no valid moves exist

a piece that becomes a king by jumping to the end of the board may continue jumping as a king

if there is a jumping move available, non-jumping moves are filtered out

opponent's pieces jumped in the middle of a turn are not removed until the end of the turn.

player may end turn if he has jumped his piece back to a space the piece was on previously (ko)
```

in order to keep our user experience simple, we will show only the 'single jump' moves on the board

when a second jump is available, the player will be presented withose options once he has chosen his first jump.

his turn will end once there are no more moves available or he uses the ko rule when jumping with a king.

if a player has no pieces or no valid moves, he loses.


---


#### calculate valid non-jump moves

./src/App.js
```js
  onClickCell = (col, row)=> {
    const selected = this.state.pieces[col][row];
    
    if( !selected ) return;

    // start with two possible moves, filter out if off-board or occupado
    const validMoves = [ [col+1, row+1], [col-1, row+1] ]
      .filter(([c, r])=> (
        c >= 0 && c <= 7 && !this.state.pieces[c][r]
      ));

    // generate "board layer" for moves as Array[8][8]
    const moves = Array(8).fill(0).map(()=> Array(8).fill(false));

    validMoves.forEach(([c, r])=> (moves[c][r] = true));

    this.setState({ moves });
  }
```



#### render legal checkers moves as piece on `Board`

./src/Piece.js
```js
import React from 'react';

const glyphColors = {
  p1: 'grey',
  p2: 'green',
  move: 'yellow',
};

const glyphSizes = {
  p1: 20,
  p2: 20,
  move: 5,
};

export default ({
  glyph='circle'
})=> (
  <svg className='Piece' viewBox='0 0 100 100'>
    <circle r={glyphSizes[glyph]} cx={50} cy={50} fill={glyphColors[glyph]}/>
  </svg>
);
```

./src/Board.js
```js
//...

export default ({
  //..,
  moves=[[]],
})=> (


//...
            {moves[colIndex] && moves[colIndex][rowIndex] ? (
               <Piece glyph='move' />
            ) : null}

```


#### click on "available move" space to trigger game board update

./src/App.js
```js

  state = {
    pieces: initCheckersBoard,
    selectedPiece: null,
    moves: [],
  }

  onClickCell = (col, row)=> {
    const selectedPiece = this.state.pieces[col][row];
    const selectedMove = (this.state.moves[col]||[])[row];
    
    if( !selectedPiece && !selectedMove ) return;

    if(selectedPiece){
      // ... logic from before ...
      
    } else if(selectedMove){

      const pieces = JSON.parse( JSON.stringify( this.state.pieces ) );

      pieces[this.state.selectedPiece[0]][this.state.selectedPiece[1]] = null;
      pieces[col][row] = 'p1';
      
      this.setState({ moves: [], pieces });
    }
  }
```

great, now we can repeatedly move our pieces around.

This still isnt' a game though, as only one player can move and there's no way to win!



#### giving each player his turn


./src/App.js
```js
    if(selectedPiece && selectedPiece === this.state.turn){
      const direction = selectedPiece === 'p1' ? 1 : -1;
      

      // calculate valid non-jumping moves
      // start with two possible moves, filter out if off-board or occupado
      const nonjumpMoves = [ [col+1, row+direction], [col-1, row+direction] ]
        .filter(([c, r])=> (
          c >= 0 && c <= 7 &&
          r >= 0 && r <= 7 &&
          !this.state.pieces[c][r]
        ))
//...

      pieces[col][row] = this.state.turn;

      // if turn is over...
      this.setState({ moves: [], pieces, turn: this.state.turn === 'p1' ? 'p2' : 'p1' });
```



#### jumps

```js
      const otherPlayer = (selectedPiece === 'p1') ? 'p2' : 'p1';
      
      // compute list of valid jump moves, if any
      // start with two possible moves, filter out off-board, occupado, no piece to jump
      const jumpMoves = [ [col+2, row + 2*direction], [col-2, row + 2*direction] ]
        .filter(([c, r])=> (
          c >= 0 && c <= 7 &&
          r >= 0 && r <= 7 &&
          !this.state.pieces[c][r] &&
          (this.state.pieces[ (c + col)/2 ][ (r + row)/2 ]||'').includes(otherPlayer)
        ));

      (jumpMoves.length ? jumpMoves : nonjumpMoves).forEach(([c, r])=> (moves[c][r] = true));

```

at move selected

```js
      let pieces = JSON.parse( JSON.stringify( this.state.pieces ) );

      pieces[this.state.selectedPiece[0]][this.state.selectedPiece[1]] = null;

      if( Math.abs( col - this.state.selectedPiece[0] ) === 2 ){
        // jumping
        pieces[ (col + this.state.selectedPiece[0])/2 ][(row + this.state.selectedPiece[1])/2 ] += '-jumped';
      }
      
      pieces[col][row] = this.state.turn;


      // if turn is over...
      pieces = pieces.map( pieceRow => pieceRow.map( cell=> (cell||'').includes('jumped') ? null : cell ));
      
      this.setState({ moves: [], pieces, turn: this.state.turn === 'p1' ? 'p2' : 'p1' });

```


#### keep jumping (calculate if move is over)

let's refactor our valid moves logic into a utility function, which we can reuse and test

`$ touch ./src/util.js`


./src/util.js
```js
export const validMoves = (pieces, col, row, turn)=>{
  
}
```

./src/App.js
```js
import { validMoves } from './util';

//...

      const moves = validMoves(this.state.pieces, col, row);
```


./src/util.js
```js
export const validMoves = (pieces, col, row)=>{
  const selectedPiece = pieces[col][row];
  const direction = selectedPiece === 'p1' ? 1 : -1;
  const otherPlayer = (selectedPiece === 'p1') ? 'p2' : 'p1';

  // calculate valid non-jumping moves
  // start with two possible moves, filter out if off-board or occupado
  const nonjumpMoves = [ [col+1, row+direction], [col-1, row+direction] ]
    .filter(([c, r])=> (
      c >= 0 && c <= 7 &&
      r >= 0 && r <= 7 &&
      !pieces[c][r]
    ));

  // compute list of valid jump moves, if any
  // start with two possible moves, filter out off-board, occupado, no piece to jump
  const jumpMoves = [ [col+2, row + 2*direction], [col-2, row + 2*direction] ]
    .filter(([c, r])=> (
      c >= 0 && c <= 7 &&
      r >= 0 && r <= 7 &&
      !pieces[c][r] &&
      (pieces[ (c + col)/2 ][ (r + row)/2 ]||'').includes(otherPlayer)
    ));
  
  // generate "board layer" for moves as Array[8][8]
  const moves = Array(8).fill(0).map(()=> Array(8).fill(false));
  const valid = (jumpMoves.length ? jumpMoves : nonjumpMoves);

  valid.forEach(([c, r])=> (moves[c][r] = true));

  return moves;
};
```

now we can reuse this logic in the (selectedMove) section to determine if the move is over

./src/App.js
```js

      // if turn is over...
      const moves = validMoves(pieces, col, row, !!'jumping');

      if( !moves.any )
        pieces = pieces.map( pieceRow => pieceRow.map( cell=> (cell||'').includes('jumped') ? null : cell ));

      const otherPlayer = this.state.turn === 'p1' ? 'p2' : 'p1';
      const nextTurn = moves.any ? this.state.turn : otherPlayer;
                       
      this.setState({ moves, pieces, turn: nextTurn });
```

(here I say `!!'jumping'` instead of `true` - which are the same value - because `!!'jumping'` is self-documenting)

there's a problem now though... we've caused an infinite loop for one player

let's fix this

- keep track of jumping piece, if jumpingPiece -> assume it is selected

```
    jumpingPiece: null,

//...

      const jumpingPiece = moves.any ? [col, row] : null;
                       
      this.setState({ moves, pieces, turn: nextTurn, jumpingPiece });


//... earlier
    const { jumpingPiece } = this.state;
    if( jumpingPiece && selectedPiece ) return;
```

now we can tell the valid moves function we are jumping, and so don't ever return non-jumping moves

./src/util.js
```js
export const validMoves = (pieces, col, row, isJumping)=>{
//...

  const valid = (jumpMoves.length ? jumpMoves : isJumping ? [] : nonjumpMoves);
  moves.any = !!valid.length;
```

now we can finish multi-jump for non king pieces

```js
else if(selectedMove){

      let jumping = false;
      let pieces = JSON.parse( JSON.stringify( this.state.pieces ) );
      
      pieces[this.state.selectedPiece[0]][this.state.selectedPiece[1]] = null;

      if( Math.abs( col - this.state.selectedPiece[0] ) === 2 ){
        // jumping
        jumping = true;
        pieces[ (col + this.state.selectedPiece[0])/2 ][(row + this.state.selectedPiece[1])/2 ] += '-jumped';
      }
      
      pieces[col][row] = this.state.turn;


      // if turn is over...
      const moves = validMoves(pieces, col, row, jumping);

      if( jumping && !moves.any )
        pieces = pieces.map( pieceRow => pieceRow.map( cell=> (cell||'').includes('jumped') ? null : cell ));

      const otherPlayer = this.state.turn === 'p1' ? 'p2' : 'p1';
      const nextTurn = jumping && moves.any ? this.state.turn : otherPlayer;
      const jumpingPiece = moves.any && jumping ? [col, row] : null;
                       
      this.setState({
        moves: jumping ? moves : [],
        pieces,
        turn: nextTurn,
        jumpingPiece,
        selectedPiece: jumpingPiece,
      });
    }
```


#### testing our game logic

`$ touch ./src/util.test.js`

remember all create-react-app made applications can use `npm run test` to run jest tests (which looks for files *.test.js)

`npm run test`




#### king moves (tdd)





#### calculate when the game has ended, test

this is a course on how to build a checkers game using reactJS

it covers:

- flex box
- svg as `<svg />` in react
- react lifecycle, state management, impure / network behaviour
- an algorithm! (calculate a list of legal checkers moves at any given board)
- createUser & login & gameplay using a game server (http using fetch / socket.io)
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

player may end turn at any time while jumping with a king (ko).
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
  const selectedPiece = pieces[col][row] || '';
  const direction = selectedPiece.includes('p1') ? 1 : -1;
  const otherPlayer = selectedPiece.includes('p1') ? 'p2' : 'p1';

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
  moves.any = valid.length;
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

./src/util.test.js
```js
import { validMoves } from './util';

it('should allow non-jump moves', ()=>{
  
});

it('should allow jump moves and not non-jump moves', ()=>{
  
});
```

now we can write some test cases for our `validMoves` function, to be sure it returns the correct moves

let's copy the `initPieces` from App.js into util to use for testing non-jump moves

./src/App.js
```js
import { validMoves, initCheckersBoard } from './util';

//...
```

./src/util.js
```js
//...

export const initCheckersBoard = [
  [ 'p1', null, 'p1', null, null, null, 'p2', null ],
  // etc
];
```

```js
import { validMoves, initCheckersBoard } from './util';

it('should allow non-jump moves', ()=>{
  const edgeMoves = validMoves( initCheckersBoard, 0, 2, !'jumping' );
  expect( edgeMoves.any ).toEqual( 1 );
  expect( edgeMoves[1][3] ).toEqual( true );
  expect( edgeMoves[0][3] ).toEqual( false );

  const backMoves = validMoves( initCheckersBoard, 1, 1 );
  expect( backMoves.any ).toEqual( 0 );

  const middleMoves = validMoves( initCheckersBoard, 2, 2 );
  expect( middleMoves.any ).toEqual( 2 );
});
```



remember all create-react-app made applications can use `npm run test` to run jest tests (which looks for files *.test.js)

`npm run test`


now that the tests are running (we can break them just to see that they work lol!), let's write our jumping cases

we'll start by copying the board. Then we'll pretend to move pieces and see which moves would be allowed

./src/util.test.js
```js
///

it('should allow jump moves and not non-jump moves', ()=>{
  const pieces = JSON.parse( JSON.stringify( initCheckersBoard ) );

  // pretend to play
  pieces[1][5] = null;
  pieces[2][4] = 'p2';

  // here if it were p2's turn [2][4] could move to [3][3] or [1][3]
  const nonjumpMoves = validMoves(pieces, 2, 4);

  expect( nonjumpMoves.any ).toEqual( 2 );
  expect( nonjumpMoves[0][2] ).toEqual( false );
  expect( nonjumpMoves[3][3] ).toEqual( true );
  expect( nonjumpMoves[1][3] ).toEqual( true );


  // p1 sacrifices a piece
  pieces[0][2] = null;
  pieces[1][3] = 'p1';
  
  // now p2 should be able to jump from [2][4] the p1 on [1][3] to [0][2]
  // and should not be able to move to [3][3]

  const jumpMoves = validMoves(pieces, 2, 4);

  expect( jumpMoves.any ).toEqual( 1 );
  expect( jumpMoves[0][2] ).toEqual( true );
  expect( jumpMoves[3][3] ).toEqual( false );
});
```

testing `isJumping` mode:

the only difference in `isJumping` mode is that when no jumps are available, non-jump moves are not valid


./src/util.test.js
```js
//...

it('should not allow non-jumps while already jumping', ()=>{
  const noMoves = validMoves( initCheckersBoard, 0, 2, 'jumping' );
  expect( noMoves.any ).toEqual( 0 );
});
```

here, we're pretending that the front left piece already jumped to get to the starting position... all we need to test is that `isJumping` doesn't allow non-jump moves, so this will be sufficient for now.




#### rendering the king

in `this.state.pieces` we've been using `'p1'` and `'p2'` for pieces and `null` for empty squares

now we'll need to add kings to the specification

let's take advantage of the `.includes` expressions we wrote earlier by using `'p1-king'` and `'p2-king'` for kings

this will also make it pretty easy to know what's going on.


first, let's put a king on the board and render a crown on it.

For artistic reasons, I will draw the crown from the bird's-eye view, which will allow me to just draw a ring! (very easy)


temporarily

./src/util.js
```js
//...
export const initCheckersBoard = [
  [ 'p1', null, 'p1-king', null, null, null, 'p2', null ],
//...
```

we'll see the piece disappear from the board, as we aren't checking for it in the `Piece` render

although if we click it, its moves still appear, as validMoves uses `.includes('p1')` which will still work for kings

strangely, when we click the available move, our king turns back into a `'p1'`, which is due to our movement logic assuming the piece to not be a king.

let's fix these bugs first, then add the king movement feature and becoming king logic.

./src/Piece.js
```js
import React from 'react';

const glyphColors = {
  p1: 'grey',
  'p1-king': 'grey',
  p2: 'green',
  move: 'yellow',
  king: 'gold',
};

const glyphSizes = {
  p1: 20,
  'p1-king': 20,
  p2: 20,
  move: 5,
  king: 10,
};

export default ({
  glyph='circle'
})=> (
  <svg className='Piece' viewBox='0 0 100 100'>
    <circle r={glyphSizes[glyph]} cx={50} cy={50} fill={glyphColors[glyph]}/>
    {glyph.includes('king') ? [
       <circle r={glyphSizes.king + 3} cx={50} cy={50} fill={glyphColors.king} key='ring'/>,
       <circle r={glyphSizes.king} cx={50} cy={50} fill={glyphColors[glyph]} key='fill'/>
    ] : null}
  </svg>
);
```

so the king will show up with his crown

now let's fix the bug when we move the king, that it turns back into a soldier

we have

./src/App.js
```js
//...

      pieces[this.state.selectedPiece[0]][this.state.selectedPiece[1]] = null;

//...

      pieces[col][row] = this.state.turn;

//...
```

which sets the piece in the place we're moving to - to 'p1' or 'p2' based on whose turn it is

we need to fix this so that it sets it to whatever the piece was before we moved it!


we can update fix it by doing

```js

      pieces[col][row] = pieces[this.state.selectedPiece[0]][this.state.selectedPiece[1]];
      pieces[this.state.selectedPiece[0]][this.state.selectedPiece[1]] = null;

```

great, now we can move the king around, but only as if it is a normal piece! Let's add the king feature now.


#### king moves (tdd)

##### calculate validMoves for kings

- kings can move backwards
- kings can capture backwards
- kings, while jumping, can quit jumping
  - we can implement this by jumping to the current square
  - our `onClickCell` will have to understand this as `turn over`


#### calculate when the game has ended, test





---
---


### computer player

#### install react-router-dom

put three routes:

- 2p local (as before)
- cp local (new)
- network 2p (coming soon...)


refactor App -> Game, make new App = (routing)

`<Game playerType='cp local' deal={newCard} cp={cpPlayer} onComplete={winner=> window.alert(winner + ' won!')}/>`

render a navbar withe three choices



#### create an impure / network layer

refactor newCard into a prop function

write cp chooseMove (random at first)

trigger state update (move piece) from prop function async


#### unit test the cp player, improve cp play


#### install enzyme
#### test the entire 2p local flow
#### mock the network layer and test the cp mode
#### mock the network layer and test the network 2p mode

---
---

#### integrate to the game server
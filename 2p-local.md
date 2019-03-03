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
  - calculate valid non-jump moves
  - render legal checkers moves as piece on `Board`
- click on "available move" space to trigger game board update (move pieces)
- giving each player his turn
- jumps
  - refactor the algorithm
  - keep jumping (calculate if move is over)
- testing our game logic
- rendering the king
- king moves (tdd)
  - calculate validMoves for kings
  - ending multijump for kings
  - becoming a king
- calculate when the game has ended, test



### getting started

`$ cd code`
`$ create-react-app checkers`

if you don't have `create-react-app` installed

`$ npm i -g create-react-app`

this may require `sudo` on linux / mac, or "run git bash as administrator" on windows

if you don't have `npm`, it comes with `node` (google: install nodejs)

after `create-react-app` is done running

`$ cd checkers`
`$ npm start`

the default react app will now be running in your browser at [localhost:3000](http://localhost:3000)

it will be convenient to open another shell (mac: "terminal", windows: "git bash") to do the commands while devving, so the server can be left running the entire time (with automatic refreshing for live updates!)


### git

each section of the course notes is a good size for a git commit

anyone seriously interested in professional js dev should make a github repo to push work to while learning!


### 2p local game

#### make a Board Component

`$ touch ./src/Board.js`
`$ touch ./src/Board.css`

let's render the Board already!

./src/App.js
```js
import React, { Component } from 'react';
import './App.css';
import Board from './Board';

class App extends Component {
  render(){
    return (
      <div className='App'>
        <Board />
      </div>
    );
  }
}

export default App;
```

./src/App.css
```css
.App {
  text-align: center;
  width: 100%;
}

/* we can delete the rest of this file! */
```


ok, we get an error that Board doesn't exist. That makes sense... let's make the Board Component then:

```
the Board is a wee bit advanced syntax-wise, so it may be worth copy-pasting now and reviewing later

the main learning of this workshop is the user interaction game flow, so keep your focus for that if need be.
```

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

<details>
<summary>
TLDR: it's a nested loop that renders `div`s
<br/>
click the zippy to read full explanation
</summary>

- import React; we need to do this whenever we use JSX tags in a file
- import './Board.css'; we'll make this file next to colour the board
- 
- export default ({ ... })=> ( <JSX/> );
  - we are exporting a function which will define what is a `<Board />`
  - [React's docs about function components](https://reactjs.org/docs/components-and-props.html)
    - these docs don't use [fat arrows](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) (=>) or [destructuring + default values](http://2ality.com/2015/01/es6-destructuring.html) ({ propName })
    - fat arrows and destructuring are great, default values are useful here
    - so you can read both pages and put two and two together!
- ({ size=8 })=> ...
  - we are destructuring `size` from the Board Component's props
  - when we render `<Board />` later size will default to 8
  - if we render `<Board size={12} />`, the size prop will be 12 and will ignore the default value
- ({ pieces=[[]] })=> ...
  - we are destructuring `pieces` from the Board Component's props
  - we will represent the board as a two dimensional array
  - it is convenient to default to an empty 2D array `[[]]` so we won't throw any silly null pointer bugs
- ({ ...props })=> ( <JSX />)
  - this is the pattern for a simple Component in React (which doesn't use `state`, only props)
    - `props => (<JSX/>)`
  - the first (parens) are around the parameters
    - we have one param `props` which we destructure
    - props originially may have looked like `{ size: 12, pieces: [[ 'p1', null ], [null, 'p2']] }`
    - we destructure `size` and `pieces` directly into variables
  - the second (parens) after the `=>` fat arrow wrap an expression
    - fat arrows can be "one line functions" which evaluate an expression and return it
    - here the expression we're evaluating is a bunch of JSX
    - React will take the JSX we return, convert it to real HTML elements and put it in the document for us
- `<div className='Board'>`
  - JSX gives us all the standard HTML elements
  - it does change `class='Board'` to `className='Board'` as `class` is a reserved word in js
  - we will style the board using `.Board { ... }` in our CSS in the next step
- `{Array(size).fill(0).map((_, rowIndex)=> ( <JSX/> ))}`
  - we start by breaking out of HTML mode using curlies `{ ... }`
  - [React's docs on JSX](https://reactjs.org/docs/introducing-jsx.html)
  - now we get to write a single js expression, which should evaluate to JSX or a string
    - that string (TextNode) or JSX will be the child of the `div` we already made
  - we want to [generate an array from scratch](https://stackoverflow.com/questions/3746725/create-a-javascript-array-containing-1-n)
  - if you write Python: yes, [list comprehension](https://www.pythonforbeginners.com/basics/list-comprehensions-in-python) is nicer in Python.
  - we [.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) the array
  - `(_, rowIndex)=> ( <JSX /> )`
    - ignoring the `0` we filled the array with `_`, using the index param as `rowIndex`
    - we return a `<div key={'row'+rowIndex} className='BoardRow'>` for every element in the array
      - `key` is a special [React prop](https://reactjs.org/docs/lists-and-keys.html) which is the unique id for elements in loops
      - we can style each row using `.BoardRow { ... }` in our CSS in the next step
  - inside the row, we nest another copy of the loop to put `size` number of cells into each of our `size` number of rows
- then we close all our brackets... non-js people love this part!
</details>
<br/>

what is important to realize here is that when we get to the .BoardCell div in the middle, we have `colIndex` and `rowIndex`, so we'll be able to render each square (and any piece on it) on the board based on that


now that we have a bunch of divs, let's style them to look like a checkers board

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
```

first, we're fixing the board to be in the middle of most of the screen

if `display: flex;` is new to you, [css tricks has a great cheat sheet](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)


```css
.Board .BoardRow {
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-grow: 1;
}
```

our Board will be two nested flex boxes, the Board contains rows, each row contains cells

`flex-grow` will size our rows to take up equal shares of the Board's height, and our cells to take an equal share of the row's width


```css
.Board .BoardRow .BoardCell {
  position: relative;
  min-height: 100%;
  flex-grow: 1;
}
```

BoardCell needs `min-height` because css won't give a height to an empty div


```css
.Board .BoardRow:nth-child(2n) .BoardCell:nth-child(2n) {
  background-color: black;
}

.Board .BoardRow:nth-child(2n+1) .BoardCell:nth-child(2n+1) {
  background-color: black;
}
```

[read about nth child selectors](https://www.google.com/search?q=nth+child+css)

here we want to select (even, even) and (odd, odd) coordinate squares to colour black

(even, odd) and (odd, even) will remain brick red `#911` as is the `background-color` of the Board

[css tricks again has a great article on css colours](https://css-tricks.com/8-digit-hex-codes/) definitely worth a look!


**anyone who copy pasted** (or anyone interested): once this is running in the browser, it is very interesting to inspect it from chrome's devtools

the elements panel will let you see all the `div`s we generated in ./src/Board.js, and hovering the tags will give you a sense for how the CSS works


great, our board looks fantastic, let's put pieces on it

---


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

               <Piece glyph={pieces[colIndex][rowIndex]} />

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


#### take `onClick` from `<Board pieces={this.state.pieces} />`

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
  onClick=(()=>0),  // this default value is a function that does nothing, or else we might get a "undefined is not a function"
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

so we're ready to write our first (little) algorithm - listing valid moves

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

some people say "if ANY of your pieces can capture you must"... that's not how I learned the game as a kid.

Feel free to code that though eh!
```

in order to keep our user experience simple, we will show only the 'single jump' moves on the board

when a second jump is available, the player will be presented withose options once he has chosen his first jump, and must jump.

his turn will end once there are no more moves available or he uses the ko rule when jumping with a king.

if a player has no pieces or no valid moves at the beginning of his turn, he loses.

---


##### calculate valid non-jump moves

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

`onClickCell`, when written this way: `onClickCell = ()=> { ... }` inside the `class` will be available as `this.onClickCell(...)`

here we read the piece which was clicked

if there isn't a piece there, don't need to do anything

then we calculate all possible moves, and update the state with them

`this.setState({ moves })` is the same as `this.setState({ moves: moves })` which will save our calculated value to `this.state.moves`


##### render legal checkers moves as piece on `Board`

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

good thing we programmed those colors and sizes into a dictionary pattern... that made it really easy to extend

./src/Board.js
```js
//...

export default ({
  //..,
  moves=[[]],
})=> (


//...
            <Piece glyph={pieces[colIndex][rowIndex]}/>
            <Piece glyph={(moves[colIndex]||[])[rowIndex] && 'move'} />

```

here, after we've rendered the Piece (if any), we render the move dot

we need to do `(moves[colIndex]||[])[rowIndex]` in stead of just `moves[colIndex][rowIndex]` because moves[colIndex] might not exist, which will then throw a 'cannot read index 0 of undefined' bug

|| in js is a bit different than just "boolean OR"... it's more like "if the left is truthy use it, if it's falsy use the right side", so we can use it as a default operator when we want.

&& in js is also a bit different than "boolean AND" in a similar way... "if the left is truthy use the right, if the left is falsy use the left"

so together, we read (the move value or undefined), which if truthy (undefined is falsy) will use 'move' as the evaluated outcome of the expression. So then the Piece component will get 'move' to render the yellow dot when it should, and some falsy value otherwise (which Piece knows to render nothing for)

./src/App.js
```js
//...

        <Board pieces={this.state.pieces} moves={this.state.moves} onClick={this.onClickCell}/>
```

finally we pass the moves 2D array to the Board component from our `App`s `state`

now we should be able to click on pieces and see the available non-jump moves, so next we'll want to be able to move them



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

note that I've renamed `selected` to `selectedPiece` in order to differentiate it from `selectedMove` which describes if or if not a square can be moved to.


great, now we can repeatedly move our pieces around.

This still isn't a game though, as only one player can move and there's no way to win!



#### giving each player his turn

the players move in different directions, so we'll need to give different options when they each want to move.

./src/App.js
```js
    if(selectedPiece && selectedPiece === this.state.turn){
      const direction = selectedPiece === 'p1' ? 1 : -1; // player 1 moves up, player 2 moves down
      

      // calculate valid non-jumping moves
      // start with two possible moves, filter out if off-board or occupado
      const nonjumpMoves = [ [col+1, row+direction], [col-1, row+direction] ] // row+direction is a space one row forward
        .filter(([c, r])=> (
          c >= 0 && c <= 7 &&
          r >= 0 && r <= 7 &&
          !this.state.pieces[c][r]
        ))
//...

      pieces[this.state.selectedPiece[0]][this.state.selectedPiece[1]] = null;
      pieces[col][row] = this.state.turn;

      // if turn is over... switch whose turn it is
      this.setState({ moves: [], pieces, turn: this.state.turn === 'p1' ? 'p2' : 'p1' });
```

here we create the turn toggling effect with a ternary operator - what fun!

now if we can just get the jumping working, we'll almost have a game


#### jumps

jumping and moving are really the same thing

we'll need to compute different spaces, and make more changes when the user picks it - but the flow is exactly the same

- click a piece
- compute valid moves
- show the user the valid moves
- user clicks a valid move
- update `this.state.pieces` based on the selections

./src/App.js
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

      // this is how we force the piece to jump if it can
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


      // if turn is over... remove the jumped pieces from the board
      pieces = pieces.map( pieceRow => pieceRow.map( cell=> (cell||'').includes('jumped') ? null : cell ));
      
      this.setState({ moves: [], pieces, turn: this.state.turn === 'p1' ? 'p2' : 'p1' });

```

and that's it.

now that our game (almost) works,  we can  start cleaning up our code


##### refactor the algorithm

let's refactor our valid moves logic into a utility function, which we can reuse and test

`$ touch ./src/util.js`


./src/util.js
```js
export const validMoves = (pieces, col, row, turn)=>{
  // we'll fill this in in a bit
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

##### keep jumping (calculate if move is over)

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
  'p1-jumped': '#444',
  p2: 'green',
  'p2-king': 'green',
  'p2-jumped': '#5a0',
  move: 'yellow',
  king: 'gold',
};

const glyphSizes = {
  p1: 20,
  'p1-king': 20,
  'p1-jumped': 8,
  p2: 20,
  'p2-king': 20,
  'p2-jumped': 8,
  move: 5,
  king: 10,
};

export default ({
  glyph='circle'
})=> (
  <svg className='Piece' viewBox='0 0 100 100'>
    <circle r={glyphSizes[glyph]} cx={50} cy={50} fill={glyphColors[glyph]}/>
    {(glyph||'').includes('king') ? [
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

so TDD means we write the test first... giddee up!

let's make a king-scenario board in util

./src/util.js
```js
// ... we can also put out iniCheckersBoard back to normal


export const kingCheckersBoard = [
  [ 'p1', null, null, null, null, null, 'p1-king', null ],
  [ null, 'p1', null, 'p2', null, 'p2', null, null ],
  [ 'p1', null, 'p1', null, null, null, 'p2', null ],
  [ null, 'p1', null, 'p2', null, 'p2', null, 'p2' ],
  [ 'p1', null, null, null, null, null, null, null ],
  [ null, 'p1', null, 'p2-king', null, 'p2', null, 'p2' ],
  [ 'p1', null, null, null, null, null, 'p2', null ],
  [ null, 'p1', null, null, null, 'p2', null, 'p2' ],
];
```

to see what this looks like on the board, we could just render it!


./src/App.js
```js
//...

import { validMoves, initCheckersBoard, kingCheckersBoard } from './util';

//...

state = {
  //...
  pieces: kingCheckersBoard,
}

//...
```

we can see now that the king should be able to do a long chain jump of many pieces. Let's write a test for that:


./src/util.test.js
```js
import { validMoves, initCheckersBoard, kingCheckersBoard } from './util';

//...

it('should allow the king to jump any direction', ()=>{
  const kingMoves = validMoves( kingCheckersBoard, 0, 6, !'jumping' );
  expect( kingMoves.any ).toEqual( 1 );
  expect( kingMoves[2][4] ).toEqual( true );
});

it('should allow the king to move any direction', ()=>{
  const kingMoves = validMoves( kingCheckersBoard, 5, 3, !'jumping' );
  expect( kingMoves.any ).toEqual( 4 );
  expect( kingMoves[6][2] ).toEqual( true );
  expect( kingMoves[6][4] ).toEqual( true );
  expect( kingMoves[4][2] ).toEqual( true );
  expect( kingMoves[4][4] ).toEqual( true );

  const endKingMoves = validMoves( kingCheckersBoard, 5, 3, 'jumping' );
  expect( endKingMoves.any ).toEqual( 1 );
  expect( endKingMoves[5][3] ).toEqual( true );
});
```

our test fails. which is what we should expect knowing that we haven't written the feature yet


so let's write the feature

where we had

./src/util.js
```js
  const nonjumpMoves = [ [col+1, row+direction], [col-1, row+direction] ]
    .filter(([c, r])=> (
      c >= 0 && c <= 7 &&
      r >= 0 && r <= 7 &&
      !pieces[c][r]
    ));
```

we were starting with only two possible non-jump moves

when the `selectedPiece` is a king, we should have 2 more

```js
  const nonjumpMoves = [
    [col+1, row+direction], [col-1, row+direction],
    ...(selectedPiece.includes('king') ? [
      [col+1, row-direction], [col-1, row-direction],
    ] : []),
  ]
    .filter(([c, r])=> (
      c >= 0 && c <= 7 &&
      r >= 0 && r <= 7 &&
      !pieces[c][r]
    ));
```

this will graft on to our array the backwards moves before we run our filter

the filter will work the same (checks that the move is on the board and that the space is unoccupied

I've used [array spread](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) and [ternary operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator) here in case you're wondering about the syntax


ok, so the non jump moves test is passing now - let's do the same for the jump moves

```js
    ...(selectedPiece.includes('king') ? [
      [col+2, row - 2*direction], [col-2, row - 2*direction],
    ] : []),
```

lastly, in App.js, we'll need to end the turn when a jumping king clicks on himself

(( this code section needs to be pared down ... there were quite a few little changes nec. to make this work pithily ))

(( one such is the `tmpPiece` code, which is a fix for king ko ))

(( also did some renaming to "Square" "jumpingFrom" for clarity... should be repagated through the course ))

(( this copy also includes the solution for the next section on becoming a king in the middle of a turn ))

./src/App.js
```js
  onClickCell = (col, row)=> {
    const selectedPiece = this.state.pieces[col][row];
    const selectedMove = (this.state.moves[col]||[])[row];
    const { jumpingFrom } = this.state;
    
    if( !selectedPiece && !selectedMove ) return;

    if(!jumpingFrom && selectedPiece && selectedPiece.includes(this.state.turn)){
      const moves = validMoves(this.state.pieces, col, row);
      
      this.setState({ moves, selectedSquare: [col, row] });
      
    } else if(selectedMove){
      if(selectedPiece && (col !== jumpingFrom[0] || row !== jumpingFrom[1] || !selectedPiece.includes('king'))) return;
      
      let jumping = false;
      let pieces = JSON.parse( JSON.stringify( this.state.pieces ) );

      const tmpPiece = pieces[col][row];
      pieces[col][row] = pieces[this.state.selectedSquare[0]][this.state.selectedSquare[1]] + (
        (row === 7 || row === 0) &&
        !pieces[this.state.selectedSquare[0]][this.state.selectedSquare[1]].includes('king') ? '-king' : ''
      );
      
      pieces[this.state.selectedSquare[0]][this.state.selectedSquare[1]] = tmpPiece;

      if( Math.abs( col - this.state.selectedSquare[0] ) === 2 ){
        // jumping
        jumping = true;
        if( !pieces[ (col + this.state.selectedSquare[0])/2 ][(row + this.state.selectedSquare[1])/2 ].includes('jumped') )
          pieces[ (col + this.state.selectedSquare[0])/2 ][(row + this.state.selectedSquare[1])/2 ] += '-jumped';
      }


      // if turn is over...
      const moves = validMoves(pieces, col, row, jumping);

      const turnOver = !jumping || ( jumping && !moves.any ) ||
                       (selectedPiece && col === jumpingFrom[0] && row === jumpingFrom[1] && selectedPiece.includes('king'));

      if(turnOver)
        pieces = pieces.map( pieceRow => pieceRow.map( cell=> (cell||'').includes('jumped') ? null : cell ));

      const otherPlayer = this.state.turn === 'p1' ? 'p2' : 'p1';
      const nextTurn = turnOver ? otherPlayer : this.state.turn;
      const nextJumpingFrom = turnOver ? null : [col, row];
      
      this.setState({
        moves: jumping ? moves : [],
        pieces,
        turn: nextTurn,
        jumpingFrom: nextJumpingFrom,
        selectedSquare: nextJumpingFrom,
      }, ()=> turnOver && this.checkEndGame());
    }
```

##### ending multijump for kings

./src/util.js
```js
  if( selectedPiece.includes('king') && isJumping ) valid.push( [col, row] );
```


##### becoming a king

when the piece will end up at the end of the board, we need to change it to 'p#-king''

./src/App.js
```js
      pieces[col][row] = pieces[this.state.selectedSquare[0]][this.state.selectedSquare[1]] + (
        (row === 7 || row === 0) &&
        !pieces[this.state.selectedSquare[0]][this.state.selectedSquare[1]].includes('king') ? '-king' : ''
      );
```

#### calculate when the game has ended, test

at the beginning of his turn, if a player has no valid moves or no pieces at all, he loses

this is a fantastic example of using reduce to make the code legible

could rename 'losing' to 'hasNoMoves'

./src/App.js
```js
  checkEndGame = ()=>{
    const { pieces, turn } = this.state;

    // for turn, find all his pieces, find all their moves
    // if either is `none`, he loses

    const lost = pieces.reduce( (losingGame, rowOfPieces, colIndex)=>(
      rowOfPieces.reduce( (losing, piece, rowIndex)=> (
        losing && (
          !piece ||
          !piece.includes(turn) ||
          !validMoves(pieces, colIndex, rowIndex, !'jumping').any
        )
      ), losingGame)
    ), true);

    this.setState({
      winner: !lost ? null : ({ p1: 'p2', p2: 'p1' })[turn]
    });
  }
```




---
---

## agenda (contd)


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
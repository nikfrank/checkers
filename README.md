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
- take `onClick` from `<Board pieces={this.state.pieces} />
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


- calculate legal checkers moves, test
  - render legal checkers moves as piece on `Board`
- move pieces, giving each player his turn
- calculate when the game has ended, test

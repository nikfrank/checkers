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

```
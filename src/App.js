import React, { Component } from 'react';
import './App.css';

import Game from './Game';
import { calculateAllTurnOptions, strictValidMoves } from './util';

class App extends Component {
  state = {
    winner: null,
    rules: 'strict',
  }

  onWinner = winner=>
    this.setState({ winner })

  cpMove = (pieces, player='p2')=>{
    // if the choice is multijump, the entire chain will be returned. Game will delay render loop

    // here call cpPlayer.js.cpChooseMove

    
    // non-king moves
    
    // there, generate (and memoize?) a move chart to some depth
    // at each possible leaf node (game state), calculate a game state value
    ///// gsv = #p1s + 3*#p1-kings + #edgeP1s - that for p2
    // or vice versa for the cp I suppose
    // assign Infinity / -Infinity for endGame.

    // use the minimax algorithm to bubble the move values up the tree
    // select the move based on that

    
    // king moves / multijump
    
    // multijump / king moves should be calculated to depth of 3, with each permutation considered a different move
    // this gives a branching factor of 8, which with a move depth of 4 means a search size of 4096 per king
    // hopefully this is sufficiently simple for runtime, most boards aren't nearly so complex
    // multijump for non-king is floor( (N-1)/2 ) maximum by nature anyhow, so 3 is enough for that always


    // generate list of valid moves

    const allMoves = calculateAllTurnOptions(pieces, 'p2', strictValidMoves);

    if(!allMoves.length) return; // game is over already
    
    return allMoves[ Math.floor(allMoves.length * Math.random()) ]; // pick a move
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
                 rules={this.state.rules}
                 mode='cp'
                 cpMove={this.cpMove}
           />
        )}
      </div>
    );
  }
}

export default App;

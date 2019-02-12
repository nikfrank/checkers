import React, { Component } from 'react';
import './App.css';

import Game from './Game';

class App extends Component {
  state = {
    winner: null,
  }

  onWinner = winner=>
    this.setState({ winner })

  cpMove = (pieces, jumpingFrom, cpPlayer='p2')=>{
    return pieces;

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

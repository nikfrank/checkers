import React, { Component } from 'react';
import './App.css';

import Game from './Game';
import { calculateAllTurnOptions, calculatePiecesAfterMove } from './util';

class App extends Component {
  state = {
    winner: null,
    rules: 'strict',
  }

  onWinner = winner=>
    this.setState({ winner })

  cpMove = (pieces, player='p2')=>{
    const otherPlayer = { p1: 'p2', p2: 'p1' }[player];
    
    // generate list of valid moves

    const allMoves = calculateAllTurnOptions(pieces, player);

    if(!allMoves.length) return; // game is over already

    // for each turn option, determine the value at the end, pick the biggest value
    // at each possible leaf node (game state), calculate a game state value
    ///// gsv = #p1s + 3*#p1-kings + #edgeP1s - that for p2

    const moveResults = allMoves.map(moves =>
      moves.reduce((p, move, mi)=> calculatePiecesAfterMove(p, [
        ...moves.slice(mi),
        mi === moves.length -1 ? moves[mi] : undefined,
      ]).pieces, pieces)
    );
    
    const moveValues = moveResults.map(resultPieces => {
      const playerPieces = resultPieces.reduce((p, col)=>
        p+ col.filter(piece => (piece && piece === player)).length, 0);
      
      const playerKings = resultPieces.reduce((p, col)=>
        p+ col.filter(piece => (piece && piece === player+'king')).length, 0);
      
      const playerEdges = resultPieces.reduce((p, col, ci)=> p+ (ci > 0 && ci < resultPieces.length-1) ? (
        0 ) : ( col.filter(piece=> (piece && piece.includes(player))).length ), 0);


      
      const otherPieces = resultPieces.reduce((p, col)=>
        p+ col.filter(piece=> (piece && piece === otherPlayer && !piece.includes('jumped'))).length, 0);
      
      const otherKings = resultPieces.reduce((p, col)=>
        p+ col.filter(piece=> (piece && piece === otherPlayer+'-king' && !piece.includes('jumped'))).length, 0);
      
      const otherEdges = resultPieces.reduce((p, col, ci)=> p+ (ci > 0 && ci < resultPieces.length-1) ? (
        0 ) : ( col.filter(piece=> (piece && piece.includes(otherPlayer) && !piece.includes('jumped'))).length ), 0);

      
      return playerPieces + 3*playerKings + playerEdges - otherPieces - 3*otherKings - otherEdges;
    });
    
    const bestMove = moveValues.reduce((moveIndex, result, ci)=> (result > moveValues[moveIndex] ? ci : moveIndex), 0);
    
    //return allMoves[ Math.floor(allMoves.length * Math.random()) ]; // pick a move randomly
    
    return allMoves[ bestMove ]; // pick the best move by the formula
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

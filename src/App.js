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
    selectedPiece: null,
    moves: [],
    turn: 'p1',
  }

  onClickCell = (col, row)=> {
    const selectedPiece = this.state.pieces[col][row];
    const selectedMove = (this.state.moves[col]||[])[row];
    
    if( !selectedPiece && !selectedMove ) return;

    if(selectedPiece && selectedPiece === this.state.turn){
      const direction = selectedPiece === 'p1' ? 1 : -1;
      
      // start with two possible moves, filter out if off-board or occupado
      const validMoves = [ [col+1, row+direction], [col-1, row+direction] ]
        .filter(([c, r])=> (
          c >= 0 && c <= 7 && !this.state.pieces[c][r]
        ));

      // generate "board layer" for moves as Array[8][8]
      const moves = Array(8).fill(0).map(()=> Array(8).fill(false));

      validMoves.forEach(([c, r])=> (moves[c][r] = true));

      this.setState({ moves, selectedPiece: [col, row] });
      
    } else if(selectedMove){

      const pieces = JSON.parse( JSON.stringify( this.state.pieces ) );

      pieces[this.state.selectedPiece[0]][this.state.selectedPiece[1]] = null;
      pieces[col][row] = this.state.turn;
      
      this.setState({ moves: [], pieces, turn: this.state.turn === 'p1' ? 'p2' : 'p1' });
    }
  }

  render() {
    return (
      <div className="App">
        <Board pieces={this.state.pieces}
               moves={this.state.moves}
               onClick={this.onClickCell}/>
      </div>
    );
  }
}

export default App;

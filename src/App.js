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

    const otherPlayer = this.state.turn.includes('p1') ? 'p2' : 'p1';
    
    if( !selectedPiece && !selectedMove ) return;

    if(selectedPiece && selectedPiece === this.state.turn){
      const direction = selectedPiece === 'p1' ? 1 : -1;

      // calculate valid non-jumping moves
      // start with two possible moves, filter out if off-board or occupado
      const nonjumpMoves = [ [col+1, row+direction], [col-1, row+direction] ]
        .filter(([c, r])=> (
          c >= 0 && c <= 7 &&
          r >= 0 && r <= 7 &&
          !this.state.pieces[c][r]
        ));

      // compute list of valid jump moves, if any
      // start with two possible moves, filter out off-board, occupado, no piece to jump
      const jumpMoves = [ [col+2, row + 2*direction], [col-2, row + 2*direction] ]
        .filter(([c, r])=> (
          c >= 0 && c <= 7 &&
          r >= 0 && r <= 7 &&
          !this.state.pieces[c][r] &&
          (this.state.pieces[ (c + col)/2 ][ (r + row)/2 ]||'').includes(otherPlayer)
        ));
      
      // generate "board layer" for moves as Array[8][8]
      const moves = Array(8).fill(0).map(()=> Array(8).fill(false));

      (jumpMoves.length ? jumpMoves : nonjumpMoves).forEach(([c, r])=> (moves[c][r] = true));

      this.setState({ moves, selectedPiece: [col, row] });
      
    } else if(selectedMove){

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

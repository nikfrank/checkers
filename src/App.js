import React, { Component } from 'react';
import './App.css';

import Board from './Board';

import {
  validMoves,
  initCheckersBoard,
//  kingCheckersBoard
} from './util';


class App extends Component {
  state = {
    pieces: initCheckersBoard, //kingCheckersBoard
    selectedPiece: null,
    jumpingPiece: null,
    moves: [],
    turn: 'p1',
  }

  onClickCell = (col, row)=> {
    const selectedPiece = this.state.pieces[col][row];
    const selectedMove = (this.state.moves[col]||[])[row];
    const { jumpingPiece } = this.state;
    
    if( !selectedPiece && !selectedMove ) return;
    if( jumpingPiece && selectedPiece ) return;
    
    if(selectedPiece && selectedPiece.includes(this.state.turn)){
      const moves = validMoves(this.state.pieces, col, row);
      
      this.setState({ moves, selectedPiece: [col, row] });
      
    } else if(selectedMove){

      let jumping = false;
      let pieces = JSON.parse( JSON.stringify( this.state.pieces ) );

      pieces[col][row] = pieces[this.state.selectedPiece[0]][this.state.selectedPiece[1]];
      pieces[this.state.selectedPiece[0]][this.state.selectedPiece[1]] = null;

      if( Math.abs( col - this.state.selectedPiece[0] ) === 2 ){
        // jumping
        jumping = true;
        pieces[ (col + this.state.selectedPiece[0])/2 ][(row + this.state.selectedPiece[1])/2 ] += '-jumped';
      }


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

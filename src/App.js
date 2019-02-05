import React, { Component } from 'react';
import './App.css';

import Board from './Board';

import {
  validMoves,
  initCheckersBoard,
  kingCheckersBoard
} from './util';


class App extends Component {
  state = {
    pieces: initCheckersBoard && kingCheckersBoard,
    selectedSquare: null,
    jumpingFrom: null,
    moves: [],
    turn: 'p1',
  }

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

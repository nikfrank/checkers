import React, { Component } from 'react';
import Board from './Board';

import {
  validMoves,
  strictValidMoves,
  initCheckersBoard,
  kingCheckersBoard
} from './util';


class Game extends Component {
  state = {
    pieces: initCheckersBoard, // && kingCheckersBoard,
    selectedSquare: null,
    jumpingFrom: null,
    moves: [],
    turn: 'p1',
  }

  onClickCell = (col, row)=> {
    if( this.props.mode === 'cp' && this.state.turn !== 'p1' ) return;
    
    const calculateMoves = this.props.rules === 'strict' ? strictValidMoves : validMoves;
    
    const { jumpingFrom, moves, turn, selectedSquare } = this.state;
    const selectedPiece = this.state.pieces[col][row];
    const selectedMove = (moves[col]||[])[row];
    
    if( !selectedPiece && !selectedMove ) return;

    if(!jumpingFrom && selectedPiece && selectedPiece.includes(turn)){

      const moves = calculateMoves(this.state.pieces, col, row);
      
      this.setState({ moves, selectedSquare: [col, row] });
      
    } else if(selectedMove){
      if(selectedPiece && (col !== jumpingFrom[0] || row !== jumpingFrom[1] || !selectedPiece.includes('king'))) return;
      
      let jumping = false;
      let pieces = JSON.parse( JSON.stringify( this.state.pieces ) );

      const prevClickedSquare = pieces[col][row];
      
      const prevPiece = pieces[ selectedSquare[0] ][ selectedSquare[1] ];
      const nextPiece = prevPiece + (
        (row === pieces.length-1 || row === 0) &&
        !prevPiece.includes('king') ? '-king' : ''
      );
      
      pieces[col][row] = nextPiece;
      pieces[ selectedSquare[0] ][ selectedSquare[1] ] = prevClickedSquare;

      if( Math.abs( col - selectedSquare[0] ) === 2 ){
        jumping = true;

        // here apply "-jumped" tag to piece for removing it later
        // remember though that kings can rejump pieces
        if( !pieces[ (col + selectedSquare[0])/2 ][(row + selectedSquare[1])/2 ].includes('jumped') )
          pieces[ (col + selectedSquare[0])/2 ][(row + selectedSquare[1])/2 ] += '-jumped';
      }


      // if turn is over...
      const moves = calculateMoves(pieces, col, row, jumping);

      const turnOver = !jumping || ( jumping && !moves.any ) ||
                       (selectedPiece && col === jumpingFrom[0] && row === jumpingFrom[1] && selectedPiece.includes('king')) ||
                       (nextPiece.includes('king') && !prevPiece.includes('king'));
             

      if(turnOver)
        pieces = pieces.map( pieceRow => pieceRow.map( cell=> (cell||'').includes('jumped') ? null : cell ));

      const otherPlayer = turn === 'p1' ? 'p2' : 'p1';
      const nextTurn = turnOver ? otherPlayer : turn;
      const nextJumpingFrom = turnOver ? null : [col, row];
      
      this.setState({
        moves: jumping && !turnOver ? moves : [],
        pieces,
        turn: nextTurn,
        jumpingFrom: nextJumpingFrom,
        selectedSquare: nextJumpingFrom,
      }, ()=> turnOver && this.checkEndGame());
    }
  }

  checkEndGame = ()=>{
    const { pieces, turn } = this.state;

    // for turn, find all his pieces, find all their moves
    // if either is `none`, he loses
    // can use quirks "validMoves" as endGame state is invariant on strictness of movement rules.
    
    const lost = pieces.reduce( (losingGame, colOfPieces, colIndex)=>(
      colOfPieces.reduce( (losing, piece, rowIndex)=> (
        losing && (
          !piece ||
          !piece.includes(turn) ||
          !validMoves(pieces, colIndex, rowIndex, !'jumping').any
        )
      ), losingGame)
    ), true);

    if(lost) this.props.onWinner(({ p1: 'p2', p2: 'p1' })[turn]);
  }

  render() {
    return (
      <Board pieces={this.state.pieces}
             moves={this.state.moves}
             onClick={this.onClickCell}/>
    );
  }
}

export default Game;

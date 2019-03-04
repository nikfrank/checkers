import React, { Component } from 'react';
import Board from './Board';

import {
  validMovesForPieceOnBoard,
  calculatePiecesAfterMove,
  initCheckersBoard,
  jumpyCheckersBoard,
} from './util';


class Game extends Component {
  state = {
    pieces: initCheckersBoard, //jumpyCheckersBoard,  && kingCheckersBoard,
    selectedSquare: null,
    moves: [],
    turn: 'p1',
  }

  
  onClickCell = (col, row)=> {
    const { moves, turn, selectedSquare } = this.state;
    const selectedPiece = this.state.pieces[col][row];
    const selectedMove = (moves[col]||[])[row];
    
    if( !selectedPiece && !selectedMove ) return;

    if(!selectedMove && selectedPiece && selectedPiece.includes(turn)){
      const moves = validMovesForPieceOnBoard(this.state.pieces, col, row);
      this.setState({ moves, selectedSquare: [col, row] });
      
    } else if(selectedMove){
      const { jumping, turnOver, pieces } = calculatePiecesAfterMove(
        this.state.pieces,
        [selectedSquare, [col, row]]
      );

      const otherPlayer = turn === 'p1' ? 'p2' : 'p1';
      const nextTurn = turnOver ? otherPlayer : turn;
      const nextSelectedSquare = turnOver ? null : [col, row];
      
      this.setState({
        moves: jumping && !turnOver ? validMovesForPieceOnBoard(pieces, col, row, jumping) : [],
        pieces,
        turn: nextTurn,
        selectedSquare: nextSelectedSquare,
      }, ()=> turnOver && this.checkEndGame());
    }
  }

  checkEndGame = ()=>{
    const { pieces, turn } = this.state;

    // for turn, find all his pieces, find all their moves
    // if either is `none`, he loses
    
    const lost = pieces.reduce( (losingGame, colOfPieces, colIndex)=>(
      colOfPieces.reduce( (losing, piece, rowIndex)=> (
        losing && (
          !piece ||
          !piece.includes(turn) ||
          !validMovesForPieceOnBoard(pieces, colIndex, rowIndex, !'jumping').any
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

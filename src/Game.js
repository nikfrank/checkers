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
    pieces: initCheckersBoard, //jumpyCheckersBoard, //, // && kingCheckersBoard,
    selectedSquare: null,
    moves: [],
    turn: 'p1',
  }

  componentDidMount(){
//    setTimeout(()=> this.setState({ turn: 'p2' }), 500);
  }
  
  componentDidUpdate(prevProps, prevState){
    if(
      ( this.props.mode === 'cp' && this.state.turn === 'p2' ) &&
      ( prevState.turn !== 'p2' )
    ) this.makeCPmove();
  }

  makeCPmove = ()=>{
    const cpMove = this.props.cpMove(this.state.pieces);

    if(!cpMove) return;
    
    const { turnOver, pieces } = calculatePiecesAfterMove(this.state.pieces, cpMove);

    // if turn is over, delay 500ms -> setState({ turn: 'p1', pieces: nextPieces })
    setTimeout(()=> this.setState({ pieces, turn: turnOver? 'p1' : 'p2' }, ()=> turnOver && this.checkEndGame()), 500);

    if(!turnOver) {
      const { turnOver: nextTurnOver, pieces: nextPieces } = calculatePiecesAfterMove(
        pieces,
        cpMove.slice(1)
      );

      setTimeout(()=> this.setState({ pieces: nextPieces, turn: nextTurnOver? 'p1' : 'p2' },
                                    ()=> nextTurnOver && this.checkEndGame()), 1100);

      if( !nextTurnOver ){
        const { pieces: lastPieces, turnOver: kingNotStillJumping } = calculatePiecesAfterMove(
          nextPieces,
          cpMove.slice(2)
        );

        if( kingNotStillJumping )
          setTimeout(()=> this.setState({ pieces: lastPieces, turn: 'p1' },
                                        ()=> nextTurnOver && this.checkEndGame()), 1600);
        else {
          const { pieces: endKingPieces } = calculatePiecesAfterMove( lastPieces, [cpMove[2], cpMove[2]] );
          setTimeout(()=> this.setState({ pieces: endKingPieces, turn: 'p1' },
                                        ()=> nextTurnOver && this.checkEndGame()), 1600 );
        }
      }
    }
    
    
    // if cp jumped and didn't finish turn, delay -> recurse.
  }
  
  onClickCell = (col, row)=> {
    if( this.props.mode === 'cp' && this.state.turn !== 'p1' ) return;
    
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
    // can use quirks "validMoves" as endGame state is invariant on strictness of movement rules.
    
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

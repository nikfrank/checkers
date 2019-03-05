import React, { Component } from 'react';
import Board from './Board';

import {
  calculateAllTurnOptions,
  validMovesForPieceOnBoard,
  calculatePiecesAfterMove,
  initCheckersBoard,
//  jumpyCheckersBoard,
} from './util';


class Game extends Component {
  state = {
    pieces: initCheckersBoard, //jumpyCheckersBoard, //, // && kingCheckersBoard,
    selectedSquare: null,
    moves: [],
    turn: 'p1',
  }

  componentDidMount(){
    setTimeout(()=> this.setState({ turn: 'p2' }), 100);
  }
  
  componentDidUpdate(prevProps, prevState){
    if(
      ( this.props.mode === 'cp' && this.state.turn === 'p2' ) &&
      ( prevState.turn !== 'p2' )
    ) this.checkEndGame() || this.makeCPmove();
  }

  
  makeCPmove = ()=>{
    // here we'll calculate available moves, evaluate them, and choose one.
    const allMoves = calculateAllTurnOptions(this.state.pieces, this.state.turn);


    const moveResults = allMoves.map(moves =>
      moves.reduce((p, move, mi)=> calculatePiecesAfterMove(p, [
        ...moves.slice(mi),
        mi === moves.length -1 ? moves[mi] : undefined,
      ]).pieces, this.state.pieces)
    );

    
    const player = this.state.turn;
    const otherPlayer = { p1: 'p2', p2: 'p1' }[player];

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
    
    const cpMove = allMoves[ bestMove ]; // pick the best move by the formula
    

    const { turnOver, pieces } = calculatePiecesAfterMove(this.state.pieces, cpMove);

    setTimeout(()=> this.setState({ pieces, turn: turnOver? 'p1' : 'p2' }), 500);

    
    if(!turnOver) {
      const { turnOver: nextTurnOver, pieces: nextPieces } = calculatePiecesAfterMove(
        pieces,
        cpMove.slice(1)
      );

      setTimeout(()=> this.setState({ pieces: nextPieces, turn: nextTurnOver? 'p1' : 'p2' }), 1000);

      
      if(!nextTurnOver) {
        const { turnOver: lastTurnOver, pieces: lastPieces } = calculatePiecesAfterMove(
          nextPieces,
          cpMove.slice(2)
        );

        setTimeout(()=> this.setState({ pieces: lastPieces, turn: lastTurnOver? 'p1' : 'p2' }), 1500);

        
        if( !lastTurnOver ){
          const { turnOver: kingTurnOver, pieces: kingPieces } = calculatePiecesAfterMove(
            lastPieces,
            [cpMove[3], cpMove[3]]
          );

          setTimeout(()=> this.setState({ pieces: kingPieces, turn: kingTurnOver? 'p1' : 'p2' }), 2000);
        }
      }
    }
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
      }, ()=> this.checkEndGame());
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
    return lost;
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

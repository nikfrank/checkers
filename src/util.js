export const validMoves = (pieces, col, row, isJumping)=>{
  const selectedPiece = pieces[col][row];
  const direction = selectedPiece === 'p1' ? 1 : -1;
  const otherPlayer = (selectedPiece === 'p1') ? 'p2' : 'p1';

  // calculate valid non-jumping moves
  // start with two possible moves, filter out if off-board or occupado
  const nonjumpMoves = [ [col+1, row+direction], [col-1, row+direction] ]
    .filter(([c, r])=> (
      c >= 0 && c <= 7 &&
      r >= 0 && r <= 7 &&
      !pieces[c][r]
    ));

  // compute list of valid jump moves, if any
  // start with two possible moves, filter out off-board, occupado, no piece to jump
  const jumpMoves = [ [col+2, row + 2*direction], [col-2, row + 2*direction] ]
    .filter(([c, r])=> (
      c >= 0 && c <= 7 &&
      r >= 0 && r <= 7 &&
      !pieces[c][r] &&
      (pieces[ (c + col)/2 ][ (r + row)/2 ]||'').includes(otherPlayer)
    ));
  
  // generate "board layer" for moves as Array[8][8]
  const moves = Array(8).fill(0).map(()=> Array(8).fill(false));
  const valid = (jumpMoves.length ? jumpMoves : isJumping ? [] : nonjumpMoves);
  
  valid.forEach(([c, r])=> (moves[c][r] = true));

  moves.any = valid.length;
  return moves;
};

export const initCheckersBoard = [
  [ 'p1', null, 'p1', null, null, null, 'p2', null ],
  [ null, 'p1', null, null, null, 'p2', null, 'p2' ],
  [ 'p1', null, 'p1', null, null, null, 'p2', null ],
  [ null, 'p1', null, null, null, 'p2', null, 'p2' ],
  [ 'p1', null, 'p1', null, null, null, 'p2', null ],
  [ null, 'p1', null, null, null, 'p2', null, 'p2' ],
  [ 'p1', null, 'p1', null, null, null, 'p2', null ],
  [ null, 'p1', null, null, null, 'p2', null, 'p2' ],
];

// compute list of valid jump moves, if any
// start with two possible moves, filter out off-board, occupado, no piece to jump
export const calculateJumpMoves = (pieces, col, row, { selectedPiece, direction, otherPlayer })=> [
  [col+2, row + 2*direction], [col-2, row + 2*direction],
  ...(selectedPiece.includes('king') ? [
    [col+2, row - 2*direction], [col-2, row - 2*direction],
  ] : []),
]
  .filter(([c, r])=> (
    c >= 0 && c <= pieces.length-1 &&
    r >= 0 && r <= pieces.length-1 &&
    !pieces[c][r] &&
    (pieces[ (c + col)/2 ][ (r + row)/2 ]||'').includes(otherPlayer)
  ));


// calculate valid non-jumping moves
// start with two possible moves, filter out if off-board or occupado
export const calculateNonJumpMoves = (pieces, col, row, { selectedPiece, direction })=> [
  [col+1, row+direction], [col-1, row+direction],
  ...(selectedPiece.includes('king') ? [
    [col+1, row-direction], [col-1, row-direction],
  ] : []),
]
  .filter(([c, r])=> (
    c >= 0 && c <= pieces.length-1 &&
    r >= 0 && r <= pieces.length-1 &&
    !pieces[c][r]
  ));


export const validMovesCR = (pieces, col, row, isJumping)=>{
  const selectedPiece = pieces[col][row] ||'';
  const direction = selectedPiece.includes('p1') ? 1 : -1;
  const otherPlayer = (selectedPiece.includes('p1')) ? 'p2' : 'p1';

  const nonjumpMoves = calculateNonJumpMoves(pieces, col, row, { selectedPiece, direction });
  const jumpMoves = calculateJumpMoves(pieces, col, row, { selectedPiece, direction, otherPlayer });

  const valid = (jumpMoves.length ? jumpMoves : isJumping ? [] : nonjumpMoves);

  if( selectedPiece.includes('king') && isJumping ) valid.push( [col, row] );

  return valid;
};

export const validMoves = (pieces, col, row, isJumping)=>{
  const valid = validMovesCR(pieces, col, row, isJumping);
  
  // generate "board layer" for moves as Array[8][8]
  const moves = Array(8).fill(0).map(()=> Array(8).fill(false));
  
  valid.forEach(([c, r])=> (moves[c][r] = true));

  moves.any = valid.length;
  return moves;
};




const strictValidCR = (pieces, col, row, isJumping)=> {
  const selectedPiece = pieces[col][row] ||'';
  const direction = selectedPiece.includes('p1') ? 1 : -1;
  const otherPlayer = (selectedPiece.includes('p1')) ? 'p2' : 'p1';
  const player = (selectedPiece.includes('p1')) ? 'p1' : 'p2';

  const nonjumpMoves = calculateNonJumpMoves(pieces, col, row, { selectedPiece, direction });
  const jumpMoves = calculateJumpMoves(pieces, col, row, { selectedPiece, direction, otherPlayer });


  // calculate jump moves for all player's pieces
  // if any, only return jump moves for this piece

  const playerOtherPieces = pieces.reduce((otherPieces, rowOfPieces, colIndex)=>
    [...otherPieces,
     ...rowOfPieces.map((piece, rowIndex)=> ((piece||'').includes(player) ? [colIndex, rowIndex] : null))
     .filter(i=> i)
     .filter(([c, r])=> (c !== col || r !== row))
    ], []);

  const otherJumpMoves = playerOtherPieces
    .map(([c, r])=> calculateJumpMoves( pieces, c, r, { selectedPiece: pieces[c][r], direction, otherPlayer } ))
    .reduce((total, jumpMoves)=> total + jumpMoves.length, 0);


  const valid = (jumpMoves.length ? jumpMoves : isJumping ? [] : otherJumpMoves ? [] : nonjumpMoves);

  if( selectedPiece.includes('king') && isJumping ) valid.push( [col, row] );

  return valid;
}

export const strictValidMoves = (pieces, col, row, isJumping)=> {
  const valid = strictValidCR(pieces, col, row, isJumping);

  // generate "board layer" for moves as Array[8][8]
  const moves = Array(8).fill(0).map(()=> Array(8).fill(false));

  valid.forEach(([c, r])=> (moves[c][r] = true));

  moves.any = valid.length;
  return moves;
};

export const calculateAllMoves = (pieces, player)=> {
  
};

export const strictCalculateAllMoves = (pieces, player)=>{
  
}

export const initCheckersBoard = [
  //  [ 'p1', null, 'p1-king', null, null, null, 'p2', null ],
  [ 'p1', null, 'p1', null, null, null, 'p2', null ],
  [ null, 'p1', null, null, null, 'p2', null, 'p2' ],
  [ 'p1', null, 'p1', null, null, null, 'p2', null ],
  [ null, 'p1', null, null, null, 'p2', null, 'p2' ],
  [ 'p1', null, 'p1', null, null, null, 'p2', null ],
  [ null, 'p1', null, null, null, 'p2', null, 'p2' ],
  [ 'p1', null, 'p1', null, null, null, 'p2', null ],
  [ null, 'p1', null, null, null, 'p2', null, 'p2' ],
];

export const kingCheckersBoard = [
  [ 'p1', null, null, null, null, null, 'p1-king', null ],
  [ null, 'p1', null, 'p2', null, 'p2', null, null ],
  [ 'p1', null, 'p1', null, null, null, 'p2', null ],
  [ null, 'p1', null, 'p2', null, 'p2', null, 'p2' ],
  [ 'p1', null, null, null, null, null, null, null ],
  [ null, 'p1', null, 'p2-king', null, 'p2', null, 'p2' ],
  [ 'p1', null, null, null, null, null, 'p2', null ],
  [ null, 'p1', null, null, null, 'p2', null, 'p2' ],
];

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

const calculatePlayerPieces = (pieces, player)=>
  pieces.reduce((otherPieces, rowOfPieces, colIndex)=> [
    ...otherPieces,
    ...rowOfPieces.map((piece, rowIndex)=> ((piece||'').includes(player) ? [colIndex, rowIndex] : null))
    .filter(i=> i)
  ], []);


export const calculatePiecesAfterMove = (inputPieces, [moveFrom, moveTo], calculateValidMoves )=>{
  let jumping = false;
  let pieces = JSON.parse( JSON.stringify( inputPieces ) );

  const prevClickedSquare = pieces[ moveTo[0] ][ moveTo[1] ];
  
  const prevPiece = pieces[ moveFrom[0] ][ moveFrom[1] ];
  const nextPiece = prevPiece + (
    (moveTo[1] === pieces.length-1 || !moveTo[1]) &&
    !prevPiece.includes('king') ? '-king' : ''
  );
  
  pieces[ moveTo[0] ][ moveTo[1] ] = nextPiece;
  pieces[ moveFrom[0] ][ moveFrom[1] ] = prevClickedSquare;

  if( Math.abs( moveTo[0] - moveFrom[0] ) === 2 ){
    jumping = true;

    // here apply "-jumped" tag to piece for removing it later
    // remember though that kings can rejump pieces
    if( !pieces[ (moveTo[0] + moveFrom[0])/2 ][(moveTo[1] + moveFrom[1])/2 ].includes('jumped') )
      pieces[ (moveTo[0] + moveFrom[0])/2 ][(moveTo[1] + moveFrom[1])/2 ] += '-jumped';
  }


  // if turn is over...
  const moves = calculateValidMoves(pieces, moveTo[0], moveTo[1], jumping);

  const turnOver = !jumping || ( jumping && !moves.any ) ||
                   
                   (moveTo[0] === moveFrom[0] && moveTo[1] === moveFrom[1] &&
                    (prevClickedSquare||'').includes('king')) ||
                   
                   (nextPiece.includes('king') && !prevPiece.includes('king'));
  

  if(turnOver)
    pieces = pieces.map( pieceRow => pieceRow.map( cell=> (cell||'').includes('jumped') ? null : cell ));

  return { jumping, turnOver, pieces };
};



export const calculateAllTurnOptions = (pieces, player, calculateValidMoves)=> {
  const playerPieces = calculatePlayerPieces(pieces, player);

  if( !playerPieces.length ) return [];

  const calculateMovesCR = calculateValidMoves === validMoves ? validMovesCR : strictValidCR;
  
  const moves = playerPieces.reduce((movesSoFar, piece)=> [
    ...movesSoFar,
    ...calculateMovesCR(pieces, piece[0], piece[1], !'jumping')
    .map(move=> {
      if( (Math.abs(move[0] - piece[0]) === 1) || (!move[1] || move[1] === pieces.length-1) ) return [[piece, move]];
      else {
        // here we have a jump and are not at end of board, need to check for multijump

        const { pieces: nextPieces } = calculatePiecesAfterMove( pieces, [piece, move], calculateValidMoves);
        const nextMoves = validMovesCR(nextPieces, move[0], move[1], !!'jumping');

        return nextMoves.length ? nextMoves.map(nextMove => [piece, move, nextMove]) : [[piece, move]];
      }
    }).reduce((p, c)=> [...p, ...c], []),
  ], []).filter(ms=> ms.length);

  return moves;
};


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

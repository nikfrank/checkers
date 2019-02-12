import { validMoves, strictValidMoves, initCheckersBoard, kingCheckersBoard } from './util';

it('should allow non-jump moves', ()=>{
  const edgeMoves = validMoves( initCheckersBoard, 0, 2, !'jumping' );
  expect( edgeMoves.any ).toEqual( 1 );
  expect( edgeMoves[1][3] ).toEqual( true );
  expect( edgeMoves[0][3] ).toEqual( false );

  const backMoves = validMoves( initCheckersBoard, 1, 1 );
  expect( backMoves.any ).toEqual( 0 );

  const middleMoves = validMoves( initCheckersBoard, 2, 2 );
  expect( middleMoves.any ).toEqual( 2 );
});

it('should allow jump moves and not non-jump moves', ()=>{
  const pieces = JSON.parse( JSON.stringify( initCheckersBoard ) );

  // pretend to play
  pieces[1][5] = null;
  pieces[2][4] = 'p2';

  // here if it were p2's turn [2][4] could move to [3][3] or [1][3]
  const nonjumpMoves = validMoves(pieces, 2, 4);

  expect( nonjumpMoves.any ).toEqual( 2 );
  expect( nonjumpMoves[0][2] ).toEqual( false );
  expect( nonjumpMoves[3][3] ).toEqual( true );
  expect( nonjumpMoves[1][3] ).toEqual( true );


  // p1 sacrifices a piece
  pieces[0][2] = null;
  pieces[1][3] = 'p1';
  
  // now p2 should be able to jump from [2][4] the p1 on [1][3] to [0][2]
  // and should not be able to move to [3][3]

  const jumpMoves = validMoves(pieces, 2, 4);

  expect( jumpMoves.any ).toEqual( 1 );
  expect( jumpMoves[0][2] ).toEqual( true );
  expect( jumpMoves[3][3] ).toEqual( false );
});

it('should not allow non-jumps while already jumping', ()=>{
  const noMoves = validMoves( initCheckersBoard, 0, 2, 'jumping' );
  expect( noMoves.any ).toEqual( 0 );
});


it('should allow the king to jump any direction', ()=>{
  const kingMoves = validMoves( kingCheckersBoard, 0, 6, !'jumping' );
  expect( kingMoves.any ).toEqual( 1 );
  expect( kingMoves[2][4] ).toEqual( true );
});

it('should allow the king to move any direction', ()=>{
  const kingMoves = validMoves( kingCheckersBoard, 5, 3, !'jumping' );
  expect( kingMoves.any ).toEqual( 4 );
  expect( kingMoves[6][2] ).toEqual( true );
  expect( kingMoves[6][4] ).toEqual( true );
  expect( kingMoves[4][2] ).toEqual( true );
  expect( kingMoves[4][4] ).toEqual( true );
  expect( kingMoves[0][4] ).toEqual( false );

  const endKingMoves = validMoves( kingCheckersBoard, 5, 3, 'jumping' );
  expect( endKingMoves.any ).toEqual( 1 );
  expect( endKingMoves[5][3] ).toEqual( true );
});


// here other moves are available which ARE jumps
it('should not allow non-jumps in strict mode', ()=>{
  const noMoves = strictValidMoves( kingCheckersBoard, 5, 1, !'jumping' );
  expect( noMoves.any ).toEqual( 0 );
});

// need a test for "king jump available, piece non-jump <BUG> still allowed"
// king pieces were not considered "playerOtherPieces" because of strict equality check

import React from 'react';
import './Board.css';

import Piece from './Piece';

export default ({
  onClick=(()=>0),
  pieces=[[]],
  moves=[[]],
  size=pieces.length,
})=> (
  <div className='Board'>
    {Array(size).fill(0).map((_, rowIndex)=> (
    <div key={'row'+rowIndex} className='BoardRow'>
      {Array(size).fill(0).map((_, colIndex)=> (
      <div key={'cell'+rowIndex+','+colIndex}
           onClick={()=> onClick(colIndex, rowIndex)}
           className='BoardCell'>
        <Piece glyph={pieces[colIndex][rowIndex]}/>
        <Piece glyph={(moves[colIndex]||[])[rowIndex] && 'move'} />
      </div>
      ) )}
    </div>
    ))}
  </div>
);

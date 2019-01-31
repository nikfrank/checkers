import React from 'react';
import './Board.css';

import Piece from './Piece';

export default ({
  size=8,
  onClick=(()=>0),
  pieces=[[]],
  moves=[[]],
})=> (
  <div className='Board'>
    {Array(size).fill(0).map((_, rowIndex)=> (
      <div key={'row'+rowIndex} className='BoardRow'>
        {Array(size).fill(0).map((_, colIndex)=> (
          <div key={'cell'+rowIndex+','+colIndex}
               onClick={()=> onClick(colIndex, rowIndex)}
               className='BoardCell'>
            {pieces[colIndex] && pieces[colIndex][rowIndex] ? (
               <Piece glyph={pieces[colIndex][rowIndex]}/>
            ) : null}
            {moves[colIndex] && moves[colIndex][rowIndex] ? (
               <Piece glyph='move' />
            ) : null}
          </div>
        ) )}
      </div>
    ))}
  </div>
);

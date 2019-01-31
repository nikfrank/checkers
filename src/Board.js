import React from 'react';
import './Board.css';

export default ({
  size=8,
  pieces=[[]],
})=> (
  <div className='Board'>
    {Array(size).fill(0).map((_, rowIndex)=> (
      <div key={'row'+rowIndex} className='BoardRow'>
        {Array(size).fill(0).map((_, colIndex)=> (
          <div key={'cell'+rowIndex+','+colIndex} className='BoardCell'>
          </div>
        ) )}
      </div>
    ))}
  </div>
);

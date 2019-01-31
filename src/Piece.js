import React from 'react';

const glyphColors = {
  p1: 'grey',
  p2: 'green',
  move: 'yellow',
};

const glyphSizes = {
  p1: 20,
  p2: 20,
  move: 5,
};

export default ({
  glyph='circle'
})=> (
  <svg className='Piece' viewBox='0 0 100 100'>
    <circle r={glyphSizes[glyph]} cx={50} cy={50} fill={glyphColors[glyph]}/>
  </svg>
);

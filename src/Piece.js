import React from 'react';

const glyphColors = {
  p1: 'grey',
  'p1-king': 'grey',
  'p1-jumped': '#444',
  p2: 'green',
  'p2-king': 'green',
  'p2-jumped': '#5a0',
  move: 'yellow',
  king: 'gold',
};

const glyphSizes = {
  p1: 20,
  'p1-king': 20,
  'p1-jumped': 8,
  p2: 20,
  'p2-king': 20,
  'p2-jumped': 8,
  move: 5,
  king: 10,
};

export default ({
  glyph='circle'
})=> (
  <svg className='Piece' viewBox='0 0 100 100'>
    <circle r={glyphSizes[glyph]} cx={50} cy={50} fill={glyphColors[glyph]}/>
    {(glyph||'').includes('king') ? [
       <circle r={glyphSizes.king + 3} cx={50} cy={50} fill={glyphColors.king} key='ring'/>,
       <circle r={glyphSizes.king} cx={50} cy={50} fill={glyphColors[glyph]} key='fill'/>
    ] : null}
  </svg>
);

import React from 'react';

export default ({
  glyph='circle'
})=> (
  <svg className='Piece' viewBox='0 0 100 100'>
    <circle r={20} cx={50} cy={50} fill={glyph === 'p1' ? 'grey' : 'green'}/>
  </svg>
);

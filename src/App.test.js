import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import Board from './Board';

import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});


it('mounts to enzyme to render a Board', ()=>{

  const fakePieces = [[ 'p1', null ], [null, 'p2']];
  const fakeMoves = [[ false, false ], [ false, false ] ];

  const p = mount(<Board pieces={fakePieces}
                         moves={fakeMoves} />);

  expect( p.find('.Board') ).toHaveLength( 1 );
});

it('mounts to enzyme and clicks a cell', ()=>{

  const clickSpy = jest.fn();

  const fakePieces = [[ 'p1', null ], [null, 'p2']];
  const fakeMoves = [[ false, false ], [ false, false ] ];

  
  const p = mount(<Board pieces={fakePieces}
                         moves={fakeMoves}
                         onClick={clickSpy}/>);

  p.find('div.BoardCell').first().simulate('click');

  expect( clickSpy.mock.calls ).toHaveLength( 1 );
  expect( clickSpy.mock.calls[0][0] ).toEqual( 0 );
  expect( clickSpy.mock.calls[0][1] ).toEqual( 0 );

  p.find('div.BoardCell').at(2).simulate('click');

  expect( clickSpy.mock.calls ).toHaveLength( 2 );
  expect( clickSpy.mock.calls[1][0] ).toEqual( 0 );
  expect( clickSpy.mock.calls[1][1] ).toEqual( 1 );

});

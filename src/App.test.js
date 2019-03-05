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

it('mounts to enzyme and selects a piece', ()=>{

  const clickSpy = jest.fn();
  
  const p = mount(<Board pieces={[[ 'p1', null ], [null, 'p2']]}
                         moves={[[ false, false ], [ false, false ] ]}
                         onClick={clickSpy}/>);

  p.find('div.BoardCell').first().simulate('click');

  expect( clickSpy ).toHaveBeenCalled();
});

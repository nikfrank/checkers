import React, { Component } from 'react';
import './App.css';

import Game from './Game';

class App extends Component {
  state = {
    winner: null,
  }

  onWinner = winner=>
    this.setState({ winner })

  render() {
    return (
      <div className="App">
        {this.state.winner ? (
           <div className='winner'>
             { this.state.winner } WINS!
           </div>
        ) : (
           <Game onWinner={this.onWinner}
                 rules='strict'
                 mode='2p'/>
        )}
      </div>
    );
  }
}

export default App;

this is a course on how to build a checkers game using reactJS

We're starting today from a 2p-local game, out goal is to add a basic computer player


## agenda

1. review code for 2p-local

- what are the functions which control the game logic?
- how will we use them to program the computer player?

2. 1p v cp local

- select cp game or 2p local game
- onUpdate lifecycle -> trigger cp play
- algorithm for selecting move, test




### review code for 2p-local

let's take a quick read through the app, starting with <sub>./src/App.js</sub> to understand what the parts are, and how things are running already

<sub>./src/App.js</sub>
```js
//...

import { calculateAllTurnOptions, strictValidMoves } from './util';

//...
```

we see right away which utility functions we'll be using. Let's take a look at the function signatures for those in <sub>./src/util.js</sub> to understand them a bit more

<sub>./src/util.js</sub>
```js
//...

export const strictValidMoves = (pieces, col, row, isJumping)=> {

//...

export const calculateAllTurnOptions = (pieces, player, calculateValidMoves)=> {

//..
```

so `strictValidMoves` takes a boardful of pieces, a column & row coordinate, and a boolean of whether we're jumping

probably what this does is tell us for a given piece (given by `[col, row]`) what the valid moves available under "strict" rules are... isJumping will filter out non-jumps while we're already jumping.


`calculateAllTurnOptions` takes a boardful of pieces, which player we're asking about, and a function to calculate valid moves with

so we can understand that this function will give us a list of valid moves & multi-jump move options for our computer player to select between.





<sub>./src/App.js</sub>
```js
//...

  render() {
    return (
      <div className="App">
        {this.state.winner ? (
           <div className='winner'>
             { this.state.winner } WINS!
           </div>
        ) : (
           <Game onWinner={this.onWinner}
                 rules={this.state.rules}
                 mode='cp'
                 cpMove={this.cpMove}
           />
        )}
      </div>
    );
  }

//...
```

we see in the `render()` function that we're setting some rules and rendering a `Game` Component... let's take a read there to see how it works

<sub>./src/Game.js</sub>
```js
//...

import {
  validMoves,
  strictValidMoves,
  calculatePiecesAfterMove,
  initCheckersBoard
} from './util';

//...
```

first we see this list of utility functions


#### what are the functions which control the game logic?




### computer player





#### unit test the cp player, improve cp play


#### install enzyme
#### test the entire 2p local flow
#### mock the network layer and test the cp mode
#### mock the network layer and test the network 2p mode

---
---

#### integrate to the game server




===

## agenda (contd)

3. 2p over network

- assume game server exists
- create a user UX
- signin UX
- create game UX
- join game UX
- use network hook to send my moves & load other player's moves
- chat?

4. cloud game server

- aws account
- dynamoDB
- POST /user
  - apiGateway, lambda, dynamo table + create call
- /login -> JWT
  - apiGateway, lambda, dynamo check call
- POST /game
  - apiGateway + JWT authorizer, lambda, dynamo table + create call
- /joinTable
  - apiGateway, lambda, dynamo update call
- PUT /game { move }
  - apiGateway, lambda, dynamo update call
- GET /game/:id
  - apiGatewat, lambda, dynamo read call
- chat?

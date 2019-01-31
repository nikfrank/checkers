this is a course on how to build a checkers game using reactJS

it covers:

- flex box
- svg in `<img/>`
- svg as `<svg />`
- react lifecycle, state management, network behaviour
- an algorithm! (calculate a list of legal checkers moves at any given board)
- createUser & login & gameplay using a game server (http using fetch)
- writing a game server in dynamoDB + lambda + apiGateway
- another algorithm! (writing a computer player)
- unit testing for algorithms using jest, component testing with enzyme + jest


```
if you can't explain it to freshmen, you don't understand it well enough
                     - r p feynman
```


## agenda

1. 2p local game

- make a board Component
- render game pieces onto the board
- take `onClick` from `<Board pieces={this.state.pieces} />
- calculate legal checkers moves, test
  - render legal checkers moves as piece on `Board`
- move pieces, giving each player his turn
- calculate when the game has ended, test

2. 1p v cp local

- select cp game or 2p local game
- onUpdate lifecycle -> trigger cp play
- algorithm for selecting move, test

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


### 2p local game

#### make a board Component

`$ touch ./src/Board.js`

./src/Board.js
```js

```

./src/App.js
```js
import Board from './Board';

//...

render(){
  return (
    <div className='App'>
      <Board />
    </div>
  );
}
```








- render game pieces onto the board
- take `onClick` from `<Board pieces={this.state.pieces} />
- calculate legal checkers moves, test
  - render legal checkers moves as piece on `Board`
- move pieces, giving each player his turn
- calculate when the game has ended, test

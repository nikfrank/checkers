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

import { calculateAllTurnOptions, calculatePiecesAfterMove } from './util';

//...
```

we see right away which utility functions we'll be using. Let's take a look at the function signatures for those in <sub>./src/util.js</sub> to understand them a bit more

<sub>./src/util.js</sub>
```js
//...

export const calculateAllTurnOptions = (pieces, player)=> {
  //...
  
  return moves;
};
```

`calculateAllTurnOptions` takes a boardful of pieces, which player we're asking about, and returns a variable called `moves`

so we can understand that this function will give us a list of valid moves & multi-jump move options for our computer player to select between.

(( once tests are written for this function, review test output [from, to], [from, to, ...nextTo] ))



```js
//...

export const calculatePiecesAfterMove = (inputPieces, [moveFrom, moveTo])=>{
  //...
  
  return { jumping, turnOver, pieces };
};
```

`calculatePiecesAfterMove` takes a boardful of pieces, and an array destructured to variables called `moveFrom` and `moveTo` and returns an object with `{ jumping, turnOver, pieces}`

`moveFrom` and `moveTo` we can see from these lines of code in the function

```js
  const prevClickedSquare = pieces[ moveTo[0] ][ moveTo[1] ];
  
  const prevPiece = pieces[ moveFrom[0] ][ moveFrom[1] ];

```

must contain a column and row value like `[col, row]`, in order to read out of `pieces` correctly.


we can figure from the names of the output variables that we have determined if the move ends with the player still jumping, if the move is over, and the board of pieces after the move.



I've prepared this workshop to use these two functions (along with standard React and js tactics) to build a Computer Player!



### select cp game or 2p local game


in our App, let's add a prop to the `Game` element which will decide the game mode

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
           <Game onWinner={this.onWinner} mode='cp' />
        )}
      </div>
    );
  }

//...
```

now we can use `this.props.mode` inside the `Game` Component to block p2 from clicking, and instead trigger the computer player logic.

<sub>./src/Game.js</sub>
```js
//...
onClickCell = (col, row)=> {
    if( this.props.mode === 'cp' && this.state.turn !== 'p1' ) return;

//...
```

ok, now p2 can't do anything!

How are we going to respond to p1 moving?

Let's start by thinking through what happends when p1 does move:

- user clicks a square to move to
- eventually the turn is determined to be over by the `calculatePiecesAfterMove` function during ```js
    } else if(selectedMove){
      const { jumping, turnOver, pieces } = calculatePiecesAfterMove(
        this.state.pieces,
        [selectedSquare, [col, row]]
      );
```
- `this.state.turn` is updated to 'p2'


the last item in the list is very important, as we will use it to trigger the computer player.

when the `state` updates, React will call a number of [lifecycle functions](https://www.google.com/search?q=react+lifecycle+didupdate) 


[componentDidUpdate](https://reactjs.org/docs/react-component.html#componentdidupdate) will be triggered just as soon as `this.state.turn` is updated to be 'p2'


based on the example in the docs, we'll be able to run code whenever some `state` or `props` value changes...

(( joke ))

here we'll check that `this.state.turn` is `'p2'` and `prevState.turn` isn't, which means our computer player should pick his move!

```js
//...

  componentDidUpdate(prevProps, prevState){
    if(
      ( this.props.mode === 'cp' && this.state.turn === 'p2' ) &&
      ( prevState.turn !== 'p2' )
    ) this.makeCPmove();
  }

  
  makeCPmove = ()=>{
    // here we'll calculate available moves, evaluate them, and choose one.
  }

//...
```





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










###
###
###

code blocks

```js
  componentDidMount(){
    (Math.random() > 0.5) && setTimeout(()=> this.setState({ turn: 'p2' }), 100);
  }
  
  componentDidUpdate(prevProps, prevState){
    if(
      ( this.props.mode === 'cp' && this.state.turn === 'p2' ) &&
      ( prevState.turn !== 'p2' )
    ) this.makeCPmove();
  }

  makeCPmove = ()=>{
    const cpMove = this.props.cpMove(this.state.pieces);

    if(!cpMove) return;
    
    const { turnOver, pieces } = calculatePiecesAfterMove(this.state.pieces, cpMove);

    // if turn is over, delay 500ms -> setState({ turn: 'p1', pieces: nextPieces })
    setTimeout(()=> this.setState({ pieces, turn: turnOver? 'p1' : 'p2' }, ()=> turnOver && this.checkEndGame()), 500);

    if(!turnOver) {
      const { turnOver: nextTurnOver, pieces: nextPieces } = calculatePiecesAfterMove(
        pieces,
        cpMove.slice(1)
      );

      setTimeout(()=> this.setState({ pieces: nextPieces, turn: nextTurnOver? 'p1' : 'p2' },
                                    ()=> nextTurnOver && this.checkEndGame()), 1100);

      if( !nextTurnOver ){
        const { pieces: lastPieces, turnOver: kingNotStillJumping } = calculatePiecesAfterMove(
          nextPieces,
          cpMove.slice(2)
        );

        if( kingNotStillJumping )
          setTimeout(()=> this.setState({ pieces: lastPieces, turn: 'p1' },
                                        ()=> nextTurnOver && this.checkEndGame()), 1600);
        else {
          const { pieces: endKingPieces } = calculatePiecesAfterMove( lastPieces, [cpMove[2], cpMove[2]] );
          setTimeout(()=> this.setState({ pieces: endKingPieces, turn: 'p1' },
                                        ()=> nextTurnOver && this.checkEndGame()), 1600 );
        }
      }
    }
    
    
    // if cp jumped and didn't finish turn, delay -> recurse.
  }

```

```js

//... onClickCell = (c, r)=> {
    if( this.props.mode === 'cp' && this.state.turn !== 'p1' ) return;
```


App
```js
  cpMove = (pieces, player='p2')=>{
    const otherPlayer = { p1: 'p2', p2: 'p1' }[player];
    
    // generate list of valid moves

    const allMoves = calculateAllTurnOptions(pieces, player);

    if(!allMoves.length) return; // game is over already

    // for each turn option, determine the value at the end, pick the biggest value
    // at each possible leaf node (game state), calculate a game state value
    ///// gsv = #p1s + 3*#p1-kings + #edgeP1s - that for p2

    const moveResults = allMoves.map(moves =>
      moves.reduce((p, move, mi)=> calculatePiecesAfterMove(p, [
        ...moves.slice(mi),
        mi === moves.length -1 ? moves[mi] : undefined,
      ]).pieces, pieces)
    );
    
    const moveValues = moveResults.map(resultPieces => {
      const playerPieces = resultPieces.reduce((p, col)=>
        p+ col.filter(piece => (piece && piece === player)).length, 0);
      
      const playerKings = resultPieces.reduce((p, col)=>
        p+ col.filter(piece => (piece && piece === player+'king')).length, 0);
      
      const playerEdges = resultPieces.reduce((p, col, ci)=> p+ (ci > 0 && ci < resultPieces.length-1) ? (
        0 ) : ( col.filter(piece=> (piece && piece.includes(player))).length ), 0);


      
      const otherPieces = resultPieces.reduce((p, col)=>
        p+ col.filter(piece=> (piece && piece === otherPlayer && !piece.includes('jumped'))).length, 0);
      
      const otherKings = resultPieces.reduce((p, col)=>
        p+ col.filter(piece=> (piece && piece === otherPlayer+'-king' && !piece.includes('jumped'))).length, 0);
      
      const otherEdges = resultPieces.reduce((p, col, ci)=> p+ (ci > 0 && ci < resultPieces.length-1) ? (
        0 ) : ( col.filter(piece=> (piece && piece.includes(otherPlayer) && !piece.includes('jumped'))).length ), 0);

      
      return playerPieces + 3*playerKings + playerEdges - otherPieces - 3*otherKings - otherEdges;
    });
    
    const bestMove = moveValues.reduce((moveIndex, result, ci)=> (result > moveValues[moveIndex] ? ci : moveIndex), 0);
    
    //return allMoves[ Math.floor(allMoves.length * Math.random()) ]; // pick a move randomly
    
    return allMoves[ bestMove ]; // pick the best move by the formula
  }
```
this is a course on how to build a checkers game using reactJS

We're starting today from a 2p-local game, out goal is to add a basic computer player


## agenda

1. review code for 2p-local

- what are the functions which control the game logic?
- how will we use them to program the computer player?

2. 1p v cp local

- select cp game or 2p local game
- didUpdate lifecycle -> trigger cp play
- computer player
  - list available options
  - review multijump options
  - pick one randomly
- move pieces on board
  - delay move for UX
  - playing multijumps
  - delay multijumps for UX
  - terminating infinite king jumps
- improving decision
  - evaluate options
  - pick the best one
  - psudeocode minimax algorithm (homework!)
- test game with enzyme




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


### didUpdate lifecycle -> trigger cp play


Let's start by thinking through what happends when p1 does move:

- user clicks a square to move to
- eventually the turn is determined to be over by the `calculatePiecesAfterMove` function during
```js
    } else if(selectedMove){
      const { jumping, turnOver, pieces } = calculatePiecesAfterMove(
        this.state.pieces,
        [selectedSquare, [col, row]]
      );
```
- `this.state.turn` is updated to `'p2'`


the last item in the list is very important, as we will use it to trigger the computer player.

when the `state` updates, React will call a number of [lifecycle functions](https://www.google.com/search?q=react+lifecycle+didupdate) 


[componentDidUpdate](https://reactjs.org/docs/react-component.html#componentdidupdate) will be triggered just as soon as `this.state.turn` is updated to be 'p2'


based on the example in the docs, we'll be able to run code whenever some `state` or `props` value changes...

(( joke ))

here we'll check that `this.state.turn` is `'p2'` and `prevState.turn` isn't, which means our computer player should pick his move!

<sub>./src/Game.js</sub>
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

we'll be able to implement the entire computer player in this one function (though we may choose to refactor a bit later)

it will be instructive to think through in English (or any other language not Java) how we've been picking checkers move our entire lives

```
first we look at the board, noting which pieces are ours - we definitely can't move someone else's pieces

only some of our pieces can move, and if any can make jumps we have to make a jump

now we review our pieces, and find the jumps and multi-jumps available or if none, non-jump moves

...

now that we know all the options available for our turn, we want to choose the best one!

probably if we can jump a lot of pieces, we should take that option

if we can jump a piece and make a king, that sounds good

if there's no other jumps, we should try to king a piece

otherwise, we can try to get a piece to the edge of the board, where it can't be captured

```

roughly speaking, we get a list of options, evaluate their quality, and pick the best one.


#### list available options

we have a function for this! Let's call it and see what we get back from it

<sub>./src/Game.js</sub>
```js
//...

  makeCPmove = ()=>{
    // here we'll calculate available moves, evaluate them, and choose one.
    const allMoves = calculateAllTurnOptions(this.state.pieces, this.state.turn);
    console.log(allMoves);
  }

//...
```

we can see on the console an array of turn-arrays (single moves or multi-jumps) of move-arrays (two numbers [col, row])


#### review multijump options

I found it very useful while writing this game to read through a few options to make sure they make sense on the board. Remeber the turns are `[moveFrom, moveTo, ...restMoveTos]` and each move is `[col, row]` (which are zero-indexed of course!

making the decision should be pretty easy once we can imagine all the moves from the output turn-move-arrays


#### pick one randomly

our first goal will just be to program the computer to play a move for our user to play against

so let's pick one without thinking about it too much for now

<sub>./src/Game.js</sub>
```js
//...

  makeCPmove = ()=>{
    // here we'll calculate available moves, evaluate them, and choose one.
    const allMoves = calculateAllTurnOptions(this.state.pieces, this.state.turn);

    const cpMove = allMoves[0];
  }

//...
```

that was easy lol. Now we can have the computer play the move, and we'll have programmed the worst computer player in history (quickly though!)



### move pieces on board


now that we've chosen a move, making that move won't be that much more complicated than it was for the user-player.

<sub>./src/Game.js</sub>
```js
//...

  makeCPmove = ()=>{
    // here we'll calculate available moves, evaluate them, and choose one.
    const allMoves = calculateAllTurnOptions(this.state.pieces, this.state.turn);

    const cpMove = allMoves[0];


    const { turnOver, pieces } = calculatePiecesAfterMove(this.state.pieces, cpMove);

    this.setState({ pieces, turn: turnOver? 'p1' : 'p2' });

  }

//...
```

this will let us make single moves, and does so jarringly quickly


#### delay move for UX

we can wait half a second before reviewing how the `calculatePiecesAfterMove` function is working

<sub>./src/Game.js</sub>
```js
//...

  makeCPmove = ()=>{
    // here we'll calculate available moves, evaluate them, and choose one.
    const allMoves = calculateAllTurnOptions(this.state.pieces, this.state.turn);

    const cpMove = allMoves[0];

    // placeholder for future better decision logic

    const { turnOver, pieces } = calculatePiecesAfterMove(this.state.pieces, cpMove);

    setTimeout(()=> this.setState({ pieces, turn: turnOver? 'p1' : 'p2' }, 500);
  }

//...
```

okay, we're passing the `pieces` in, which makes sense given the function's signature

what's happening to our `cpMove` when we have more than one move?

remember the signature for the function

<sub>./src/util.js</sub>
```js
//...
export const calculatePiecesAfterMove = (inputPieces, [moveFrom, moveTo])=>{
  //...
}
```

those `[]` square brackets are [destructuring](https://www.google.com/search?q=array+argument+destructuring) the input argument

what happens when our `cpMove` is longer than two (from, to), is the extra entries in the array will be ignored.

that's good, but we're going to want to make those moves too!




#### playing multijumps

so far, making computer moves is the same as human moves

primarily, the difference is that our selection will list all the jumps in a multijump, so we'll have to make sure to make all those move correctly. Whereas the human moves we could just wait for the user to click repeatedly.


what we can do here is check that `turnOver` output we got back from calling `calculatePiecesAfterMove`

if the turn isn't over, we should probably keep moving!

<sub>./src/Game.sj</sub>
```js
//...

    if(!turnOver) {
      const { turnOver: nextTurnOver, pieces: nextPieces } = calculatePiecesAfterMove(
        pieces,
        cpMove.slice(1)
      );

      setTimeout(()=> this.setState({ pieces: nextPieces, turn: nextTurnOver? 'p1' : 'p2' }, 1000);
    }
//...
```

of course, the next move could still not be the end of the turn... anyone who wants to write this as a `do...while` loop is welcome to try! (javascript kept the syntax just for you)

copy-pasting this logic repeatedly will also work (I did that, so I know for sure)



#### delay multijumps for UX

remember, this logic is running syncronously (fast), so we can set a series of timeouts by increasing the timeout-length each time (note 1000ms = 1s is set in the previous solution)


#### terminating infinite king jumps

There's a little wrinkle though when we want to terminate a king jump: kings can jump any number of times infinitely!

(as they can jump back and forth over a piece if they please, as that piece isn't removed until the end of the turn)

This led the `calculateAllTurnOptions` to set a maximum depth for finding multijump moves

- it is currently coded to give up after three jumps, as this is the maximum a non-king can make
- yes, techincally that makes it incorrect
- yes, you should feel free to review the code and reimplement it as a recursive algorithm with maxDepth as a param
- yes, you could also define a better termination condition for ignoring loops in king movement
- do you want to teach the class?


Practically, what this means is, like in user-moves, a king jump can be terminated by playing `[moveFrom, moveFrom]` to the same space it started on


so at the end of our repetition (or loop for the brave), if the turn still isn't over, we can terminate the terminate the king move by passing the last position in to `calculatePiecesAfterMove` as the `from` and `to` the same.


<sub>./src/Game.js</sub>
```js
//...
  if( numberOfJumps === cpMove.length && !turnOver ){
    const { pieces: endPieces } = calculatePiecesAfterMove( prevPieces, [cpMove[cpMove.length-1], cpMove[cpMove.length-1]] );
    setTimeout(()=> this.setState({ pieces: endPieces, turn: 'p1' }, 500 + 500*numberOfJumps );
  }
//...
```


the exact code you end up with may be different - I'm not just publishing a solution! I'm not stackOverflow!

these are the tools you'll need to succeed.



### improving decision

ok, we got the computer player moving his pieces around. However, he's a horrendous player! Let's get back to the top of the `makeCPMove` function and write some better decision logic.

<sub>./src/Game.js</sub>
```js
//...

  makeCPmove = ()=>{
    // here we'll calculate available moves, evaluate them, and choose one.
    const allMoves = calculateAllTurnOptions(this.state.pieces, this.state.turn);

    const cpMove = allMoves[0];

    // placeholder for future better decision logic
  }

//...
```

#### evaluate options

for each option from `allMoves`, we want to calculate a prospective value. Later we'll look at the [minimax algorithm](https://www.google.com/search?q=minimax+algorithm) for looking more than one move ahead.

Based on our pseudocode heuristic from before, we could say the value of a given boardful of pieces is given by:

```
1 point for each of my pieces
2 bonus points for each of my kings
1 bonus point for each piece I have on an edge

minus that amount for my opponent
```

let's use our trusty `.map` and `.reduce` to compute the board-situation after each option for our turn (then the value)

<sub>./src/Game.js</sub>
```js
    // for each turn option, determine the value at the end, pick the biggest value
    // at each possible leaf node (game state), calculate a game state value
    ///// gsv = #p1s + 3*#p1-kings + #edgeP1s - that for p2

    const moveResults = allMoves.map(moves =>
      moves.reduce((p, move, mi)=> calculatePiecesAfterMove(p, [
        ...moves.slice(mi),
        mi === moves.length -1 ? moves[mi] : undefined,
      ]).pieces, pieces)
    );

```


<sub>./src/Game.js</sub>
```js
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

```


#### pick the best one

```js
    const bestMove = moveValues.reduce((moveIndex, result, ci)=> (result > moveValues[moveIndex] ? ci : moveIndex), 0);
    
    return allMoves[ bestMove ]; // pick the best move by the formula
```



#### psudeocode minimax algorithm

(coming soon...)


### test game with enzyme

[enzyme by airbnb](https://airbnb.io/enzyme/) is a fantastic testing utility for react components, which doesn't force us out of our isomorphic js environment! (everyone love isomorphic js!)


`$ yarn add enzyme enzyme-adapter-react-16`

<sub>./src/App.test.js</sub>
```js
//...

import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

//...
```


- read utility functions, refactor them for legibility




#### install enzyme
#### test the entire 2p local flow
#### move the computer player logic to "network" layer
#### mock the network layer and test the cp mode

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
  - apiGateway, lambda, dynamo read call
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
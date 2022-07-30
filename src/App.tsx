import { useEffect, useState } from "react";
import "./app.css";

interface SerializeAndDeserialize {
  serialize: <T>(a: T) => string;
  deserialize: <T>(a: T) => string;
}

const useLocalStorageWithState = function <T>(
  key: string,
  initialProps?: unknown,
  options?: SerializeAndDeserialize
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const defaultOptions = {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  };

  const [state, setState] = useState<T>(() => {
    const valueInLocalStorage = window.localStorage.getItem(key);
    if (valueInLocalStorage) {
      return options
        ? options.deserialize(valueInLocalStorage)
        : defaultOptions.deserialize(valueInLocalStorage);
    }

    return typeof initialProps === "function" ? initialProps() : "";
  });

  useEffect(() => {
    window.localStorage.setItem(
      key,
      options
        ? options.serialize(state as T)
        : defaultOptions.serialize(state as T)
    );
  }, [options, defaultOptions, key, state]);

  return [state, setState];
};

function Board() {
  const emptySquares = Array(9).fill(null);
  const [squares, setSquares] = useLocalStorageWithState<string[]>(
    "squares",
    emptySquares
  );

  const nextValue = calculateNextValue(squares);
  const winner = calculateWinner(squares);
  const status = calculateStatus(winner, squares, nextValue);

  function selectSquare(index: number) {
    if (winner || squares[index] !== null) {
      return;
    }

    const squaresCopy = [...squares];
    squaresCopy[index] = nextValue;

    setSquares(squaresCopy);
  }

  function restart() {
    setSquares(Array(9).fill(null));
  }

  function renderSquare(i: number) {
    return (
      <button className="square" onClick={() => selectSquare(i)}>
        {squares[i]}
      </button>
    );
  }

  return (
    <div>
      <div className="status">{status}</div>
      <div className="board-row">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div className="board-row">
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div className="board-row">
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
      <button className="restart" onClick={restart}>
        restart
      </button>
    </div>
  );
}

function Game() {
  return (
    <div className="game">
      <div className="game-board">
        <Board />
      </div>
    </div>
  );
}

function calculateStatus(
  winner: string | null,
  squares: unknown[],
  nextValue: string
) {
  return winner
    ? `Winner: ${winner}`
    : squares.every(Boolean)
    ? `Scratch: Cat's game`
    : `Next player: ${nextValue}`;
}

function calculateNextValue(squares: string[]) {
  return squares.filter(Boolean).length % 2 === 0 ? "X" : "O";
}

function calculateWinner(squares: string[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function App() {
  return <Game />;
}

export default App;

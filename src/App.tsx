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

  const defaultProps = "";

  const [state, setState] = useState<T>(() => {
    const valueInLocalStorage = window.localStorage.getItem(key);
    if (valueInLocalStorage) {
      return options
        ? options.deserialize(valueInLocalStorage)
        : defaultOptions.deserialize(valueInLocalStorage);
    }

    if (typeof initialProps === "function") {
      return initialProps();
    } else if (String(initialProps)) {
      return initialProps;
    }

    return defaultProps;
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

function Board({
  squares,
  onClick,
}: {
  squares: any;
  onClick: (square: number) => void;
}) {
  function renderSquare(i: number) {
    return (
      <button className="square" onClick={() => onClick(i)}>
        {squares[i]}
      </button>
    );
  }

  return (
    <div>
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
    </div>
  );
}

function Game() {
  const emptySquares = Array(9).fill(null);
  const [history, setHistory] = useLocalStorageWithState<string[][]>(
    "history",
    [emptySquares]
  );
  const [currentStep, setCurrentStep] = useLocalStorageWithState<number>(
    "step",
    0
  );

  const currentSquares = history[currentStep];
  const nextValue = calculateNextValue(currentSquares);
  const winner = calculateWinner(currentSquares);
  const status = calculateStatus(winner, currentSquares, nextValue);

  function selectSquare(square: number) {
    if (winner || currentSquares[square]) {
      return;
    }

    const newHistory = history.slice(0, currentStep + 1);
    const squares = [...currentSquares];

    squares[square] = nextValue;
    setHistory([...newHistory, squares]);
    setCurrentStep(newHistory.length);
  }

  function restart() {
    setHistory([emptySquares]);
    setCurrentStep(0);
  }

  const moves = history.map((_, step) => {
    const desc = step ? `Go to move #${step}` : "Go to game start";
    const isCurrentStep = step === currentStep;
    return (
      <li key={step}>
        <button disabled={isCurrentStep} onClick={() => setCurrentStep(step)}>
          {desc} {isCurrentStep ? "(current)" : null}
        </button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board onClick={selectSquare} squares={currentSquares} />
        <button className="restart" onClick={restart}>
          restart
        </button>
      </div>
      <div className="game-info">
        <div>{status}</div>
        <ol>{moves}</ol>
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

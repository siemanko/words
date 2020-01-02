import React from 'react';

function toggle_reveal(idx) {
    /* This function needs to write to window state
    because some js is not ported to react yet */
    let game = window.game;
    game.revealed[idx] = !game.revealed[idx];
    window.recommended_words.blue = null;
    window.recommended_words.red = null;
    window.render();
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = { gameState: {} };
    }

    render() {
        console.log(this.state.gameState)
        let board;

        const game = this.state.gameState;
        if (game) {
            if (game && !game.error) {
                let boardRows = [];
                for (let i = 0; i < game.num_rows; i += 1) {
                    let rowCells = [];
                    for (let j = 0; j < game.num_cols; j += 1) {
                        let idx = i * game.num_cols + j;

                        let revealStyle = "cell-inrevealed";
                        const colorStyleDict = {
                            r: "cell-red",
                            b: "cell-blue",
                            g: "cell-neutral",
                            e: "cell-end",
                        }
                        let colorStyle = '';
                        let cellStrike = '';
                        if (game.revealed[idx] || game.allrevealed) {
                            revealStyle = "cell-revealed";
                            colorStyle = colorStyleDict[game.type[idx]];
                            if (game.revealed[idx] && game.allrevealed) {
                                cellStrike = "cell-strike";
                            }
                        }
                        let cell = (
                            <td
                                className={`cell-style word ${revealStyle} ${colorStyle} ${cellStrike}`}
                                onDoubleClick={() => { toggle_reveal(idx) }}
                                onTouchEnd={() => { toggle_reveal(idx) }}
                                key={idx}
                            >
                                <span className="cell-text">
                                    {game.words[idx]}
                                </span>
                            </td>
                        );
                        rowCells.push(cell);
                    }
                    boardRows.push(
                        <tr key={i}>{rowCells}</tr>
                    );
                }

                board = <table className="table-style">{boardRows}</table>;
            }
        }

        return (
            <div className="col">
                {/* Non-react stuff binds here */}
                <div className="col" id="game" />
                {board}
            </div>
        );
    }
}

export default Board;
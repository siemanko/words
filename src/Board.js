import React from 'react';

import * as gu from './GameUtils.js';


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
        let board;

        const game = this.state.gameState;
        if (game) {
            if (game && !game.error) {
                var show_all_colors = game.allrevealed
                if (gu.get_remaining(game, 'b') == 0 || gu.get_remaining(game, 'r') == 0 || gu.get_remaining(game, 'e') == 0) {
                    show_all_colors = true;
                }
                // when not in spymaster mode and the game is won show who has won.
                var winner_box = null;
                if (!game.allrevealed && show_all_colors) {
                    if (gu.get_remaining(game, 'b') == 0) {
                        var winner = (<div><span className="text-primary">blue</span> has won the game.</div>);
                    } else if (gu.get_remaining(game, 'r') == 0) {
                        var winner = (<div><span className="text-danger">red</span> has won the game.</div>);
                    } else if (gu.get_remaining(game, 'e') == 0) {
                        var winner = (<div>black word was releaved.</div>);
                    }
                    winner_box = (<div className="alert alert-info" role="alert">
                        {winner} 
                    </div>);
                } 

                let boardRows = [];
                for (let i = 0; i < game.num_rows; i += 1) {
                    let rowCells = [];
                    for (let j = 0; j < game.num_cols; j += 1) {
                        let idx = i * game.num_cols + j;

                        let revealStyle = "cell-inrevealed";
                        const colorStyleDict = {
                            r: "cell-red",
                            b: "cell-blue",
                            n: "cell-neutral",
                            e: "cell-end",
                        }
                        let colorStyle = '';
                        let cellStrike = '';
                        if (game.revealed[idx] || show_all_colors) {
                            revealStyle = "cell-revealed";
                            colorStyle = colorStyleDict[game.type[idx]];
                            if (game.revealed[idx] && show_all_colors) {
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
                {winner_box}
                {/* Non-react stuff binds here */}
                <div className="col" id="game" />
                {board}
            </div>
        );
    }
}

export default Board;

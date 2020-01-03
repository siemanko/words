import React from 'react';

import * as gu from './GameUtils.js';


function toggle_reveal(idx) {
    /* This function needs to write to window state
    because some js is not ported to react yet */
    let game = window.game;
    game.revealed[idx] = !game.revealed[idx];
    window.render();
}


export class BoardNotifications extends React.Component {
    constructor(props) {
        super(props);
        this.state = {hidden: false}
    }

    hide() {
        this.setState({hidden: true});
    }

    render() {
        const game = this.props.game; 
        var revealed_color = gu.get_full_releaved_color(game)

        // when not in spymaster mode and the game is won show who has won.
        var winner_box = null;
        if (!game.allrevealed && revealed_color !== null) {
            if (!this.state.hidden) {
                var exit = <a href="#" onClick={this.hide.bind(this)}><div class="float-right close" >&times;</div></a>
                var winner = null;
                if (revealed_color == 'blue') {
                    winner = (<div><span className="text-primary">blue</span> has won the game.{exit}</div>);
                } else if (revealed_color == 'red') {
                    winner = (<div><span className="text-danger">red</span> has won the game.{exit}</div>);
                } else if (revealed_color == 'black') {
                    winner = (<div>black word was releaved.{exit}</div>);
                }
                winner_box = (<div className="alert alert-info" role="alert">
                    {winner} 
                </div>);
            } 
        } else {
            this.state.hidden = false;
        }
        return winner_box
    }
}

export class Board extends React.Component {
    render() {
        const game = this.props.game; 
        const show_all_colors = game.allrevealed || (gu.get_full_releaved_color(game) !== null)

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

        return (
            <div className="col">
                {/* Non-react stuff binds here */}
                <table className="table-style"><tbody>{boardRows}</tbody></table>
            </div>
        );
    }
}

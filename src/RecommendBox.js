import React from 'react';
import * as gu from './GameUtils.js';
import {model, load_model, recommend} from './recommend.js';


function color_to_flavor(color) {
    return (color == 'red') ? 'text-danger' : 'text-primary';
}


class CluemasterHintWordBox extends React.Component {

    render() {
        var flavor = color_to_flavor(this.props.color);
        var clues = this.props.clues.slice(0, 8);
        var word_list = [];

        if (clues.length == 0) {
            word_list.push(<div key="spinner" className={"spinner-grow spinner-grow-sm align-middle " + flavor} role="status"/>);
        } else {
            for (var i = 0; i < clues.length; i++) {
                word_list.push(<span key={'clue-' + i} className={flavor}> {clues[i]} </span>);
                if (i + 1 < clues.length) {
                    word_list.push(<br key={'br-' + i} />);
                }
            }
        }
        return (<tr>
            <td className="recommend-box cell-style">
                {word_list}
            </td>
        </tr>);
    }
}

class AutoCluesWordBox extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const word_list = [];

        var flavor = color_to_flavor(this.props.color);
        var clues = this.props.clues;

        if (clues.length == 0) {
            word_list.push(<span key="no-clue" className="text-{flavor}"> No clues.</span>);
        } else {
            for (var i = 0; i < clues.length; i++) {
                var opacity = 0.4;
                if (i + 1 == clues.length && this.props.highlight_last) {
                    opacity = 1.0;
                }
                if (clues[i] === null) {
                    word_list.push(<div key={'spinner-' + i} className={"spinner-grow spinner-grow-sm align-middle " + flavor} role="status" />)
                } else {
                    word_list.push(<span key={'clue-' + i} style={{opacity: opacity}} className={flavor}> {clues[i].join(' ')} </span>);
                }
                if (i + 1 < clues.length) {
                    word_list.push(<br key={'br-' + i} />);
                }
            }
        }
        return (<tr>
            <td className="recommend-box cell-style">
                {word_list}
            </td>
        </tr>);
    }
}

function hash(str) {
    var i = str.length
    var hash1 = 5381
    var hash2 = 52711

    while (i--) {
        const char = str.charCodeAt(i)
        hash1 = (hash1 * 33) ^ char
        hash2 = (hash2 * 33) ^ char
    }

    return (hash1 >>> 0) * 4096 + (hash2 >>> 0)
}

function get_query_and_hash(game, color) {
    var w = {r: [], b: [], n: [], e: []};
    var res = 0;
    for (var idx = 0; idx < game.num_rows * game.num_cols; idx += 1) {
        if (!game.revealed[idx]) {
            w[game.type[idx]].push(game.words[idx])
        }
    }

    if (color == 'blue') {
        var good = w.b;
        var bad = w.r.concat(w.n);
    } else {
        var good = w.r
        var bad = w.b.concat(w.n);
    }
    var fail = w.e;
    if (good.length == 0) {
        return [null, null];
    }
    if (game.num_guesses == 'all') {
        var num_guesses = good.length;
    } else {
        var num_guesses = Math.min(good.length, parseInt(game.num_guesses));
    }
    if (game.risk == 'allbutblack') {
        bad = [];
        var risk = 0;
    } else if (game.risk == 'all') {
        bad = [];
        fail = [];
        var risk = 0;
    } else {
        var risk = Math.min(parseInt(game.risk), bad.length);
    }

    var query = {good: good, bad: bad, fail: fail, risk: risk, num_guesses: num_guesses, use_common_words: game.use_common_words};
    var query_hash = 'good:' + good.join(',') + ' bad:' + bad.join(',') +' fail:' + fail.join(',') +
                     ' risk:' + risk + ' num_guesses:' + num_guesses + ' common_words:' + game.use_common_words;
    query_hash = hash(query_hash);
    return [query, query_hash];
}

function next_clue(box, game, color, val) {
    if (model === null) {
        load_model(function() {next_clue(box, game, color, val);});
        return;
    }
    game.num_guesses = val;
    game.auto_clues[color].push(null);
    var idx = game.auto_clues[color].length - 1
    var blacklist = game.auto_clues[color].filter(clue => clue !== null).map(clue => clue[0]);
    box.forceUpdate(); // TODO(mib): why do we need this?
    setTimeout(function() {
        var query = get_query_and_hash(game, color)[0]
        query.blacklist = blacklist
        recommend(query).then(function(value) {
            // TODO: blacklist
            var ng = (game.num_guesses == 'all' ? '∞' : game.num_guesses);
            game.auto_clues[color][idx] = [value[0], ng];
            box.forceUpdate(); // TODO(mib): why do we need this?
        });
    }, 0);
}

export class RecommendBoxNotifications extends React.Component {
    render() {
        const game = this.props.game;
        var cluemaster_hints_needed = gu.human_cluemaster_hints_needed(game);
        var auto_clues_needed = !game.allrevealed && game.enable_auto_clues;
        var clues_needed = (cluemaster_hints_needed || auto_clues_needed);
        var langauge_available = (gu.get_lang(game) == 'en');

        var res = [];

        if (clues_needed) {
            // css hides this when screen is not portrait
            res.push(<div key="lang" className="form-group d-block d-sm-none" id="ai-clues-phone-warning">
                <div className="alert alert-warning" role="alert">
                    Auto clues are not currently supported in portrait mode. Flip your phone.
                </div>
            </div>);
        }

        if (clues_needed && !langauge_available) {
            res.push(<div key="phone" id="recommend-lang-warning">
                <div className="alert alert-warning" role="alert">
                Auto clues currently only work in english.
                </div>
            </div>);
        }
        return <div>{res}</div>;
    }
}

// TODO(szymon): this really should not require threads.
function throttled_execute(queue) {
    if (queue.length == 0) {
        setTimeout(() => throttled_execute(queue), 250);
    } else {
        var next_request = null;
        while(queue.length > 0) {
            next_request = queue.shift();
        }
        next_request(() => throttled_execute(queue));
    }
}

export class RecommendBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cluemaster_hints: {red: [], blue: []},
            cluemaster_hints_hash: {red: null, blue: null},
        };
        this.cluemaster_hints_jobs = {red: [], blue: []};
        setTimeout(() => throttled_execute(this.cluemaster_hints_jobs['red']), 0);
        setTimeout(() => throttled_execute(this.cluemaster_hints_jobs['blue']), 0);
    }

    update_cluemaster_hints(color) {
        var self = this;
        if (model === null) {
            load_model(() => self.update_cluemaster_hints(color));
            return;
        }
        var [query, query_hash] = get_query_and_hash(this.props.game, color);
        var current_hash = this.state.cluemaster_hints_hash;
        var hints = this.state.cluemaster_hints;

        if (query_hash === null) {
            hints[color] = ['no words left to guess.']
            current_hash[color] = null;
            return;
        }

        if (current_hash[color] == query_hash) {
            return;
        }
        hints[color] = [];

        this.cluemaster_hints_jobs[color].push(callback => {
            recommend(query).then(function(value) {
                hints[color] = value;
                current_hash[color] = query_hash;
                self.forceUpdate(callback);
            });
        });

    }

    autoclues_control(game, color) {
        var self = this;
        const buttons = [1, 2, 3, 4, "all"].map(function(val) {
            var remaining = gu.get_remaining(game, color);
            if (val == "all") {
                var enabled = (remaining > 0);
            } else {
                var enabled = (val <= remaining);
            }
            return <button key={val} type="button" className="btn btn-light" onClick={() => next_clue(self, game, color, val)} disabled={!enabled}>
                {val.toString().replace('all', '∞')}
            </button>;
        })

        return (<tr id="auto-cluemaster-control">
            <td className="cell-style align-middle cluemaster-control">
            <form>
                <div className="form-group">
                <label htmlFor="auto-cluemaster" style={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}>
                    Select the number of words to guess for <span className={color_to_flavor(color)}>{color}</span>.</label>
                <div className="btn-group w-100" role="group" id="auto-cluemaster">
                    {buttons}
                </div>
                </div>
            </form>
            </td>
        </tr>)
    }

    render() {
        const game = this.props.game;

        var cluemaster_hints_needed = gu.human_cluemaster_hints_needed(game);
        var auto_clues_needed = !game.allrevealed && game.enable_auto_clues;

        if (gu.get_lang(game) == 'en' && (auto_clues_needed || cluemaster_hints_needed)) {
            var controls = null;

            if (cluemaster_hints_needed) {
                ['red', 'blue'].map(color => this.update_cluemaster_hints(color));
            }

            if (auto_clues_needed) {
                controls = this.autoclues_control(game, gu.next_player(game));
            }

            const state = this.state;
            var boxes = ['red', 'blue'].map(function(color) {
                var highlight = (color != gu.next_player(game));
                if (auto_clues_needed) {
                    return <AutoCluesWordBox key={color} color={color} clues={game.auto_clues[color]} highlight_last={highlight} />;
                } else if (cluemaster_hints_needed) {
                    return <CluemasterHintWordBox key={color} color={color} clues={state.cluemaster_hints[color]} />
                }
            })
                
            return (<div className="col-3 col-lg-2 collapse d-none d-sm-block" id="recommend">
                <div className="row h-100">
                    <div className="col" >
                        <table className="table-style" style={{ borderSpacing: '0rem 1rem' }}>
                            <tbody>
                                {controls}
                                {boxes}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>);
        } else {
            return <div />
        }

    }
};


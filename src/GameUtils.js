export function human_cluemaster_hints_needed(game) {
    return !game.error && game.allrevealed && game.human_cluemaster_hints;
}

export function get_lang(game) {
    return game.seed.split('-', 2)[0]
}

// TODO(szymon): update logic
export function next_player(game) {
    const red_tiles = game.type.filter(x => x == 'r').length;
    const blue_tiles = game.type.filter(x => x == 'b').length;
    const starting_player = (red_tiles > blue_tiles) ? 'red' : 'blue';

    const red_clues = game.auto_clues.red.length;
    const blue_clues = game.auto_clues.blue.length;
    if (red_clues < blue_clues) {
        return 'red';
    } else if (blue_clues < red_clues) {
        return 'blue';
    } else {
        return starting_player;
    }
}

// TODO(mib): how do we share this with index.html?
export function get_remaining(game, c) {
    c = c.replace('blue', 'b').replace('red', 'r');
    var res = 0;
    for (var idx = 0; idx < game.num_rows * game.num_cols; idx += 1) {
        if (!game.revealed[idx] && game.type[idx] == c) {
            res += 1;
        }
    }
    return res;
}

export function get_full_releaved_color(game) { 
    if (get_remaining(game, 'e') == 0) {
        return 'black';
    } else if (get_remaining(game, 'r') == 0) {
        return 'red';
    } else if (get_remaining(game, 'b') == 0) {
        return 'blue';
    } else {
        return null;
    }
}
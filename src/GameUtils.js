export function human_cluemaster_hints_needed(game) {
    return !game.error && game.allrevealed && game.human_cluemaster_hints;
}

export function get_lang(game) {
    return game.seed.split('-', 2)[0]
}

// TODO(szymon): update logic
export function next_player(game) {
    var num_red = game.type.filter(x => x == 'r').length;
    var num_blue = game.type.filter(x => x == 'b').length;
    var turns_so_far = game.auto_clues.red.length + game.auto_clues.blue.length;
    if (num_red > num_blue) {
        var order = ['red', 'blue'];
    } else {
        var order = ['blue', 'red'];
    }
    return order[turns_so_far % 2];
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

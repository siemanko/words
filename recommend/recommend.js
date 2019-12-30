var storage_key = "recommendation";
var vec_shape = [-1, 300]

var model = null;


function load_model(callback) {
    // ensure there's enough storage to store the model
    var vec = null;
    var word = null;

    function process_data() {
        word_to_idx = {}
        for (var i = 0; i < word.length; i++) {
            word_to_idx[word[i]] = i;
        }
        model = {
            vec: tf.tensor(vec).reshape(vec_shape),
            word: word,
            word_to_idx: word_to_idx,
        };
        console.log('model loaded');
        if (callback) {
            callback();
        }
    }

    var load_steps = new Uint8Array(new SharedArrayBuffer(1));
    var total_steps = 2
    function on_step_done() {
        if (Atomics.add(load_steps, 0, 1) === total_steps - 1) {
            ldb.set(storage_key, [vec, word])
            process_data();
        }
    }

    function on_vec_loaded(event) {
        vec = new Float32Array(event.target.response);
        on_step_done();
    }

    function on_word_loaded(event) {
        word = event.target.response;
        on_step_done();
    }

    function on_ldb_ready(value) {
        if (value === null) {
            console.log("fetching model for the first time.");

            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", on_vec_loaded);
            oReq.open("GET", "recommend/vec.bytes");
            oReq.responseType = "arraybuffer";
            oReq.send();

            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", on_word_loaded);
            oReq.open("GET", "recommend/word.json");
            oReq.responseType = "json";
            oReq.send();
        } else {
            console.log("loading model from local storage.");
            vec = value[0];
            word = value[1];
            process_data();
        }
    }

    ldb.get(storage_key, on_ldb_ready);
}

function word_to_vec(word) {
    var idx = model.word_to_idx[word];
    return model.vec.slice(idx, 1);

}

function get_distances(target_vec) {
    return model.vec.mul(target_vec).sum(-1, true).mul(-1).add(1)
}

function distances_to_words(word_list) {
    var res = [];
    for (var word of word_list) {
        res.push(get_distances(word_to_vec(word)))
    }
    return tf.concat(res, -1);
}

function recommend(good, bad, fail, risk, num_guesses) {
    var good_dist = distances_to_words(good);
    var bad_dist = distances_to_words(bad);
    var fail_dist = distances_to_words(fail)

    // this is tiny big hacky - I use tensor.mul(-1).topk to emulate sort.
    var bad_score = bad_dist.mul(-1).topk(bad_dist.shape[1], true).values.slice([0, risk], [-1, 1]).mul(-1).squeeze();
    var bad_score = tf.minimum(fail_dist.min(-1), bad_score);
    var good_score = good_dist.mul(-1).topk(good_dist.shape[1], true).values.slice([0, num_guesses - 1], [-1, 1]).squeeze();

    var score = good_score.add(bad_score);
    var best_scores = score.topk(1000);
    var best_candidates = best_scores.indices.bufferSync().values

    var forbidden_words = new Set()
    for (var word of [...good, ...bad, ...fail]) {
        forbidden_words.add(word);
        forbidden_words.add(word + 's');
    }
    var res = []
    for (var candidate_idx of best_candidates) {
        word = model.word[candidate_idx];
        if (!forbidden_words.has(word)) {
            res.push(word);
            forbidden_words.add(word);
            forbidden_words.add(word + 's');
        }
    }
    return res;
}

function demo_recommend() {
    load_model(function() {
        console.log(recommend(["church", "cat", "atlantis"], ["eye", "aztec", "buck", "pin", "hospital"], ["fair"], 1, 3))
    });
}

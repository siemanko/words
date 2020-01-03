import * as tf from '@tensorflow/tfjs';
import ldb from  './localStorageDB.js';


var storage_key = "recommendation";
var vec_shape = [-1, 300]

var query_cache = {}
export var model = null;


export function load_model(callback) {
    // ensure there's enough storage to store the model
    var vec = null;
    var word = null;
    var common_words = null;
    var other_word_forms = null;

    function process_data() {
        var word_to_idx = {}
        for (var i = 0; i < word.length; i++) {
            word_to_idx[word[i]] = i;
        }
        model = {
            vec: tf.tensor(vec).reshape(vec_shape),
            word: word,
            word_to_idx: word_to_idx,
            common_words: common_words,
            common_words_stems_set: new Set(common_words.map(word => word.stem())),
            other_word_forms: other_word_forms,
        };
        console.log('model loaded');
        if (callback) {
            callback();
        }
    }

    function on_ldb_ready(value) {
        if (value === null) {
            console.log("fetching model for the first time.");

            var vec_promise = new Promise(function(resolve, reject) {
                var oReq = new XMLHttpRequest();
                oReq.addEventListener("load", function(event) {
                    vec = new Float32Array(event.target.response);
                    resolve();
                });
                oReq.open("GET", "recommend/vec.bytes");
                oReq.responseType = "arraybuffer";
                oReq.send();
            });

            var word_promise = new Promise(function(resolve, reject) {
                var oReq = new XMLHttpRequest();
                oReq.addEventListener("load", function(event) {
                    word = event.target.response['word'];
                    common_words = event.target.response['common_words'];
                    other_word_forms =  event.target.response['other_word_forms']
                    resolve();
                });
                oReq.open("GET", "recommend/word.json");
                oReq.responseType = "json";
                oReq.send();
            })

            Promise.all([vec_promise, word_promise]).then(function() {
                ldb.set(storage_key, [vec, word, common_words, other_word_forms])
                process_data();
            })
        } else {
            console.log("loading model from local storage.");
            vec = value[0];
            word = value[1];
            common_words = value[2];
            other_word_forms = value[3];
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

export function recommend(query) {
    console.log("query", query);

    return new Promise(function(resolve, reject) {
        const res = tf.tidy(function() {
            // this is tiny big hacky - I use tensor.mul(-1).topk to emulate sort.
            var fail_and_bad_score = null;
            if (query.fail.length > 0) {
                var fail_dist = distances_to_words(query.fail)
                fail_and_bad_score = fail_dist.min(-1).mul(0.5);
            }
            if (query.bad.length > 0) {
                var bad_dist = distances_to_words(query.bad);
                var bad_score = bad_dist.mul(-1).topk(bad_dist.shape[1], true).values.slice([0, query.risk], [-1, 1]).mul(-1).squeeze();
                if (fail_and_bad_score === null) {
                    fail_and_bad_score = bad_score;
                } else {
                    fail_and_bad_score = tf.minimum(bad_score, fail_and_bad_score);
                }
            }

            var good_dist = distances_to_words(query.good);
            var good_score = good_dist.mul(-1).topk(good_dist.shape[1], true).values.slice([0, query.num_guesses - 1], [-1, 1]).squeeze();

            var score = good_score;
            if (fail_and_bad_score !== null) {
                score = score.add(fail_and_bad_score);
            }
            var best_scores = score.topk(300);
            var best_candidates = best_scores.indices.arraySync()

            var forbidden_words = new Set()

            function forbid_word(word) {
                forbidden_words.add(word);
                forbidden_words.add(word + 's');
                forbidden_words.add(word + 'ing');
                forbidden_words.add(word + 'ings');
                forbidden_words.add(word + 'ed');
                forbidden_words.add(word.stem());
                (model.other_word_forms[word] || []).forEach(function(word_form) {
                    forbidden_words.add(word_form);
                });
            }

            var most_common_words = model.common_words.slice(0, 100);
            for (var word of [...query.good, ...query.bad, ...query.fail, ...(query.blacklist || []), ...most_common_words]) {
                forbid_word(word)
            }
            var res = []
            for (var candidate_idx of best_candidates) {
                const word = model.word[candidate_idx];
                const forms = [word].concat(model.other_word_forms[word] || []);
                if(forms.some(word => forbidden_words.has(word))) {
                    continue
                }

                if (query.use_common_words && !model.common_words_stems_set.has(word.stem())) {
                    continue
                }
                if (word.length <= 2) {
                    // short 2 letter clues are generally bad.
                    continue;
                }
                res.push(word);
                forbid_word(word)
            }
            return res
        });
        resolve(res);
    });
}

export function demo_recommend() {
    load_model(function() {
        var promise = recommend(["church", "cat", "atlantis"], ["eye", "aztec", "buck", "pin", "hospital"], ["fair"], 1, 3);
        promise.then(function(value) { console.log(value.slice(0, 5)); });
    });
}

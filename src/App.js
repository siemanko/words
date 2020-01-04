import React from 'react';
import {Board, BoardNotifications} from  './Board.js';
import {RecommendBox, RecommendBoxNotifications} from  './RecommendBox.js';
import './App.css';
import natural from 'natural';

function App() {
  // needed for recommend.js
  natural.LancasterStemmer.attach();

  return (
    <div>
      <NavBar />
      <AboutModal />
      <SettingsModal />
      <GamePanel ref={(gamePanelComponent) => {window.gamePanelComponent = gamePanelComponent}} />
    </div>
  );
}

function AboutModal() {
  return (<div className="modal fade" id="about-modal" tabIndex="-1" role="dialog" aria-labelledby="about-modal-label" aria-hidden="true">
    <div className="modal-dialog" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title" id="about-modal-label">About Words</h5>
          <button type="button" className="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <p>Simple website to keep track of words game.</p>

          <p>On laptops you need to <b>double-click</b> the words to select them.</p>

          <p>Check out <i>AI Clues</i> tab for a mode where computer recommends the clues. In <i> Give Clues</i> mode there's a settings to enable AI generated suggestions for clues.</p>
        </div>
        <div className="modal-footer">
          <a className="btn btn-info" href="https://en.wikipedia.org/wiki/Codenames_(board_game)">Rules</a>
          <a className="btn btn-info" href="https://github.com/siemanko/words/">Source</a>
        </div>
      </div>
    </div>
  </div>
  );
}

function SettingsModal() {
  return (<div className="modal fade" id="settings-modal" tabIndex="-1" role="dialog" aria-labelledby="settings-modal-label" aria-hidden="true">
    <div className="modal-dialog" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title" id="about-modal-label">Settings</h5>
          <button type="button" className="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        
        <div className="modal-body">
          <form>
            <div className="form-group">
              <label className="text-justify">
                Double click to reveal a word<br />
                <small>Do you sometimes accidentally reveal a word because of your clumsy laptop touchpad? This option might be for you!.</small>
              </label>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" value="" id="double-click"/>
                <label className="form-check-label" htmlFor="double-click">
                  require double click / tap to reveal a word
                </label>
              </div>
            </div>
            <hr />
            <div className="form-group">
              <label className="text-justify">
                Display AI hints<br />
                <small>In <tt>Give clues</tt> view we will display a list of suggested clues for the player to chose from. It is still up to them whether to use the suggestion or not.</small>
              </label>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" value="" id="human-cluemaster-hints"/>
                <label className="form-check-label" htmlFor="human-cluemaster-hints">
                  help me come up with clues
                </label>
              </div>
            </div>
            <hr />
            <div className="form-group">
              <label className="text-justify">
                Use only popular words<br />
                <small>The model can produce clues based on pretty large dictionary of words - about 30k - this allows it to sometimes find an original and awesome hint 
                  for a board where human might think that all hope is lost. However, this comes at a price - the clues can sometimes be unusual, offensive, hard to understrand or even google!
                  If this is too much for you consider the option below. </small>
              </label>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" value="" id="use-common-words" />
                <label className="form-check-label" htmlFor="use-common-words">
                  Keep it simple
                </label>
              </div>
            </div>
            <hr />

            <div className="form-group">
              <label htmlFor="risk" className="text-justify">
                Risk tolerance<br />
                <small>The number of bad words that are ignored when coming up with clues. Zeros words is the safest option, but might sometimes result in more awkward clues.</small>
              </label>
              <select className="form-control" id="risk">
                <option value="0">zero words</option>
                <option value="1">one word</option>
                <option value="2">two words</option>
                <option value="3">three words</option>
                <option value="allbutblack">all words (no black)</option>
                <option value="all">all words (including black)</option>
              </select>
            </div>
            <hr />

            <div className="form-group">
              <label className="text-justify">
                AI Model Statistics<br />
                <small>Displays information about the automatic clue suggestion model, e.g. which words is the clue related to or what is its score.</small>
              </label>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" value="" id="debug-enable" disabled/>
                <label className="form-check-label" htmlFor="debug-enable">
                  I want to know everything! <i>(coming soon!)</i>
                </label>
              </div>
            </div>
          </form>
        </div>
       
      </div>
    </div>
  </div>
  );
}

class GamePanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            game: null
        };
    }

    render() {
        const game = this.state.game;

        if (game === null) {
            return <div />;
        } else if (game.error !== null) {
            return <p class="lead"> {game.error}</p>;
        } else {
            return (
                <div>
                  <div>
                    <RecommendBoxNotifications game={game} />
                    <BoardNotifications game={game} />
                  </div>
                  <div className="container-fluid h-100">
                    <div className="row h-100">
                      <RecommendBox game={game} />
                      <Board game={game} />
                    </div>
                  </div>
                </div>
            );
        }
    }
}

function NavBar() {
  return (
    <nav className="navbar fixed-top navbar-expand-lg navbar-light bg-light" id="main-navbar">
      <span className="navbar-brand">Words</span>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#menu" aria-controls="menu" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="menu">
        {/* navigation buttons */}
        <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
          
          {/* game modes  */}
          <li id="guess-li" className="nav-item">
            <a className="nav-link" href="#" id="guess">
              <img src="icons/guess.svg" style={{ height: '2rem' }} />&nbsp;Guess
            </a>
          </li>
          <li id="cluemaster-li" className="nav-item">
            <a className="nav-link" href="#" id="cluemaster">
              <img src="icons/detective.svg" style={{ height: '2rem' }} />&nbsp;Give&nbsp;Clues
            </a>
          </li>
          <li id="ai-cluemaster-li" className="nav-item">
            <a className="nav-link" href="#" id="ai-cluemaster">
              <img src="icons/ai.svg" style={{ height: '2rem' }} />&nbsp;AI&nbsp;Clues
            </a>
          </li>
          {/* settings */}
          <li className="nav-item"><a href='#' id="about" className="nav-link" data-toggle="modal" data-target="#settings-modal">
            <img src="icons/settings.svg" style={{ height: "2rem" }} />&nbsp;Settings
            </a>
          </li>
          {/* about */}
          <li className="nav-item"><a href='#' id="about" className="nav-link" data-toggle="modal" data-target="#about-modal">
            <img src="icons/info.svg" style={{ height: "2rem" }} />&nbsp;About
            </a>
          </li>
          {/* reset  */}
          <li className="nav-item dropdown">
            <a className="nav-link" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <img src="icons/reset.svg" style={{ height: '2rem' }} />&nbsp;Reset
            </a>
            <div className="dropdown-menu">
              <a className="dropdown-item reset-button" href="#" data-language="en">English</a>
              <a className="dropdown-item reset-button" href="#" data-language="pl">Polish</a>
            </div>
          </li>

        </ul>
        <div className="nav-text">
          <span
            style={{ color: 'red' }}
            data-toggle="tooltip"
            data-placement="bottom"
            title="Number of red tiles that weren't discovered yet.">
            Red:&nbsp;<span id="red-left"></span>
          </span>
          &nbsp;&nbsp;
            <span
            style={{ color: 'blue' }}
            data-toggle="tooltip"
            data-placement="bottom"
            align="right"
            title="Number of blue tiles that weren't discovered yet.">
            Blue:&nbsp;<span id="blue-left"></span>
          </span>
          &nbsp;
          &nbsp;
        </div>
        {/* seed input */}
        <form className="form-inline my-2 my-lg-0">
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text" id="basic-addon1">seed</span>
            </div>
            <input className="form-control" type="text" className="form-control" id="seed"
              placeholder="seed" data-toggle="tooltip" data-placement="bottom" title="Type this on a different device to get the same game" />
          </div>
        </form>

      </div >
    </nav >
  );
}

export default App;

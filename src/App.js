import React from 'react';
import Board from  './Board.js'
import './App.css';

function App() {
  return (
    <div>
      <NavBar />
      <AboutModal />
      <MainPanel />
    </div>
  );
}

function AboutModal() {
  return (<div className="modal fade" id="about-modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div className="modal-dialog" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title" id="exampleModalLabel">About Words</h5>
          <button type="button" className="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <p>Simple website to keep track on a codenames game.</p>

          <p>On laptops you need to <b>double-click</b> the words to select them.</p>

          <p>Check out <i>Spy assistant</i> tab for an automated tool to recommend cluemaster clues. It works best towards endgame.</p>
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

function MainPanel() {
  return (
    <div>
      <div className="container-fluid h-100">
        <div className="row h-100">
          <div className="col-3 col-lg-2 collapse d-none d-sm-block" id="recommend">
            <div className="row h-100">
              <div className="col" >
                <table className="table-style" style={{ borderSpacing: '0rem 1rem' }}>
                  <tr id="auto-cluemaster-control">
                    <td className="cell-style align-middle cluemaster-control">
                      <form>
                        <div className="form-group">
                          <label for="auto-cluemaster" style={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}>Select the number of words to guess for <span id='auto-cluemaster-next-player'></span>.</label>
                          <div className="btn-group w-100" role="group" id="auto-cluemaster">
                            <button type="button" className="btn btn-light" data-value="1">1</button>
                            <button type="button" className="btn btn-light" data-value="2">2</button>
                            <button type="button" className="btn btn-light" data-value="3">3</button>
                            <button type="button" className="btn btn-light" data-value="4">4</button>
                            <button type="button" className="btn btn-light" data-value="all">∞</button>
                          </div>
                        </div>
                      </form>
                    </td>
                  </tr>
                  <tr>
                    <td className="recommend-box cell-style" id="recommend-box-red">

                    </td>
                  </tr>
                  <tr>
                    <td className="recommend-box cell-style" id="recommend-box-blue">

                    </td>
                  </tr>
                </table >
              </div>
            </div>
          </div>
          <Board ref={(boardComponent) => {window.boardComponent = boardComponent}} />
        </div>
      </div>
    </div>
  );
}

function NavBar() {
  return (
    <nav className="navbar fixed-top navbar-expand-lg navbar-light bg-light">
      <span className="navbar-brand">Words</span>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#menu" aria-controls="menu" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="menu">
        {/* navigation buttons */}
        <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
          <li className="nav-item"><a href='#' id="about" className="nav-link" data-toggle="modal" data-target="#about-modal">
            <img src="icons/info.svg" style={{ height: "2rem" }} />&nbsp;About
            </a></li>
          <li id="cluemaster-li"
            className="nav-item"
            data-toggle="tooltip"
            data-placement="bottom"
            title="Display the colors of all tiles.">
            <a className="nav-link" href="#" id="cluemaster"><img src="icons/detective.svg" style={{ height: '2rem' }} />&nbsp;Clue Master</a>
          </li>
          {/* spy assistant  */}
          <li className="nav-item dropdown">
            <a className="nav-link" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <img src="icons/ai.svg" style={{ height: '2rem' }} />&nbsp;AI Clue Master
                </a>
            <div className="dropdown-menu text-muted wide-non-mobile">
              <div className="form-group" id="recommend-lang-warning">
                <div className="alert alert-warning" role="alert">
                  Currently only works for english.
                        </div>
              </div>
              <div className="form-group d-block d-sm-none" id="recommend-lang-warning">
                <div className="alert alert-warning" role="alert">
                  Currently does not work on portrait mode. Flip your phone.
                        </div>
              </div>
              <div id="intro-recommend">
                <form className="px-4 py-1">
                  <div className="form-group text-justify">
                    <small>Automated tool to recommend cluemaster clues. It works best towards endgame. It is based on the <a href="https://nlp.stanford.edu/projects/glove/">glove vectors</a>. This specific application was inspired by a <a href="https://jsomers.net/glove-codenames/">blog post</a> that I saw on hacker news.</small>
                  </div>
                  <div className="form-group text-center">
                    <button className="btn btn-primary" id="enable-recommend">Enable</button>
                  </div>
                </form>
              </div>
              <div id="recommend-settings">
                <h6 className="dropdown-header">Spy Assistant Settings</h6>

                <form className="px-4 py-3">
                  <div className="form-group">
                    <label for="risk">
                      Risk tolerance<br />
                      <small>The number of bad words that are ignored when coming up with clues. Zeros words is the safest option, but might result in more awkward clues.</small>
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
                  <div className="form-group">
                    <label for="num-guesses">
                      Target Words<br />
                      <small>Number of words that the assistant will try to hint at. The larger the number the harder is it to come up with a sensible clue.</small>
                    </label>
                    <select className="form-control" id="num-guesses">
                      <option value="1">one word</option>
                      <option value="2">two words</option>
                      <option value="3">three words</option>
                      <option value="4">four words</option>
                      <option value="all">all</option>
                    </select>
                  </div>
                  <div className="form-group text-center">
                    <button className="btn btn-light" id="disable-recommend">Disable</button>
                  </div>
                </form>
              </div>
            </div>

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
            Red left: <span id="red-left"></span>
          </span>
          &nbsp;
            <span
            style={{ color: 'blue' }}
            data-toggle="tooltip"
            data-placement="bottom"
            align="right"
            title="Number of blue tiles that weren't discovered yet.">
            Blue left: <span id="blue-left"></span>
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

import React from 'react';
import './App.css';

function App() {
  return (
    <div>
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
                    <td class="cell-style align-middle cluemaster-control">
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
                    <td classNam="recommend-box cell-style" id="recommend-box-blue">

                    </td>
                  </tr>
                </table >
              </div>
            </div>
          </div>
          <div className="col" id="game"></div>
        </div>
      </div>
    </div>
  );
}

export default App;

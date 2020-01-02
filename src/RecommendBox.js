import React from 'react';

class RecommendBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = { gameState: {} };
    }

    render() {
        const game = this.state.gameState;
        if (game) {
            return (<div className="col-3 col-lg-2 collapse d-none d-sm-block" id="recommend">
                <div className="row h-100">
                <div className="col" >
                    <table className="table-style" style={{ borderSpacing: '0rem 1rem' }}>
                    <tr id="auto-cluemaster-control">
                        <td className="cell-style align-middle cluemaster-control">
                        <form>
                            <div className="form-group">
                            <label htmlFor="auto-cluemaster" style={{ marginLeft: '0.5rem', marginRight: '0.5rem' }}>Select the number of words to guess for <span id='auto-cluemaster-next-player'></span>.</label>
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
            </div>);
        }
        return <div />;
    }
};

export default RecommendBox;

import React from 'react';

// Semantic UI example
import { Button, Icon } from 'semantic-ui-react';

// DB common lib
import DB from './common/db';

export default class App extends React.Component {
  render() {
    const mydb = new DB();
    mydb.connect();

    return (
      <div className="window">
        <header className="toolbar toolbar-header">
          <h1 className="title">Soepriatna DB App</h1>
        </header>

        <div className="window-content">
          <div className="pane-group">
            <div className="pane-sm sidebar">A</div>

            <div className="pane">
              <div>
                <h2>Welcome to React!</h2>
                <Button icon labelPosition="left">
                  <Icon name="pause" />
                  Hello World!
                </Button>
              </div>
            </div>
          </div>
        </div>

        <footer className="toolbar toolbar-footer">
          <h1 className="title">By Adrien Soepriatna (c) 2018</h1>
        </footer>
      </div>
    );
  }
}

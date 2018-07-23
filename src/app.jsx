import React from 'react';

/* Semantic UI example */
import { Button, Icon, Container } from 'semantic-ui-react';

/* React Quill */
import ReactQuill from 'react-quill';

/* DB common lib */
import DB from './components/db';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    /* This state */
    this.state = {
      text: '', // You can also pass a Quill Delta here
      data: {
        rating: 0,
        lastUpdate: 'unknown',
      },
    };

    /* React Quill setup */
    this.modules = {
      formula: true,
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['link', 'image'],
        ['clean'],
        ['formula'],
      ],
    };

    /* React Quill formats */
    this.formats = [
      'header',
      'bold',
      'italic',
      'underline',
      'strike',
      'blockquote',
      'list',
      'bullet',
      'indent',
      'link',
      'image',
    ];
  }

  render() {
    const mydb = new DB();
    mydb.connect();

    return (
      <div className="window">
        <header className="toolbar toolbar-header">
          <h1 className="title">Soepriatna DB App</h1>
          <div className="toolbar-actions">
            <div className="btn-group">
              <button className="btn btn-default">
                <span className="icon icon-home" />
              </button>
            </div>
          </div>
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
                <Container>
                  <ReactQuill
                    theme="snow"
                    readOnly={false}
                    value={this.state.text}
                    modules={this.modules}
                    onChange={this.handleChange}
                  />
                </Container>
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

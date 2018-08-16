/* React */
import React from 'react';

/* Electrons */
import electron, { ipcRenderer } from 'electron';

import uuidv4 from 'uuid/v4';

/* Semantic UI example */
import {
  Button,
  Input,
  Icon,
  Container,
  Grid,
  Header,
  Menu,
  Segment,
  Label,
  Dropdown,
  Rating,
} from 'semantic-ui-react';

/* React Quill */
import ReactQuill from 'react-quill';

/* My IPC */
const ipc = ipcRenderer;

/* Alias for my console debug */
const Console = console;

export default class EditApp extends React.Component {
  constructor(props) {
    super(props);
    /* This state */
    this.state = {
      qID: -1,
      qCategory: '',
      qText: '',
      qOptions: [],
      qAnswers: [],
      qDiffLv: 0,
      qCreatedDate: '',
      qLastUpdated: '',
      editData: null,
    };

    /* React Quill setup */
    this.rQmodules = {
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
    this.rQformats = [
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

    /* UI Handers */
    this.handleRqChanges = (value) => {
      this.setState({ qText: value });
    };

    this.handleQDiffChanges = (e, { rating }) => {
      this.setState({ qDiffLv: rating });
    };

    this.handleDeleteQOption = (idx) => {
      Console.log(`Removing option # ${idx}`);
      const newOption = this.state.qOptions;
      newOption.splice(idx, 1);
      // Console.log(`Option contents: ${newOption}`);
      this.setState({ qOptions: newOption });
    };

    this.handleAddQOption = () => {
      const newOption = this.state.qOptions;
      newOption.push('New Option');
      this.setState({ qOptions: newOption });
    };

    this.handleDeleteQAnswer = (idx) => {
      Console.log(`Removing answer # ${idx}`);
      const newAnswer = this.state.qAnswers;
      newAnswer.splice(idx, 1);
      // Console.log(`Answer contents: ${newAnswer}`);
      this.setState({ qAnswers: newAnswer });
    };

    this.handleAddQAnswer = () => {
      const newAnswer = this.state.qAnswers;
      newAnswer.push('New Answer');
      this.setState({ qAnswers: newAnswer });
    };

    /* IPC handler from another renderer */
    this.handleIpcR2RAsyncRecv = (event, arg) => {
      const { cmd, data } = arg;

      switch (cmd) {
        case 'launchQEdit':
          Console.log(`launchQEdit received: data: ${JSON.stringify(data)}`);
          this.setState({
            qID: data.editData.ID,
            qCategory: data.editData.CATEGORY,
            qText: data.editData.QUESTION_DATA.q,
            qOptions: data.editData.QUESTION_DATA.o,
            qAnswers: data.editData.QUESTION_DATA.a,
            qDiffLv: data.editData.DIFFICULTY_LV,
            qCreatedDate: data.editData.CREATED_DATE,
            qLastUpdated: data.editData.LAST_UPDATED,
            editData: data.editData,
          });
          break;

        default:
          Console.log(`CMD: ${cmd} is not supported yet (ASYNC). Data: ${JSON.stringify(data)}`);
          break;
      }
    };

    /* Send ASYNC to another renderer */
    this.sendRendererReqAsync = (dbCmd, paramObj = null) =>
      ipc.send('r2r-async-msg-resp', { cmd: dbCmd, data: paramObj });

    /* Receive ASYNC from another renderer */
    ipc.on('r2r-async-msg-req', this.handleIpcR2RAsyncRecv);
  }

  render() {
    const {
      qID,
      qCategory,
      qText,
      qOptions,
      qAnswers,
      qDiffLv,
      qCreatedDate,
      qLastUpdated,
    } = this.state;
    return (
      <div>
        <Segment>
          <Label attached="top" size="large">{`Question Update: #${qID}`}</Label>
          <Container>
            <Label>{`Created date: ${qCreatedDate}`}</Label>
            <Label>{`Last updated date: ${qLastUpdated}`}</Label>
          </Container>
          <br />
          <Container>
            <ReactQuill
              value={qText}
              modules={this.rQmodules}
              onChange={this.handleRqChanges}
              theme="snow"
            />
          </Container>
          <br />
          <Container>
            <Segment>
              <Label attached="top left">Options</Label>
              {qOptions.map((item, i) => (
                <div key={`option-${uuidv4()}`}>
                  <Label horizontal color={'teal'}>
                    {`Option ${i + 1}`}
                    <Icon
                      name="delete"
                      onClick={() => {
                        this.handleDeleteQOption(i);
                      }}
                    />
                  </Label>
                  <Input>{item}</Input>
                  <br />
                  <br />
                </div>
              ))}
              <Label horizontal as="a" color={'blue'} onClick={this.handleAddQOption}>
                <Icon name="add" />
                Add new option
              </Label>
            </Segment>
            <br />
            <Segment>
              <Label attached="top left">Answers</Label>
              {qAnswers.map((item, i) => (
                <div key={`answer-${uuidv4()}`}>
                  <Label horizontal color={'green'}>
                    {`Answer ${i + 1}`}
                    <Icon
                      name="delete"
                      onClick={() => {
                        this.handleDeleteQAnswer(i);
                      }}
                    />
                  </Label>
                  <Input>{item}</Input>
                  <br />
                  <br />
                </div>
              ))}
              <Label horizontal as="a" color={'blue'} onClick={this.handleAddQAnswer}>
                <Icon name="add" />
                Add new answer
              </Label>
            </Segment>
            <br />
            <Label>
              Difficulty Level:
              <Label.Detail>
                <Rating
                  icon="star"
                  maxRating={5}
                  rating={qDiffLv}
                  onRate={this.handleQDiffChanges}
                />
              </Label.Detail>
            </Label>
          </Container>
          <br />
          <Container>
            <Button size="mini">Update</Button>
            <Button size="mini">Reset</Button>
            <Button size="mini">Cancel</Button>
          </Container>
        </Segment>
      </div>
    );
  }
}

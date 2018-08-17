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
  Accordion,
  Checkbox,
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
      qOptions0: '',
      qOptions1: '',
      qOptions2: '',
      qOptions3: '',
      qOptions4: '',
      qUserAnswers: '',
      qDiffLv: 0,
      qCreatedDate: '',
      qLastUpdated: '',
      editData: null,
      categories: null,
      qCatList: [],
      cat_groups: null,
      qCatGroupList: [],
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

    this.handleMcOptionToggle = (e, d, i) => {
      const { checked } = d;
      // Console.log(`Data: ${checked}, idx: ${i}`);

      let newState = null;

      switch (i) {
        case 0:
          newState = this.state.qOptions0;
          newState.ca = checked ? '1' : '0';
          this.setState({ qOptions0: newState });
          break;
        case 1:
          newState = this.state.qOptions1;
          newState.ca = checked ? '1' : '0';
          this.setState({ qOptions1: newState });
          break;
        case 2:
          newState = this.state.qOptions2;
          newState.ca = checked ? '1' : '0';
          this.setState({ qOptions2: newState });
          break;
        case 3:
          newState = this.state.qOptions3;
          newState.ca = checked ? '1' : '0';
          this.setState({ qOptions3: newState });
          break;
        case 4:
          newState = this.state.qOptions4;
          newState.ca = checked ? '1' : '0';
          this.setState({ qOptions4: newState });
          break;
        default:
          Console.log(`This option is not yet supported. i: ${i}`);
          break;
      }
    };

    this.handleMcOptionContents = (v, i) => {
      let newState = null;

      switch (i) {
        case 0:
          newState = this.state.qOptions0;
          newState.op = v;
          this.setState({ qOptions0: newState });
          break;
        case 1:
          newState = this.state.qOptions1;
          newState.op = v;
          this.setState({ qOptions1: newState });
          break;
        case 2:
          newState = this.state.qOptions2;
          newState.op = v;
          this.setState({ qOptions2: newState });
          break;
        case 3:
          newState = this.state.qOptions3;
          newState.op = v;
          this.setState({ qOptions3: newState });
          break;
        case 4:
          newState = this.state.qOptions4;
          newState.op = v;
          this.setState({ qOptions4: newState });
          break;
        default:
          Console.log(`This option is not yet supported. i: ${i}`);
          break;
      }
    };

    this.handleUserAnswer = (v) => {
      this.setState({ qUserAnswers: v });
    };

    /* IPC handler from another renderer */
    this.handleIpcR2RAsyncRecv = (event, arg) => {
      const { cmd, data } = arg;

      let tempI = 0;
      let tempVar1 = null;
      let tempVar2 = null;
      const tempMco = [
        { op: '', ca: '0' },
        { op: '', ca: '0' },
        { op: '', ca: '0' },
        { op: '', ca: '0' },
        { op: '', ca: '0' },
      ];

      switch (cmd) {
        case 'launchQEdit':
          // Console.log(`launchQEdit received: data: ${JSON.stringify(data)}`);

          tempVar1 = [];
          data.cat_groups.forEach((e) => {
            tempVar1.push({ text: e.LABEL, value: e.ID, description: e.DESCRIPTION });
          });

          tempVar2 = [];
          data.categories.forEach((e) => {
            const cgIdx = tempVar1.findIndex((v) => v.value === e.CAT_GROUP);
            const groupName = tempVar1[cgIdx].text;
            tempVar2.push({
              text: `${groupName}-${e.LABEL}`,
              value: e.ID,
              description: e.DESCRIPTION,
            });
          });

          /* Build multiple choice options */
          for (tempI = 0; tempI < data.editData.QUESTION_DATA.mc.length; tempI += 1) {
            tempMco[tempI].op = data.editData.QUESTION_DATA.mc[tempI].op;
            tempMco[tempI].ca = data.editData.QUESTION_DATA.mc[tempI].ca;
          }

          this.setState({
            qID: data.editData.ID,
            qCategory: data.editData.CATEGORY,
            qText: data.editData.QUESTION_DATA.q,
            qOptions0: tempMco[0],
            qOptions1: tempMco[1],
            qOptions2: tempMco[2],
            qOptions3: tempMco[3],
            qOptions4: tempMco[4],
            qUserAnswers: data.editData.QUESTION_DATA.ua,
            qDiffLv: data.editData.DIFFICULTY_LV,
            qCreatedDate: data.editData.CREATED_DATE,
            qLastUpdated: data.editData.LAST_UPDATED,
            qCatList: tempVar2,
            qCatGroupList: tempVar1,
            editData: data.editData,
            categories: data.categories,
            cat_groups: data.cat_groups,
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

    /* Helper functions */
    this.handleQUpdates = (ev, data) => {
      // Console.log(`QU: ${ev}, ${JSON.stringify(data)}`);

      const newOption = this.state.qOptions;
      newOption[data['data-key']] = data.value;

      Console.log(
        `data-key: ${data['data-key']}, new value: ${data.value}, new option: ${JSON.stringify(
          newOption,
        )}`,
      );

      this.setState({ qOptions: newOption });
    };

    /* End of constructor */
  }

  render() {
    const {
      qID,
      qCategory,
      qText,
      qOptions0,
      qOptions1,
      qOptions2,
      qOptions3,
      qOptions4,
      qUserAnswers,
      qDiffLv,
      qCreatedDate,
      qLastUpdated,
      qCatList,
    } = this.state;

    return (
      <Segment>
        <Label attached="top" size="large">{`Question Update: #${qID}`}</Label>

        <Grid>
          {/* Date and Timestamps */}
          <Grid.Row>
            <Container textAlign="center">
              <Label>{`Created date: ${qCreatedDate}`}</Label>
              <Label>{`Last updated date: ${qLastUpdated}`}</Label>
            </Container>
          </Grid.Row>

          {/* Questions */}
          <Grid.Row>
            <Container fluid>
              <Segment>
                <Label attached="top left">Question</Label>
                <ReactQuill
                  value={qText}
                  modules={this.rQmodules}
                  onChange={this.handleRqChanges}
                  theme="snow"
                />
              </Segment>
            </Container>
          </Grid.Row>

          {/* Multiple Choise group */}
          <Grid.Row>
            <Container fluid>
              <Segment>
                <Label attached="top left">Multiple choice options</Label>
                <Segment>
                  <Label color="teal" attached="top left">
                    <Checkbox
                      label="Option 1 Answer"
                      checked={qOptions0.ca === '1'}
                      readOnly={false}
                      onChange={(e, d) => {
                        this.handleMcOptionToggle(e, d, 0);
                      }}
                    />
                  </Label>
                  <ReactQuill
                    value={qOptions0.op}
                    modules={this.rQmodules}
                    theme="snow"
                    onChange={(v) => {
                      this.handleMcOptionContents(v, 0);
                    }}
                  />
                </Segment>

                <Segment>
                  <Label color="teal" attached="top left">
                    <Checkbox
                      label="Option 2 Answer"
                      checked={qOptions1.ca === '1'}
                      readOnly={false}
                      onChange={(e, d) => {
                        this.handleMcOptionToggle(e, d, 1);
                      }}
                    />
                  </Label>
                  <ReactQuill
                    value={qOptions1.op}
                    modules={this.rQmodules}
                    theme="snow"
                    onChange={(v) => {
                      this.handleMcOptionContents(v, 1);
                    }}
                  />
                </Segment>

                <Segment>
                  <Label color="teal" attached="top left">
                    <Checkbox
                      label="Option 3 Answer"
                      checked={qOptions2.ca === '1'}
                      readOnly={false}
                      onChange={(e, d) => {
                        this.handleMcOptionToggle(e, d, 2);
                      }}
                    />
                  </Label>
                  <ReactQuill
                    value={qOptions2.op}
                    modules={this.rQmodules}
                    theme="snow"
                    onChange={(v) => {
                      this.handleMcOptionContents(v, 2);
                    }}
                  />
                </Segment>

                <Segment>
                  <Label color="teal" attached="top left">
                    <Checkbox
                      label="Option 4 Answer"
                      checked={qOptions3.ca === '1'}
                      readOnly={false}
                      onChange={(e, d) => {
                        this.handleMcOptionToggle(e, d, 3);
                      }}
                    />
                  </Label>
                  <ReactQuill
                    value={qOptions3.op}
                    modules={this.rQmodules}
                    theme="snow"
                    onChange={(v) => {
                      this.handleMcOptionContents(v, 3);
                    }}
                  />
                </Segment>

                <Segment>
                  <Label color="teal" attached="top left">
                    <Checkbox
                      label="Option 5 Answer"
                      checked={qOptions4.ca === '1'}
                      readOnly={false}
                      onChange={(e, d) => {
                        this.handleMcOptionToggle(e, d, 4);
                      }}
                    />
                  </Label>
                  <ReactQuill
                    value={qOptions4.op}
                    modules={this.rQmodules}
                    theme="snow"
                    onChange={(v) => {
                      this.handleMcOptionContents(v, 4);
                    }}
                  />
                </Segment>
              </Segment>
            </Container>
          </Grid.Row>
          <Grid.Row>
            <Container fluid>
              <Segment>
                <Label attached="top left">User&quot;s manual answer</Label>
                <ReactQuill
                  value={qUserAnswers}
                  modules={this.rQmodules}
                  theme="snow"
                  onChange={this.handleUserAnswer}
                />
              </Segment>
            </Container>
          </Grid.Row>
          <Grid.Row>
            <Container fluid>
              <Segment>
                <Label attached="top left">Select Category</Label>
                <Dropdown placeholder="Select category" options={qCatList} />
              </Segment>
            </Container>
          </Grid.Row>

          <Grid.Row>
            <Container fluid>
              <Segment>
                <Label attached="top left">Difficulty</Label>
                <Label horizontal>Difficulty Level:</Label>
                <Rating
                  icon="star"
                  maxRating={5}
                  rating={qDiffLv}
                  onRate={this.handleQDiffChanges}
                />
              </Segment>
            </Container>
          </Grid.Row>

          {/* Commit buttons */}
          <Grid.Row>
            <Container fluid>
              <Button size="mini">Update</Button>
              <Button size="mini">Reset</Button>
              <Button size="mini">Cancel</Button>
            </Container>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }
}

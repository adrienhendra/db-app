import React from 'react';
import { Button, Header, Icon, Modal } from 'semantic-ui-react';

export default class EditQ extends React.Component {
  constructor(props) {
    super(props);

    /* This state */
    this.state = {
      text: '',
    };
  }

  render() {
    return (
      <Modal trigger={<Button>Basic Modal</Button>} basic size="small">
        <Header icon="archive" content="Archive Old Messages" />
        <Modal.Content>
          <p>Test Test Test...</p>
        </Modal.Content>
        <Modal.Actions>
          <Button basic color="red" inverted>
            <Icon name="remove" /> No
          </Button>
          <Button color="green" inverted>
            <Icon name="checkmark" /> Yes
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

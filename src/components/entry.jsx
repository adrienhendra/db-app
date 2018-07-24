import React from 'react';

export default class Entry extends React.Component {
  constructor(props) {
    super(props);

    /* This state */
    this.state = {
      ...props,
    };
  }

  render() {
    return (
      <div>
        <div />
      </div>
    );
  }
}

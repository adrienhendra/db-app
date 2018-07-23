import React from 'react';

export default class Home extends React.Component {
  constructor(props) {
    super(props);

    /* This state */
    this.state = {
      text: '',
    };
  }

  render() {
    return <div>Hello</div>;
  }
}

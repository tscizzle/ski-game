import React, { Component } from 'react';

import { initializeGame } from 'game';
import 'stylesheets/components/app/app.css';

class App extends Component {
  componentDidMount() {
    initializeGame();
  }

  render() {
    return <div className="app">Hi</div>;
  }
}

export default App;

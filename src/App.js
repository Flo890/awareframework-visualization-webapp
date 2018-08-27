import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import TimelineContainer from './TimelineContainer'
import DescriptiveStatisticsContainer from './DescriptiveStatisticsContainer';



class App extends Component {

  render() {

    let participantId = 1;

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload. Lol
        </p>
          <TimelineContainer participantId={participantId}/>
          <DescriptiveStatisticsContainer participantId={participantId}/>
      </div>
    );
  }
}

export default App;

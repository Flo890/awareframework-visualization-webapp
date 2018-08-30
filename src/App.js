import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import TimelineContainer from './TimelineContainer'
import DescriptiveStatisticsContainer from './DescriptiveStatisticsContainer';
let base64 = require('base-64');



class App extends Component {

	constructor(props){
		super(props);
		this.loadAvailableFeatures();
	}

	state = {
		participantId: 1,
		availableFeatures: []
	}

	loadAvailableFeatures(){
		fetch(
			`http://localhost:3333/features/getallavailables?&participant_id=${this.state.participantId}`,
			{
				method: 'GET',
				headers: {
					'Authorization': 'Basic ' + base64.encode(this.state.participantId + ":" + 'password') // TODO
				}
			}
		).then(response => {
			if (response.ok) {
				console.log(`request for available features is ok`);
				return response.json()
			} else if (response.status == 401){
				// login
				alert('password wrong!'); // TODO
			}
		}).then(json => {
			console.log(json);

			this.setState({
				availableFeatures: json
			});
		});
	}

  render() {



    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload. Lol
        </p>
          <TimelineContainer participantId={this.state.participantId} availableFeatures={this.state.availableFeatures}/>
          <DescriptiveStatisticsContainer participantId={this.state.participantId} availableFeatures={this.state.availableFeatures}/>
      </div>
    );
  }

}

export default App;

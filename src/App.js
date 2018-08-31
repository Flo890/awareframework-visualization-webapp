import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import TimelineContainer from './TimelineContainer'
import DescriptiveStatisticsContainer from './DescriptiveStatisticsContainer';
import LoginView from './LoginView';
let base64 = require('base-64');



class App extends Component {

	constructor(props){
		super(props);
		this.loadAvailableFeatures();
	}

	state = {
		userinfo: {
			participantId: 3,
			participantEmail: 'Florian.Bemmann@campus.lmu.de',
			password: 'password'
		},
		isLoggedIn: undefined,
		availableFeatures: []
	}

	loadAvailableFeatures(){
		fetch(
			`${require('./config.json').server}/features/getallavailables`,
			{
				method: 'GET'
			}
		).then(response => {
			if (response.ok) {
				console.log(`request for available features is ok`);
				this.setState({
					isLoggedIn: true
				});
				return response.json()
			} else if (response.status == 401){
				// login
				this.setState({
					isLoggedIn: false
				});
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
		  { this.state.isLoggedIn ?
			  (
			  	<div>
				  <TimelineContainer userinfo={this.state.userinfo} availableFeatures={this.state.availableFeatures}/>
				  <DescriptiveStatisticsContainer userinfo={this.state.userinfo} availableFeatures={this.state.availableFeatures}/>
				</div>
			  ):
				  (
				  	<LoginView/>
				  )
		  }

      </div>
    );
  }

}

export default App;

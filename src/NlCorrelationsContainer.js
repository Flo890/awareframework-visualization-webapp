import React, { Component } from 'react';
import './NlCorrelationsContainer.css';
import NlCorrelation from "./NlCorrelation";

const config = require('./config.json');

class NlCorrelationsContainer extends Component {

	state = {
		correlations: []
	}

	constructor(props){
		super(props);
		this.loadCorrelations();
	}

	loadCorrelations(){
		fetch(
			`${config.profiles[config.activeProfile].server}/correlations`,
			{
				method: 'GET'
			}
		).then(response => {
			if (response.ok) {
				console.log(`correlations request for is ok`);
				return response.json()
			} else if (response.status == 401){
				// login
				alert('password wrong!'); // TODO
			}
		}).then(json => {
			console.log(json);

			this.setState({
				correlations: json
			});
		});
	}

	render() {
		let correlationComponents = this.state.correlations.map(correlation => {
			return (
				<NlCorrelation correlation={correlation}/>
			)
		});
		return (
			<div>
				{correlationComponents}
			</div>
		);
	}

}

export default NlCorrelationsContainer;
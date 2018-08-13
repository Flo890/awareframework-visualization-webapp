import React, { Component } from 'react';
import TimelineVis from "./TimelineVis";
import {browserUsage} from '@vx/mock-data';
let base64 = require('base-64');

class TimelineContainer extends Component {

	constructor(props){
		super(props);
		this.state = {datasets: []}

		this.loadData('phone_usage','value','red');
		this.loadData('ambient_noise_plugin','double_decibels','blue');
	}

	render() {
		return <TimelineVis
			datasets={this.state.datasets}
		/>
	}

	loadData(featureName, dataKey = 'value', color = 'blue'){
		let participantId = 1;
		let granularity = 'hourly';

		fetch(
			`http://localhost:8080/application/endpoints/fetchdata.php?feature_name=${featureName}&participant_id=${participantId}&granularity=${granularity}&from=1532963553&to=1533913953`,
			{
				method: 'GET',
				headers: {
					'Authorization': 'Basic ' + base64.encode(participantId + ":" + 'password')
				}
			}
		).then(response => {
			if (response.ok) {
				return response.json()
			} else if (response.status == 401){
				// login
				alert('password wrong!'); // TODO
			}
		}).then(json => {
			console.log(json);

			this.setState(prevState => {
				prevState.datasets[featureName] = {featureName: featureName, displayName: 'Feature Name Here', data:json, dataKey: dataKey, color: color};
				return prevState;
			});
		});






	}



}

export default TimelineContainer;
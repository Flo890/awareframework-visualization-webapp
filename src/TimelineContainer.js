import React, { Component } from 'react';
import TimelineVis from "./TimelineVis";
import {browserUsage} from '@vx/mock-data';
let base64 = require('base-64');

class TimelineContainer extends Component {

	constructor(props){
		super(props);
		this.state = {datasets: []}
		this.loadData();
	}

	render() {
		return <TimelineVis
			datasets={this.state.datasets}
		/>
	}

	loadData(){
		let featureName = 'fatigue_level';
		let participantId = 1;
		let granularity = 'hourly';

		fetch(
			`http://localhost:8080/application/endpoints/fetchdata.php?feature_name=${featureName}&participant_id=${participantId}&granularity=${granularity}`,
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
			//this.state.datasets = [{key: 'fatigue_level', displayName: 'Fatigue Level', data: json}];
			this.setState({
				datasets: [{key: 'fatigue_level', displayName: 'Fatigue Level', data: json}]
			});
		});






	}



}

export default TimelineContainer;
import React, { Component } from 'react';
import TimelineVis from "./TimelineVis";
import {browserUsage} from '@vx/mock-data';
import DateTimePicker from 'react-datetime-picker'
let base64 = require('base-64');


class TimelineContainer extends Component {

	constructor(props) {
		super(props);
		this.state = {
			datasets: [],
			userconfig: {
				timeline: {
					fromDate: new Date(1532963553000),
					toDate: new Date(1533913953000)
				}
			}
		}

		this.reloadData();
	}

	reloadData(){
		this.loadData('phone_usage', 'value', 'red');
		this.loadData('ambient_noise_plugin', 'double_decibels', 'blue');
	}

	onDateFromChange = date => {
		this.setState(prevState => {
			prevState.userconfig.timeline.fromDate = date;
			return prevState;
		});
		this.reloadData();
	};

	onDateToChange = date => {
		this.setState(prevState => {
			prevState.userconfig.timeline.toDate = date;
			return prevState;
		});
		this.reloadData();
	};

	render() {
		return (
			<div>
				<TimelineVis
					datasets={this.state.datasets}
				/>
				<div className="range_choosers">
					<DateTimePicker
						onChange={this.onDateFromChange}
						value={this.state.userconfig.timeline.fromDate}
					/>
					<DateTimePicker
						onChange={this.onDateToChange}
						value={this.state.userconfig.timeline.toDate}
					/>
				</div>
			</div>
		);
	}

	loadData(featureName, dataKey = 'value', color = 'blue'){
		let participantId = 1;
		let granularity = 'hourly';

		fetch(
			`http://localhost:8080/application/endpoints/fetchdata.php?feature_name=${featureName}&participant_id=${participantId}&granularity=${granularity}&from=${this.state.userconfig.timeline.fromDate.getTime()/1000}&to=${this.state.userconfig.timeline.toDate.getTime()/1000}`,
			{
				method: 'GET',
				headers: {
					'Authorization': 'Basic ' + base64.encode(participantId + ":" + 'password') // TODO
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
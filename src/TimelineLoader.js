import React, { Component } from 'react';
import TimelineVis from "./TimelineVis";
import ColorHash from "color-hash";
let base64 = require('base-64');

class TimelineLoader extends Component {

	constructor(props){
		super(props);
		this.state = {
			datasets: {}
		}
		this.reloadData();
	}

	componentDidUpdate(prevProps, prevState){
		console.log('TimelineLoader.componentDidUpdate()');
		if (this.state.renderedUserconfig && JSON.stringify(this.state.renderedUserconfig) !== JSON.stringify(this.props.userconfig)){
			console.log('and decided to reload data');
			this.reloadData();
		}
	}


	render(){
		console.log('TimelineLoader.render()');
			return (
				<TimelineVis
					datasets={this.state.datasets}
				/>
			);

	}

	reloadData(){
		console.log('TimelineLoader.reloadData()');
		let colorHash = new ColorHash();
		this.props.selectedFeatures.forEach(selectedFeature => {
			this.loadData(selectedFeature.key, 'value', colorHash.hex(selectedFeature.key));
		});
		this.state.renderedUserconfig = JSON.parse(JSON.stringify(this.props.userconfig));

		// remove datasets that are not selected anymore
		this.setState(prevState => {
			Object.keys(prevState.datasets).forEach(featureName => {
				let foundKey = false;
				for(let i = 0; i<this.props.userconfig.selectedFeatures.length; i++){
					if (this.props.userconfig.selectedFeatures[i].key == featureName) {
						foundKey = true;
						break;
					}
				}
				if (!foundKey){
					delete prevState.datasets[featureName];
					console.log(`deleted key ${featureName}`);
				}
			});
			return prevState;
		});
	}


	loadData(featureName, dataKey = 'value', color = 'blue'){
		let participantId = 1;
		let granularity = `${this.granularityFunction(this.props.userconfig.fromDate, this.props.userconfig.toDate)}minutes`;

		fetch(
			`http://localhost:8080/application/endpoints/fetchdata.php?feature_name=${featureName}&participant_id=${participantId}&granularity=${granularity}&from=${this.props.userconfig.fromDate/1000}&to=${this.props.userconfig.toDate/1000}`,
			{
				method: 'GET',
				headers: {
					'Authorization': 'Basic ' + base64.encode(participantId + ":" + 'password') // TODO
				}
			}
		).then(response => {
			if (response.ok) {
				console.log(`request for ${featureName} is ok`);
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

	/**
	 *
	 * @param from {date}
	 * @param to {date}
	 * @returns {number} date granularity in minutes (one of steps array)
	 */
	granularityFunction(from,to){
		const maxNumberDatapoints = 100;
		const steps = [5,10,15,30,60,60*3,60*24];

		// start with 5 minutes, and check whether that yields at most 100 datapoints. If no reduce data frequency, check again, ...
		let granularity = steps[0];
		for(let i = 0; i<steps.length; i++){
			granularity = steps[i];
			let minutesDiff = (to - from)/(1000*60);
			if (minutesDiff/granularity <= maxNumberDatapoints){
				break;
			}
		}

		return granularity;
	}

}
export default TimelineLoader;
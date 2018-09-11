import React, { Component } from 'react';
import TimelineVis from "./TimelineVis";
import ColorHash from "color-hash";
let base64 = require('base-64');

const config = require('./config.json');

class TimelineLoader extends Component {

	constructor(props){
		super(props);
		this.state = {
			datasets: {}
		}
		this.reloadData();
	}

	/**
	 *
	 * @returns {string[]} features for which no null values should be added if there are gaps in the data, because we can assume a linear transition
	 */
	noGapsFeatures(){
		return ['temperature','humidity','pressure','cloudiness'];
	}

	componentDidUpdate(prevProps, prevState){
		// the given prev.. parameters are not the previous ones, that are the new ones!
		console.log('TimelineLoader.componentDidUpdate()');
		if (this.state.renderedUserconfig && JSON.stringify(this.state.renderedUserconfig) !== JSON.stringify(this.props.userconfig)){
			console.log('and decided to reload data');
			this.reloadData(this.props.userconfig.fromDate != this.state.renderedUserconfig.fromDate || this.props.userconfig.toDate != this.state.renderedUserconfig.toDate); // reload all if from or to date has changed
			this.persistConfig();
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

	reloadData(reloadAll = true){
		console.log('TimelineLoader.reloadData()');
		let colorHash = new ColorHash();
		this.props.selectedFeatures
			.filter(selectedFeature => {if(!reloadAll && this.state.datasets[selectedFeature.key]){ return false} else {return true}}) // only load those that don't exist yet
			.forEach(selectedFeature => {
			this.loadData(selectedFeature.key, 'value', colorHash.hex(selectedFeature.key), selectedFeature.display_name);
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


	loadData(featureName, dataKey = 'value', color = 'blue', displayName){
		let granularity = this.granularityFunction(this.props.userconfig.fromDate, this.props.userconfig.toDate);

		fetch(
			`${config.profiles[config.activeProfile].server}/features/getone?feature_name=${featureName}&participant_email=${this.props.userinfo.participantEmail}&granularity_mins=${granularity}&from=${this.props.userconfig.fromDate/1000}&to=${this.props.userconfig.toDate/1000}`,
			{
				method: 'GET'
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
				if (!this.noGapsFeatures().includes(featureName)) {
					this.fillGapsWithNull(json, granularity);
				}
				prevState.datasets[featureName] = {featureName: featureName, displayName: displayName, data:json, dataKey: dataKey, color: color};
				return prevState;
			});
		}).catch(error => {
			console.error(`could not parse response json for feature ${featureName}`,error);
		})
	}

	/**
	 * adds {timestamp:1234,value:null} values at the granularity interval. With that, a define function can be used in LinePath to show gaps at these times
	 * @param data
	 */
	fillGapsWithNull(data, granularityMins){
		const granularityMillis = granularityMins*60*1000;
		for(let i = 0;  i<data.length-1; i++){
			if (data[i+1].timestamp - data[i].timestamp > granularityMillis) {
				data.splice(i+1,0,{timestamp:data[i].timestamp+granularityMillis, value: null});
			}
			if (i>10000) break;
		}
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

	persistConfig() {
		console.log(`Descr Stat config changed, will persist it`);

		fetch(`${config.profiles[config.activeProfile].server}/dashboardconfig`, {
			method: 'POST',
			body: JSON.stringify({timelineConfigs: this.props.userconfig}),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(response => {
			if (response.ok) {
				console.log(`persisting timeline config successful`);
			}
		}).catch(fetchError => {
			console.error(`persist descr stats dashboard timeline config call failed`,fetchError);
		});
	}

}
export default TimelineLoader;
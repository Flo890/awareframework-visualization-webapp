import React, { Component } from 'react';
import './TimelineContainer.css';
import TimelineLoader from './TimelineLoader';
import DateTimePicker from 'react-datetime-picker'
import Chip from '@material-ui/core/Chip'
import AddIcon from '@material-ui/icons/Add'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import ColorHash from "color-hash";
import TimelineNotes from "./TimelineNotes";
import Slider from 'rc-slider/lib/Slider';
import 'rc-slider/assets/index.css';

let moment = require('moment');
const config = require('./config.json');

class TimelineContainer extends Component {

	constructor(props) {
		super(props);
		this.loadPersistedConfig();
		this.state = {
			userconfig: {

			}
		}
	}

	defaultUserconfig = {
			timeline: {
				fromDate: moment().subtract(1,'days').startOf('day').unix()*1000,
				toDate: moment().unix()*1000,
				selectedFeatures: [
					{key:"temperature",display_name:"outside temperature"},
					{key:"ambient_noise_plugin",display_name:"ambient noise (plugin)"},
					{key:"fatigue_level",display_name:"fatigue level"}
				],
				maxValues: 50
			}
	}

	onDateFromChange = date => {
		this.setState(prevState => {
			prevState.userconfig.timeline.fromDate = date.getTime();
			return prevState;
		});
		console.log(`from set to ${date}`);
	};

	onDateToChange = date => {
		this.setState(prevState => {
			prevState.userconfig.timeline.toDate = date.getTime();
			return prevState;
		});
		console.log(`to set to ${date}`);
	};

	render() {
		let colorHash = new ColorHash();

		if (!this.state.userconfig.timeline) {
			// if config not loaded yet, render something empty instead
			return (
				<div>
					<Card className="timeline_card">
						<CardContent>
						</CardContent>
					</Card>
				</div>
			);
		}

		return (
			<div>
				<Card className="timeline_card">
					<CardContent>
						<Typography variant="headline" component="h2">Timeline</Typography>
						<TimelineLoader
							userconfig={this.state.userconfig.timeline}
							selectedFeatures={this.state.userconfig.timeline.selectedFeatures}
							userinfo={this.props.userinfo}
						/>
						<div className="range_choosers">
							<DateTimePicker
								onChange={this.onDateFromChange}
								value={new Date(this.state.userconfig.timeline.fromDate)}
							/>
							<DateTimePicker
								onChange={this.onDateToChange}
								value={new Date(this.state.userconfig.timeline.toDate)}
							/>
						</div>
						<div className="feature_chooser">
							<h3>available features:</h3>
							{
								this.props.availableFeatures.map(feature => {
									let isSelected = false;
									for(let i=0; i<this.state.userconfig.timeline.selectedFeatures.length; i++){
										if (this.state.userconfig.timeline.selectedFeatures[i].key == feature.key){
											isSelected = true;
											break;
										}
									}
									if (isSelected){
										// chip for selected feature
										return (
											<Chip
												label={feature.display_name}
												onDelete={this.handleFeatureUnselect.bind({key:feature.key,realThis: this})}
												style={{background:colorHash.hex(feature.key)}}
											/>
										)
									} else {
										// chip for not selected feature
										return (
											<Chip
												label={feature.display_name}
												clickable
												onDelete={this.handleFeatureSelect.bind({key:feature.key,realThis: this})}
												deleteIcon={<AddIcon />}
											/>
										)
									}

								})
							}
						</div>
						<div>
							<h3>degree of detail:</h3>
							<Slider onChange={this.handleGranularitySlider.bind(this)} defaultValue={this.state.userconfig.timeline.maxValues}/>
						</div>
						<TimelineNotes
							participantId={this.props.participantId}
							timelineConfig={this.state.userconfig.timeline}
							showTimelineForConfigFunction={this.showTimelineForConfig.bind(this)}
						/>
					</CardContent>
				</Card>
			</div>
		);
	}

	handleFeatureUnselect(){
		console.log(`unselected ${this.key}`);
		for(let i = 0; i<this.realThis.state.userconfig.timeline.selectedFeatures.length; i++){
			if(this.realThis.state.userconfig.timeline.selectedFeatures[i].key == this.key){
				this.realThis.setState(prevState => {
					prevState.userconfig.timeline.selectedFeatures.splice(i,1);
					return prevState;
				});
				break;
			}
		}
	}

	handleFeatureSelect(){
		console.log(`selected ${this.key}`);
		// get full feature object
		let selectedFeatureObj;
		for(let i = 0; i<this.realThis.props.availableFeatures.length; i++){
			if(this.realThis.props.availableFeatures[i].key == this.key){
				selectedFeatureObj = this.realThis.props.availableFeatures[i];
				break;
			}
		}

		this.realThis.setState(prevState => {
			prevState.userconfig.timeline.selectedFeatures.push(selectedFeatureObj);
			return prevState;
		});
	}

	showTimelineForConfig(timelineConfig){
		this.setState(prevState => {
			prevState.userconfig.timeline = timelineConfig;
			return prevState;
		});
	}

	loadPersistedConfig(props){
		fetch(`${config.profiles[config.activeProfile].server}/dashboardconfig`, {
			method: 'GET'
		}).then(response => {
			if (response.ok) {
				response.json().then(json => {
					console.log(`loading persisted timeline config successful: ${json}`);
					if (json.timelineConfigs) {
						this.setState({
							userconfig: {timeline: JSON.parse(json.timelineConfigs)}
						});
					} else {
						this.setState({
							userconfig: this.defaultUserconfig
						});
					}
				}).catch(jsonError => {
					console.error(`could not parse response json for loading dashboard timeline config call`,jsonError);
				});
			}
		}).catch(fetchError => {
			console.error(`load persisted timeline dashboard config call failed`,fetchError);
		});
	}

	handleGranularitySlider(value) {
		// throttle events
		if (this.granularitySliderThrottle) {
			clearTimeout(this.granularitySliderThrottle);
		}
		this.granularitySliderThrottle = setTimeout(()=>{
			console.log(value);
			this.granularitySliderThrottle = undefined;
			this.setState(prevState => {
				prevState.userconfig.timeline.maxValues = value;
				return prevState;
			});
		},500);
	}


}

export default TimelineContainer;
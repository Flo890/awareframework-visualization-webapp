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

class TimelineContainer extends Component {

	constructor(props) {
		super(props);
		this.state = {
			userconfig: {
				timeline: {
					fromDate: 1535046919131,//1533877920000,
					toDate: 1535187482902,//1533921120000,
					selectedFeatures: [
						{key:"temperature",display_name:"outside temperature"},
						{key:"ambient_noise_plugin",display_name:"ambient noise (plugin)"},
						{key:"fatigue_level",display_name:"fatigue level"}
					]
				}
			}
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
		return (
			<div>
				<Card className="timeline_card">
					<CardContent>
						<Typography variant="headline" component="h2">Timeline</Typography>
						<TimelineLoader
							userconfig={this.state.userconfig.timeline}
							selectedFeatures={this.state.userconfig.timeline.selectedFeatures}
							participantId={this.props.participantId}
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





}

export default TimelineContainer;
import React, { Component } from 'react';
import TimelineLoader from './TimelineLoader';
import DateTimePicker from 'react-datetime-picker'


class TimelineContainer extends Component {

	constructor(props) {
		super(props);
		this.state = {
			userconfig: {
				timeline: {
					fromDate: new Date(1533877920000),
					toDate: new Date(1533921120000)
				}
			}
		}
	}


	onDateFromChange = date => {
		this.setState(prevState => {
			prevState.userconfig.timeline.fromDate = date;
			return prevState;
		});
		console.log(`from set to ${date}`);
	};

	onDateToChange = date => {
		this.setState(prevState => {
			prevState.userconfig.timeline.toDate = date;
			return prevState;
		});
		console.log(`to set to ${date}`);
	};

	render() {
		return (
			<div>
				<TimelineLoader
					userconfig={this.state.userconfig.timeline}
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





}

export default TimelineContainer;
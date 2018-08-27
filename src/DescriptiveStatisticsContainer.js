import React, { Component } from 'react';
import './DescriptiveStatisticsContainer.css';

import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'

import DescriptiveStatisticsLoader from './DescriptiveStatisticsLoader';

class DescriptiveStatisticsContainer extends Component {

	accumulators = Object.freeze({
		MAX: {function:'max',displayName:'maximal'},
		AVG: {function:'avg',displayName:'average'}
	});

	state = {
		descrStatConfigs: [
			{
				featureName: 'fatigue_level',
				from: 1535174664000,
				to: 1535216964000,
				accumulator: this.accumulators.MAX
			},
			{
				featureName: 'linear_accelerometer',
				from: 1535174664000,
				to: 1535216964000,
				accumulator: this.accumulators.AVG
			}
		]
	}

	render(){
		return (
			<Card className="descriptive_statistics_card">
				<CardContent>
					<Typography variant="headline" component="h2">Descriptive Statistics</Typography>
				</CardContent>
				<DescriptiveStatisticsLoader descrStatConfigs={this.state.descrStatConfigs} participantId={this.props.participantId}/>
			</Card>
		)
	}
}
export default DescriptiveStatisticsContainer
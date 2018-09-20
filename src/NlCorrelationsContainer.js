import React, { Component } from 'react';
import './NlCorrelationsContainer.css';
import NlCorrelation from "./NlCorrelation";
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography'

const config = require('./config.json');

class NlCorrelationsContainer extends Component {

	state = {
		correlations: [],
		showRelevanceZeroCorrelations: false
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
		let correlationComponents = this.state.correlations.filter(correlation => {return correlation.relevance_score > 0 || this.state.showRelevanceZeroCorrelations}).map(correlation => {
			return (
				<NlCorrelation
					key={`corr-${correlation.feature_one}-${correlation.feature_two}-${correlation.from}-${correlation.to}`}
					correlation={correlation}
					hideCorrelationFn={this.hideCorrelations.bind(this)}
				/>
			)
		});
		return (
			<div className="correlations_container">
				<Typography variant="headline" component="h1">Did you know... ?</Typography>
				{correlationComponents}
				<Button onClick={this.handleShowLessRelevantCorrelations.bind(this)}>{this.state.showRelevanceZeroCorrelations ? 'Hide less relevant correlations' : 'Show less relevant correlations'}</Button>
			</div>
		);
	}

	/**
	 * at least one (usually just one) of both parameters should be set
	 * @param correlationId
	 * @param feature
	 */
	hideCorrelations(correlationId, feature){
			this.setState(prevState => {
				prevState.correlations = prevState.correlations.filter(correlation => {
					return (
						correlation._id != correlationId
						&& correlation.feature_one != feature
						&& correlation.feature_two != feature
					);
				});
				return prevState;
			});
	}

	handleShowLessRelevantCorrelations(){
		this.setState({
			showRelevanceZeroCorrelations: !this.state.showRelevanceZeroCorrelations
		});
	}

}

export default NlCorrelationsContainer;
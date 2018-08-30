import React, { Component } from 'react';
import './DescriptiveStatisticsContainer.css';
import DescriptiveStatisticsTile from "./DescriptiveStatisticsTile";

class DescriptiveStatisticsLoader extends Component {

	state = {
		descrStatTiles: []
	}

	constructor(props){
		super(props);
		this.loadData();
	}

	componentDidUpdate(prevProps, prevState){
		this.loadData();
	}

	loadData(){
		console.log('tileconfig');
		console.log(this.props.descrStatConfigs);
		if (this.state.renderedTileconfig == JSON.stringify(this.props.descrStatConfigs)){
			console.log('reloading tiles aborted');
			return;
		}
		console.log('tileconfig changed, will reload');
		this.state.renderedTileconfig = JSON.stringify(this.props.descrStatConfigs);


		console.log(`(re)loading ${this.props.descrStatConfigs} tiles`);
		fetch(`http://localhost:3333/descriptivestatistics?participant_id=${this.props.participantId}&participant_email=${this.props.participantEmail}`, {
			method: 'POST',
			body: JSON.stringify({configs: this.props.descrStatConfigs}),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(json => {
			json.json().then(response => {
				console.log(response);
				this.setState({
					descrStatTiles: response
				});
			}).catch(jsonError => {console.error('parsing descr stats json failed',jsonError)});
		}).catch(error => {console.error('loading descr stats failed',error)});
	}

	render(){
		return (
			<div>
			{this.state.descrStatTiles.map(aDescrStatTile => {
				return <DescriptiveStatisticsTile
					key={`descr-tile-${aDescrStatTile.config.accumulator.function}-${aDescrStatTile.featureName}-${aDescrStatTile.config.from}-${aDescrStatTile.config.to}`}
					descrStatTile={aDescrStatTile}
					handleDeleteTile={this.props.handleDeleteTile}
				/>
			})}
			</div>
		);
	}

}
export default DescriptiveStatisticsLoader;
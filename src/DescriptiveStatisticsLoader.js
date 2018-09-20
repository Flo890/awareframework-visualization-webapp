import React, { Component } from 'react';
import './DescriptiveStatisticsLoader.css';
import DescriptiveStatisticsTile from "./DescriptiveStatisticsTile";

let moment = require('moment');
const config = require('./config.json');

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
		this.persistConfig();
		this.state.renderedTileconfig = JSON.stringify(this.props.descrStatConfigs);


		console.log(`(re)loading ${this.props.descrStatConfigs} tiles`);
		fetch(`${config.profiles[config.activeProfile].server}/descriptivestatistics?participant_email=${this.props.userinfo.participantEmail}`, {
			method: 'POST',
			body: JSON.stringify({configs: this.props.descrStatConfigs.map(config => {
				if (config.dynamicTimerange) {
					switch(config.dynamicTimerange){
						case 'yesterday':
							config.from = moment().subtract(1, 'day').startOf('day').unix()*1000;
							config.to = moment().subtract(1, 'day').endOf('day').unix()*1000;
							break;
						case 'thisweek':
							config.from = moment().startOf('week').unix()*1000;
							config.to = moment().endOf('week').unix()*1000;
							break;
						case 'lastweek':
							config.from = moment().subtract(1, 'week').startOf('week').unix()*1000;
							config.to = moment().subtract(1, 'week').endOf('week').unix()*1000;
							break;
						case 'today':
							config.from = moment().startOf('day').unix()*1000;
							config.to = moment().endOf('day').unix()*1000;
							break;
					}
				}
				return config;
				})}),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(json => {
			json.json().then(response => {
				console.log(response);
				this.setState({
					descrStatTiles: response
				});
			}).catch(jsonError => {
				console.error('parsing descr stats json failed',jsonError);
			});
		}).catch(error => {console.error('loading descr stats failed',error)});
	}

	persistConfig() {
		console.log(`Descr Stat config changed, will persist it`);

		fetch(`${config.profiles[config.activeProfile].server}/dashboardconfig`, {
			method: 'POST',
			body: JSON.stringify({descrStatConfigs: this.props.descrStatConfigs}),
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(response => {
			if (response.ok) {
					console.log(`persisting config successful`);
			}
		}).catch(fetchError => {
			console.error(`persist descr stats dashboard config call failed`,fetchError);
		});
	}

	render(){
		return (
			<div>
			{this.state.descrStatTiles.map(aDescrStatTile => {
				return (
					<DescriptiveStatisticsTile
						key={`descr-tile-${aDescrStatTile.config.accumulator.function}-${aDescrStatTile.featureName}-${aDescrStatTile.config.from}-${aDescrStatTile.config.to}`}
						descrStatTile={aDescrStatTile}
						handleDeleteTile={this.props.handleDeleteTile}
					/>
				);
			})}

			</div>
		);
	}

}
export default DescriptiveStatisticsLoader;
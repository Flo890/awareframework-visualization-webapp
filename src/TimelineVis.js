import React, { Component } from 'react';
import {Group} from '@vx/group';
import {LinePath} from '@vx/shape';
import {scaleTime, scaleLinear} from '@vx/scale';
import {extent,max} from 'd3-array';
import { AxisLeft, AxisBottom } from '@vx/axis';

class TimelineVis extends Component {
	render(){
		console.log('TimelineVis.render()');

		let datasets = this.props.datasets;
		let keys = Object.keys(datasets);
		if (keys.length == 0){
			return '<p>please wait...</p>';
		}



		// some sizing parameters
		const width = 700;
		const height = 500;
		const margin = {
			top: 60,
			bottom: 60,
			left: 80,
			right: 80,
		};
		const xMax = width - margin.left - margin.right;
		const yMax = height - margin.top - margin.bottom;

		// map data properties to axis
		const x = data => new Date(data.timestamp);


		let mergedData = [];
		keys.forEach(key => {
			mergedData = mergedData.concat(datasets[key].data);
		});


		// scale
		const xScale = scaleTime({
			range: [0, xMax],
			domain: extent(mergedData, x)
		});




		let linePaths = [];
		let yAxisComponent = "";
		for(let i = 0; i<Object.values(this.props.datasets).length; i++){
			let dataset = Object.values(this.props.datasets)[i];
			const y = data =>data[dataset.dataKey];
			let yScale = scaleLinear({
				range: [yMax, 0],
				domain: [0, max(dataset.data, y)]
			});

			linePaths.push(
				<LinePath
					key={dataset.featureName}
					data={dataset.data}
					x={x}
					y={y}
					xScale={xScale}
					yScale={yScale}
					stroke={dataset.color}
					onTouchStart={data => event =>
						this.handleHover(dataset.featureName)}
					onTouchMove={data => event =>
						this.handleHover(dataset.featureName)}
					onMouseMove={data => event =>
						this.handleHover(dataset.featureName)}
				/>
			);

			if (this.state && this.state.yAxis == dataset.featureName){
				yAxisComponent = (
					<AxisLeft
						scale={yScale}
						top={0}
						left={0}
						label={dataset.displayName}
						stroke={'#1b1a1e'}
						tickTextFill={'#1b1a1e'}
					/>
				);
			}
		}



		let myChart = (
			<svg width={width} height={height}>
				<Group top={margin.top} left={margin.left}>
					{linePaths}
					<AxisBottom
						scale={xScale}
						top={yMax}
						label={'Time'}
						stroke={'#1b1a1e'}
						tickTextFill={'#1b1a1e'}
						/>
					{yAxisComponent}
				</Group>
			</svg>
		);

		return (
			<div>
				{myChart}
			</div>
		);
	}

	handleHover(featureName){
		console.log(`hovering ${featureName}`);
		this.setState({
			yAxis: featureName
		});
	}
}

export default TimelineVis;
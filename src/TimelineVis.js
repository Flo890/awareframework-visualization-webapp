import React, { Component } from 'react';
import {Group} from '@vx/group';
import {LinePath} from '@vx/shape';
import {scaleTime, scaleLinear} from '@vx/scale';
import {extent,max} from 'd3-array';

class TimelineVis extends Component {
	render(){

		let datasets = this.props.datasets;
		let keys = Object.keys(datasets);
		if (keys.length == 0){
			return '<p>please wait...</p>';
		}



		// some sizing parameters
		const width = 1000;
		const height = 700;
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
			domain: extent(mergedData, x) // TODO use all datasets, and what does this anyway?
		});


		let linePaths = Object.values(this.props.datasets).map(dataset => {
			const y = data =>data[dataset.dataKey];
			let yScale = scaleLinear({
				range: [yMax, 0],
				domain: [0, max(dataset.data, y)]
			});
			return (
				<LinePath
					key={dataset.featureName}
					data={dataset.data}
					x={x}
					y={y}
					xScale={xScale}
					yScale={yScale}
					stroke={dataset.color}
				/>
			);
		});

		let myChart = (
			<svg width={width} height={height}>
				<Group top={margin.top} left={margin.left}>
					{linePaths}
				</Group>
			</svg>
		);

		return (
			<div>
				{myChart}
			</div>
		);
	}
}

export default TimelineVis;
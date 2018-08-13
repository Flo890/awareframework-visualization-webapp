import React, { Component } from 'react';
import {Group} from '@vx/group';
import {LinePath} from '@vx/shape';
import {scaleTime, scaleLinear} from '@vx/scale';
import {extent,max} from 'd3-array';

class TimelineVis extends Component {
	render(){

		let datasets = this.props.datasets;
		if (datasets.length == 0){
			return '<p>please wait...</p>';
		}
		let dataset = datasets[0].data;

		//let dataset = this.props.data;

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
		const y = data => data.fatigue_avg;
		//const yChrome = data => data['Google Chrome'];

		// scale
		const xScale = scaleTime({
			range: [0, xMax],
			domain: extent(dataset, x)
		});
		const yScale = scaleLinear({
			range: [yMax, 0],
			domain: [0, max(dataset, y)]
		});
		// const yScaleChrome = scaleLinear({
		// 	range: [yMax, 0],
		// 	domain: [0, max(dataset, yChrome)]
		// });

		let myChart = (
			<svg width={width} height={height}>
				<Group top={margin.top} left={margin.left}>
					<LinePath
						data={dataset}
						x={x}
						y={y}
						xScale={xScale}
						yScale={yScale}
					/>
					{/*<LinePath*/}
						{/*data={dataset}*/}
						{/*x={x}*/}
						{/*y={yChrome}*/}
						{/*xScale={xScale}*/}
						{/*yScale={yScaleChrome}*/}
					/>
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
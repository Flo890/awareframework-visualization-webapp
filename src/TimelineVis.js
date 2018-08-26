import React, { Component } from 'react';
import {Group} from '@vx/group';
import {LinePath, Line} from '@vx/shape';
import {scaleTime, scaleLinear} from '@vx/scale';
import {extent,max,bisector} from 'd3-array';
import { AxisLeft, AxisBottom } from '@vx/axis';

class TimelineVis extends Component {
	state = {
		position: null,
	};
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
					onTouchStart={data => event => this.handleLineHover(dataset.featureName)}
					onTouchMove={data => event => this.handleLineHover(dataset.featureName)}
					onMouseMove={data => event => this.handleLineHover(dataset.featureName)}
					onTouchEnd={data => event => this.setState({ position: null })}
					onMouseLeave={data => event => this.setState({ position: null })}
				/>
			);
			// TODO make this overlays more efficient, e.g. by moving it into a component to avoid rerendering the full graph
			// TODO use y functions that interpolate between the data points
			const position = this.state.position;
			if (this.state.position) {
				if (dataset.data.length > position.index) {
					linePaths.push(
						<g key={`${dataset.featureName}-details`} transform={`translate(${position.x},${yScale(y(dataset.data[position.index]))})`}>
							<circle  r="4.5" fill="none" stroke="steelblue" />
							<text x="9" dy=".35em">{y(dataset.data[position.index])}</text>
						</g>
					);
				}
			}

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
				<Group top={margin.top} left={margin.left} >
					<rect top={margin.top} left={margin.left} width={width - margin.left} height={height - margin.top} style={{pointerEvents: 'all'}} fill="transparent" onMouseMove={reactSyntheticEvent => {
						this.handleGraphAreaHover(
							reactSyntheticEvent.nativeEvent,
							mergedData,
							x,
							xScale,
							margin
						)
					}}/>
					{linePaths}
					{this.state.position && (
						<Line
							from={{ x: this.state.position.x, y: 0 }}
							to={{ x: this.state.position.x, y: height }}
							strokeWidth={1}
						/>
					)}
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

	handleLineHover(featureName){
		console.log(`hovering ${featureName}`);

		// display according y axis
		this.setState({
			yAxis: featureName
		});


	}

	handleGraphAreaHover(event, data, xSelector, xScale, margin) {
		let eventXInSvg = event.offsetX - margin.left;

			const x0 = xScale.invert(eventXInSvg);
		const bisectDate = bisector(xSelector).left;
			let index = bisectDate(data, x0, 1);
			const d0 = data[index - 1];
			const d1 = data[index];
			let d = d0;
			if (d1 ){
				if (x0 - xSelector(d0) > xSelector(d1) - x0) {
					d = d1;
				} else {
					d = d0;
					index = index - 1;
				}

				this.setState({
					position: {
						index,
						x: xScale(xSelector(d)),
					},
				});
			}


	}
}

export default TimelineVis;
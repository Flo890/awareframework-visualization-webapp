import React, { Component } from 'react';
import {Group} from '@vx/group';
import {LinePath, Line, Bar} from '@vx/shape';
import {scaleTime, scaleLinear} from '@vx/scale';
import {extent,max,bisector} from 'd3-array';
import { AxisLeft, AxisBottom } from '@vx/axis';
import { curveNatural, curveStepAfter, curveStep } from '@vx/curve';

let moment = require('moment');

class TimelineVis extends Component {
	state = {
		position: null, // position of the context line. If not null, the line will be displayed
		positionDate: null
	};
	render(){
		console.log('TimelineVis.render()');

		let datasets = this.props.datasets;
		let keys = Object.keys(datasets);
		if (keys.length == 0){
			return '<p>please wait...</p>';
		}



		// some sizing parameters
		const width = 1000;
		const height = 500;
		const margin = {
			top: 60,
			bottom: 60,
			left: 80,
			right: 200,
		};
		const xMax = width - margin.left - margin.right;
		const yMax = height - margin.top - margin.bottom;

		// map data properties to axis
		const x = data => new Date(data.timestamp);


		let mergedData = [];
		keys.forEach(key => {
			mergedData = mergedData.concat(datasets[key].data);
		});
		//mergedData.sort((a,b) => {return a.timestamp < b.timestamp ? -1 : 1});



		// scale
		const xScale = scaleTime({
			range: [0, xMax],
			domain: extent(mergedData, x)
		});


		let linePaths = [];
		let bars = [];
		let yAxisComponent = "";
		for(let i = 0; i<Object.values(this.props.datasets).length; i++){
			let dataset = Object.values(this.props.datasets)[i];
			const y = data =>data[dataset.dataKey];
			let yScale = scaleLinear({
				range: [yMax, 0],
				domain: [0, max(dataset.data, y)]
			});

			// hovered data point x,y
			let hoveredDataPoint = undefined;
			if (this.state.position && this.state.positionDate) {
				// try to get datapoint for the hovered datetime for this feature
				let dataPoint = dataset.data.filter(aDataPoint => {
					return this.state.positionDate.getTime() == aDataPoint.timestamp
				})[0];
				if (dataPoint) {
					// if there is a point...
					hoveredDataPoint = {
						xPx: this.state.position.x,
						yPx: yScale(y(dataPoint)),
						dataObject: dataPoint
					};
				}
			}

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
					onTouchEnd={data => event => this.setState({ position: null, positionDate: null })}
					onMouseLeave={data => event => this.setState({ position: null, positionDate: null })}
					curve={dataset.featureName == 'sleep' || true ? curveStepAfter : curveNatural}
					defined={d => {return d.value != null}}
				/>
			);

			// TODO make this overlays more efficient, e.g. by moving it into a component to avoid rerendering the full graph
			if (hoveredDataPoint) {
					linePaths.push(
						<g key={`${dataset.featureName}-details`} transform={`translate(${hoveredDataPoint.xPx},${hoveredDataPoint.yPx})`}>
							<circle  r="4.5" fill="none" stroke="steelblue" />
							<text x="9" dy=".35em">{`${dataset.displayName}: ${Math.floor(hoveredDataPoint.dataObject.value*100)/100} ${dataset.displayUnit ? dataset.displayUnit : ''}`}</text>
						</g>
					);
			}

			if (this.state && this.state.yAxis == dataset.featureName){
				yAxisComponent = (
					<AxisLeft
						scale={yScale}
						top={0}
						left={0}
						label={`${dataset.displayName} ${dataset.displayUnit ? '('+dataset.displayUnit+')':''}`}
						stroke={'#1b1a1e'}
						tickTextFill={'#1b1a1e'}
					/>
				);
			}
		}

		let timesegmentNotes = [];
		this.props.timesegmentNotes.forEach(aTimesegmentNote => {
			let xLeftInSvg = xScale(aTimesegmentNote.dateFrom*1000);
			let xRightInSvg = xScale(aTimesegmentNote.dateTo*1000);
			let itemWidth = Math.min(xRightInSvg, width - margin.right) - Math.max(xLeftInSvg, 0);

			// show only if in currently configured time range
			if (xRightInSvg > 0 && xLeftInSvg < width-margin.right) {
				timesegmentNotes.push(
					<g key={`timesegment-note-${xLeftInSvg}-${xRightInSvg}-${aTimesegmentNote.noteText}`} transform={`translate(${Math.max(xLeftInSvg, 0)},${-margin.top / 2})`}>
						<rect x="0" y="6" width={itemWidth}
							  height="3"></rect>
						<rect x="0" y="0" width="3"
							  height="15"></rect>
						<rect x={itemWidth - 3} y="0" width="3"
							  height="15"></rect>
						<text x="9" y="-10" dy=".35em">{aTimesegmentNote.noteText}</text>
					</g>
				)
			}

		});


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
					}}
					onClick={reactSyntheticEvent => {
						this.handleGraphAreaClick(
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
					{this.state.position && (
						<g key={`details-line-date`} transform={`translate(${this.state.position.x},${-margin.top/2})`}>
							<text x="9" dy=".35em">{moment(this.state.positionDate).format('ddd MMM Do [at] kk:mm')}</text>
						</g>
					)}
					{timesegmentNotes}
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
		let eventXInSvg = event.offsetX - margin.left;  // the x value within the graph, where the user hovered

			const x0 = xScale.invert(eventXInSvg); // the datetime which the user hovered
		const bisectDate = bisector(xSelector).left;
			let index = bisectDate(data, x0, 1); // will be set to the index of the closest datapoint to the hovered point
			const d0 = data[index - 1]; // the next datapoint left to the hovered point
			const d1 = data[index]; // the next datapoint right to the hovered point
			let d = d0; // is set either the left or the right, depending on which one is closer to the hovered point
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
					positionDate: xSelector(d)
				});
			}


	}

	handleGraphAreaClick(event, data, xSelector, xScale, margin) {
		let eventXInSvg = event.offsetX - margin.left;
		const x0 = xScale.invert(eventXInSvg); // the datetime which the user hovered

		this.props.timelineContainerRef.showTimesegmentNoteAddDialog(this.props.timelineContainerRef, x0);
	}
}

export default TimelineVis;
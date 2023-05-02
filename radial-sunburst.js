// Import d3.js
import { arc } from 'd3-shape';
import { stratify, hierarchy } from 'd3-hierarchy';
import { csv } from 'd3-fetch';

export function createRadialSunburstChart(data, rootName) {

  // Create the chart container
  const chartContainer = document.querySelector('#chart-container');

  // Set the width and height of the chart
  const width = chartContainer.clientWidth;
  const height = chartContainer.clientHeight;

  // Define the radius of the sunburst chart
  const radius = Math.min(width, height) / 2;

  // Define the partition layout
  const partition = data => {
    const root = stratify()
        .id(d => d.name)
        .parentId(d => d.parent)(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
    return hierarchy(root)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
  }

  // Define the partition layout function
  const partitionLayout = partition(data);

  // Define the arc generator
  const arcGenerator = arc()
.startAngle(d => d.x0)
.endAngle(d => d.x1)
.padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
.padRadius(radius * 1.5)
.innerRadius(d => d.y0 * radius)
.outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

// Append the svg object to the chart container
const svg = d3.select(chartContainer).append('svg')
.attr('width', width)
.attr('height', height)
.style('font', '10px sans-serif')
.style('width', '100%')
.style('height', 'auto')
.append('g')
.attr('transform', translate(${width / 2},${height / 2}));

// Define the tooltip
const tooltip = d3.select(chartContainer).append('div')
.attr('class', 'tooltip')
.style('opacity', 0);

// Define the mouseover function
const mouseover = function(event, d) {
const sequence = d.ancestors().reverse().map(d => d.data.name).join(' > ');
const value = d.value.toLocaleString();
tooltip.html(${sequence}<br/>${value})
.style('opacity', 1)
.style('left', ${event.pageX}px)
.style('top', ${event.pageY}px);
// Highlight the nodes in the sequence
d3.selectAll('path')
  .filter(node => d.ancestors().indexOf(node) === -1)
  .style('opacity', 0.3);
}

// Define the mouseleave function
const mouseleave = function(d) {
tooltip.style('opacity', 0);

// Remove the highlighting
d3.selectAll('path')
  .style('opacity', 1);
}

// Append the arcs to the svg object
svg.selectAll('path')
.data(partitionLayout.descendants())
.join('path')
.attr('fill', d => {
while (d.depth > 1) d = d.parent;
return color(d.data.name);
})
.attr('d', arcGenerator)
.on('mouseover', mouseover)
.on('mouseleave', mouseleave)
.append('title')
.text(d => ${d.ancestors().reverse().map(d => d.data.name).join(' > ')}\n${d.value.toLocaleString()});
}

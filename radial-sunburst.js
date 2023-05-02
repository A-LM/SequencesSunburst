import { group, stratify } from 'd3';

function createRadialSunburstChart(data, columnName) {
  const stratifiedData = stratify()
    .id(d => d.Sequence)
    .parentId(d => d.ParentSequence)
    (data);

  const root = group(stratifiedData, columnName);

  const width = 700;
  const radius = width / 6;
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const partition = d3.partition()
    .size([2 * Math.PI, radius]);

  const arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(0.01)
    .padRadius(radius / 2)
    .innerRadius(d => d.y0)
    .outerRadius(d => d.y1 - 1);

  const svg = d3.select('#chart-container')
    .append('svg')
    .attr('viewBox', [-width / 2, -width / 2, width, width]);

  const arcs = svg.selectAll('g')
    .data(partition(root).descendants())
    .enter()
    .append('g');

  arcs.append('path')
    .attr('fill', d => { while (d.depth > 1) d = d.parent; return color(d.data.Sequence); })
    .attr('d', arc);

  arcs.append('text')
    .attr('transform', d => `translate(${arc.centroid(d)})`)
    .attr('dy', '0.35em')
    .text(d => d.data.Sequence);

  svg.node();
}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["Radial Data.csv", {url: new URL("./Radial Data.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => {
    const file = fileAttachments.get(name);
    if (!file) {
      throw new Error(`File not found: ${name}`);
    }
    return {
      url: file.url,
      blob: () => fetch(file.url).then(response => response.blob()),
      text: () => fetch(file.url).then(response => response.text()),
      arrayBuffer: () => fetch(file.url).then(response => response.arrayBuffer())
    };
  }, new Set(["Radial Data.csv"])));
  
  main.variable(observer("data")).define("data", ["FileAttachment"], function(FileAttachment){return(
    FileAttachment('Radial Data.csv').csv()
  )});
  
  main.variable(observer()).define(["createRadialSunburstChart","data"], function(createRadialSunburstChart,data){return(
    createRadialSunburstChart(data, 'SUMA DECONTATA')
  )});

  return main;
}

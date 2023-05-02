// Load data from CSV file
d3.csv("https://raw.githubusercontent.com/A-LM/SequencesSunburst/main/Radial%20Data.csv").then(function(data) {

  // Aggregate sum of SUMA DECONTATA
  var totalSum = d3.sum(data, function(d) { return +d['SUMA DECONTATA']; });

  // Create root node
  var root = d3.hierarchy({values: data})
    .sum(function(d) { return +d['SUMA DECONTATA']; })
    .sort(function(a, b) { return b.value - a.value; });

  // Add properties for percentage and value relative to root
  root.each(function(d) {
    d.valuePercent = (d.value / totalSum) * 100;
    d.parentValuePercent = (d.parent ? d.parent.valuePercent : 100);
    d.valueFromRoot = d.value / totalSum;
    d.parentValueFromRoot = (d.parent ? d.parent.valueFromRoot : 1);
  });

  // Create partition layout
  var partition = d3.partition();
  partition(root);

  // Create arcs
  var arc = d3.arc()
    .startAngle(function(d) { return d.x0; })
    .endAngle(function(d) { return d.x1; })
    .padAngle(0.002)
    .padRadius(radius / 2)
    .innerRadius(function(d) { return d.y0; })
    .outerRadius(function(d) { return d.y1 - 1; });

  var mousearc = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", width)
    .attr("class", "mousearc")
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + width / 2 + ")");

  // Nest the data by continent, STAT, SCOP PROIECT, ASOCIATIE, DETALIU
  var nestedData = d3.nest()
    .key(function(d) { return d.CONTINENT; })
    .key(function(d) { return d.STAT; })
    .key(function(d) { return d["SCOP PROIECT"]; })
    .key(function(d) { return d.ASOCIATIE; })
    .key(function(d) { return d.DETALIU; })
    .rollup(function(leaves) {
      return d3.sum(leaves, function(d) { return d["SUMA DECONTATA"]; });
    })
    .entries(data);

  var hierarchy = d3.hierarchy({values: nestedData}, function(d) { return d.values; })
    .sum(function(d) { return d.value; })
    .sort(function(a, b) { return b.value - a.value; });

  var color = d3.scaleOrdinal(d3.schemeCategory20c);

  var sunburst = _sunburst(partition, hierarchy, d3, radius, width, color, arc, mousearc);

  var breadcrumb = d3.select("#sequence").append("div")
    .style("position", "relative")
    .style("left", "10px")
    .style("top", "10px")
    .style("width", "fit-content")
    .style("font-size", "0.8em")
    .style("line-height", "1.4em");

  breadcrumb.node().appendChild(_breadcrumb(d3, 75, 20, sunburst, arc, color));

});

function _sunburst(partition,data,d3,radius,width,color,arc,mousearc)
{
  const root = partition(data);
  const svg = d3.create("svg");
  // Make this into a view, so that the currently hovered sequence is available to the breadcrumb
  const element = svg.node();
  element.value = { sequence: [], percentage: 0.0 };

  const label = svg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("fill", "#888")
    .style("visibility", "hidden");

  label
    .append("tspan")
    .attr("class", "percentage")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", "-0.1em")
    .attr("font-size", "3em")
    .text("");

  label
    .append("tspan")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", "1.5em")
    .text("of visits begin with this sequence");

  svg
    .attr("viewBox", `${-radius} ${-radius} ${width} ${width}`)
    .style("max-width", `${width}px`)
    .style("font", "12px sans-serif");

  const path = svg
    .append("g")
    .selectAll("path")
    .data(
      root.descendants().filter(d => {
        // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
        return d.depth && d.x1 - d.x0 > 0.001;
      })
    )
    .join("path")
    .attr("fill", d => color(d.data.name))
    .attr("d", arc);

  svg
    .append("g")
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("mouseleave", () => {
      path.attr("fill-opacity", 1);
      label.style("visibility", "hidden");
      // Update the value of this view
      element.value = { sequence: [], percentage: 0.0 };
      element.dispatchEvent(new CustomEvent("input"));
    })
    .selectAll("path")
    .data(
      root.descendants().filter(d => {
        // Don't draw the root node, and for efficiency, filter out nodes that would be too small to see
        return d.depth && d.x1 - d.x0 > 0.001;
      })
    )
    .join("path")
    .attr("d", mousearc)
    .on("mouseenter", (event, d) => {
      // Get the ancestors of the current segment, minus the root
      const sequence = d
        .ancestors()
        .reverse()
        .slice(1);
      // Highlight the ancestors
      path.attr("fill-opacity", node =>
        sequence.indexOf(node) >= 0 ? 1.0 : 0.3
      );
      const percentage = ((100 * d.value) / root.value).toPrecision(3);
      label
        .style("visibility", null)
        .select(".percentage")
        .text(percentage + "%");
      // Update the value of this view with the currently hovered sequence and percentage
      element.value = { sequence, percentage };
      element.dispatchEvent(new CustomEvent("input"));
    });

  return element;
}

function _4(md){return(
md`

`
)}

async function _csv(d3,FileAttachment){return(
d3.csvParseRows(await FileAttachment("/Users/almartinescu/Desktop/Migrating graphs/Radial Data.csv").text())
)}

function _data(buildHierarchy,csv){return(
buildHierarchy(csv)
)}

function _partition(d3,radius){return(
data =>
  d3.partition().size([2 * Math.PI, radius * radius])(
    d3
      .hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value)
  )
)}

function _color(d3){return(
d3
  .scaleOrdinal()
  .domain(["home", "product", "search", "account", "other", "end"])
  .range(["#5d85cf", "#7c6561", "#da7847", "#6fb971", "#9e70cf", "#bbbbbb"])
)}

function _width(){return(
640
)}

function _radius(width){return(
width / 2
)}

function _arc(d3,radius){return(
d3
  .arc()
  .startAngle(d => d.x0)
  .endAngle(d => d.x1)
  .padAngle(1 / radius)
  .padRadius(radius)
  .innerRadius(d => Math.sqrt(d.y0))
  .outerRadius(d => Math.sqrt(d.y1) - 1)
)}

function _mousearc(d3,radius){return(
d3
  .arc()
  .startAngle(d => d.x0)
  .endAngle(d => d.x1)
  .innerRadius(d => Math.sqrt(d.y0))
  .outerRadius(radius)
)}

function _buildHierarchy(){return(
function buildHierarchy(csv) {
  // Helper function that transforms the given CSV into a hierarchical format.
  const root = { name: "root", children: [] };
  for (let i = 0; i < csv.length; i++) {
    const sequence = csv[i][0];
    const size = +csv[i][1];
    if (isNaN(size)) {
      // e.g. if this is a header row
      continue;
    }
    const parts = sequence.split("-");
    let currentNode = root;
    for (let j = 0; j < parts.length; j++) {
      const children = currentNode["children"];
      const nodeName = parts[j];
      let childNode = null;
      if (j + 1 < parts.length) {
        // Not yet at the end of the sequence; move down the tree.
        let foundChild = false;
        for (let k = 0; k < children.length; k++) {
          if (children[k]["name"] == nodeName) {
            childNode = children[k];
            foundChild = true;
            break;
          }
        }
        // If we don't already have a child node for this branch, create it.
        if (!foundChild) {
          childNode = { name: nodeName, children: [] };
          children.push(childNode);
        }
        currentNode = childNode;
      } else {
        // Reached the end of the sequence; create a leaf node.
        childNode = { name: nodeName, value: size };
        children.push(childNode);
      }
    }
  }
  return root;
}
)}

function _breadcrumbWidth(){return(
75
)}

function _breadcrumbHeight(){return(
30
)}

function _breadcrumbPoints(breadcrumbWidth,breadcrumbHeight){return(
function breadcrumbPoints(d, i) {
  const tipWidth = 10;
  const points = [];
  points.push("0,0");
  points.push(`${breadcrumbWidth},0`);
  points.push(`${breadcrumbWidth + tipWidth},${breadcrumbHeight / 2}`);
  points.push(`${breadcrumbWidth},${breadcrumbHeight}`);
  points.push(`0,${breadcrumbHeight}`);
  if (i > 0) {
    // Leftmost breadcrumb; don't include 6th vertex.
    points.push(`${tipWidth},${breadcrumbHeight / 2}`);
  }
  return points.join(" ");
}
)}

function _d3(require){return(
require("d3@6")
)}

function _18(md){return(
md`This notebook reuses much of the \`buildHierarchy\` function from my original [Sequences sunburst](https://gist.github.com/kerryrodden/7090426) gist, which was published when I worked at Google, with the following [license](https://gist.github.com/kerryrodden/7090426#file-license):

> Copyright 2013 Google Inc. All Rights Reserved.
>
> Licensed under the Apache License, Version 2.0 (the "License");
> you may not use this file except in compliance with the License.
> You may obtain a copy of the License at
>
>    http://www.apache.org/licenses/LICENSE-2.0
>
> Unless required by applicable law or agreed to in writing, software
> distributed under the License is distributed on an "AS IS" BASIS,
> WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
> See the License for the specific language governing permissions and
> limitations under the License.`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["visit-sequences@1.csv", {url: new URL("./files/4b8bc441afab87356f7b5cc5aef3130f4ca634aaae3a46ba7c0f7950b152bc9cdd9bbddae444d694f3e3b4d43587419a17eb0bd5fbd340ce6d6c7b31907bfc7b.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("breadcrumb")).define("breadcrumb", ["d3","breadcrumbWidth","breadcrumbHeight","sunburst","breadcrumbPoints","color"], _breadcrumb);
  main.variable(observer("viewof sunburst")).define("viewof sunburst", ["partition","data","d3","radius","width","color","arc","mousearc"], _sunburst);
  main.variable(observer("sunburst")).define("sunburst", ["Generators", "viewof sunburst"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], _4);
  main.variable(observer("csv")).define("csv", ["d3","FileAttachment"], _csv);
  main.variable(observer("data")).define("data", ["buildHierarchy","csv"], _data);
  main.variable(observer("partition")).define("partition", ["d3","radius"], _partition);
  main.variable(observer("color")).define("color", ["d3"], _color);
  main.variable(observer("width")).define("width", _width);
  main.variable(observer("radius")).define("radius", ["width"], _radius);
  main.variable(observer("arc")).define("arc", ["d3","radius"], _arc);
  main.variable(observer("mousearc")).define("mousearc", ["d3","radius"], _mousearc);
  main.variable(observer("buildHierarchy")).define("buildHierarchy", _buildHierarchy);
  main.variable(observer("breadcrumbWidth")).define("breadcrumbWidth", _breadcrumbWidth);
  main.variable(observer("breadcrumbHeight")).define("breadcrumbHeight", _breadcrumbHeight);
  main.variable(observer("breadcrumbPoints")).define("breadcrumbPoints", ["breadcrumbWidth","breadcrumbHeight"], _breadcrumbPoints);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  main.variable(observer()).define(["md"], _18);
  return main;
}

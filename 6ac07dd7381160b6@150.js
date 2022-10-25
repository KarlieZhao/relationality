function _1(md){return(
md`# Hover Voronoi

A demonstration of [d3-delaunay](https://github.com/d3/d3-delaunay).`
)}

function _canvas(DOM,width,height,d3,particles,true_neighbors)
{
  const context = DOM.context2d(width, height);

  function update() {
    const delaunay = d3.Delaunay.from(particles);
    const voronoi = delaunay.voronoi([0.5, 0.5, width - 0.5, height - 0.5]);
    context.clearRect(0, 0, width, height);

    context.beginPath();
    voronoi.render(context);
    voronoi.renderBounds(context);
    context.fillStyle = "#383326";
    for (const i of particles) voronoi.renderCell(i, context);
    context.fill();
    context.strokeStyle = "#222";
    context.stroke();

    // https://coolors.co/ffd555-ffb833-ff9428-ff4e26
    context.fillStyle = "#ff9626";
    context.beginPath();
    voronoi.renderCell(0, context);
    context.fill();
    context.strokeStyle = "#222";
    context.stroke();

    const Y = true_neighbors(voronoi, 0),
      U = [...delaunay.neighbors(0)].filter((j) => !Y.includes(j));

    //yellow
    context.fillStyle = "#FFCC33";
    context.beginPath();
    for (const j of U) voronoi.renderCell(j, context);
    context.fill();
    context.strokeStyle = "#222";
    context.stroke();

    //orange
    context.fillStyle = "#FFB429";
    context.beginPath();
    for (const j of Y) voronoi.renderCell(j, context);
    context.fill();
    context.strokeStyle = "#222";
    context.stroke();

    context.beginPath();
    delaunay.render(context);
    context.strokeStyle = "#A21D1D80";
    context.stroke();

    context.beginPath();
    context.fillStyle = "#A21D1D77";
    delaunay.renderPoints(context);
    context.fill();
  }

  context.canvas.ontouchmove = context.canvas.onmousemove = (event) => {
    event.preventDefault();
    particles[0] = [event.layerX, event.layerY];
    update();
  };

  context.canvas.onclick = (event) => {
    event.preventDefault();
    // particles[0] = [event.layerX, event.layerY];
    particles.push([event.layerX, event.layerY]);
    update();
  };

  update();

  return context.canvas;
}


function _particles(n,width,height){return(
Array.from({ length: n }, () => [
  Math.random() * width,
  Math.random() * height
])
)}

function _height(){return(
window.innerHeight*0.98
)}

function _n(){return(
  500
)}

function _true_neighbors(){return(
function true_neighbors(voronoi, i) {
  const n = [];
  const ai = new Set((voronoi.cellPolygon(i) || []).map(String));
  for (const j of voronoi.delaunay.neighbors(i))
    for (const c of voronoi.cellPolygon(j) || [])
      if (ai.has(String(c))) n.push(j);
  return n;
}
)}

function _d3(require){return(
require("d3-delaunay@5")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  // main.variable(observer()).define(["md"], _1);
  main.variable(observer("canvas")).define("canvas", ["DOM","width","height","d3","particles","true_neighbors"], _canvas);
  main.variable().define("particles", ["n","width","height"], _particles);//observer("particles")
  main.variable().define("height", _height);//observer("height")
  main.variable().define("n", _n);//observer("n")
  main.variable().define("true_neighbors", _true_neighbors);//observer("true_neighbors")
  main.variable().define("d3", ["require"], _d3);//observer("d3")
  return main;
}

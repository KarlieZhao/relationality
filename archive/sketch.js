let colors = [];
let freqs = [];
let dia_length;

let oscs = [];
let speeches = [];
let p;

let startPlaying = false;

freesound.setToken("zcY7Xe1bN9d3VnNmVhzHsfMWI7Pamkr53amV57B0");

function preload() {
    speeches[0] = loadSound("../soundfiles/speech_german.mp3");
    speeches[1] = loadSound("../soundfiles/candy-gained.mp3");
    speeches[2] = loadSound("../soundfiles/aya.mp3");
    speeches[3] = loadSound("../soundfiles/ro.mp3");

}

function setup() {
    createCanvas(windowWidth, windowHeight);
    dia_length = sqrt(windowWidth * windowWidth + windowHeight * windowHeight);
    // for (let i = 0; i < 30; i++) {
    //     oscs[i] = new p5.TriOsc(); // set frequency and type
    //     oscs[i].amp(0);
    // oscs[i].freq(100);
    // oscs[i].start();
    // }

    colors = "46b1c9-84c0c6-9fb7b9-bcc1ba-f2e2d2".split("-").map(a => "#" + a)
    nb_pts = 3;
    p = [];
    p_selected = [];
    for (i = 0; i < nb_pts; ++i) {
        // p.push(createVector(random(p_radius, windowWidth - p_radius), random(p_radius, windowHeight - p_radius)))
        a = (-i / nb_pts) * 2 * PI;
        r = windowHeight * 0.3 * (0.2 + random(0, 0.5));

        p.push(createVector(random(20, width - 20), random(20, height - 20)));
        // p.push(createVector(windowWidth*0.5+cos(a) * r, windowHeight*0.5+sin(a) *r))
        p_selected.push(false);
    }

    draw_voronoi = true;
    draw_delaunay = true;

    draw_circles = true;
    draw_vertices = true;

    p_radius = 20;
    del = false;

    strokeJoin(ROUND);
}
let vols = [0, 0, 0, 0, 0, 0];

function makeSound(triangulation) {
    if (startPlaying) {
        for (let j = 0; j < p.length; j++) {
            let d = 0;
            for (var it = 0; it < triangulation.length / 3; ++it) {
                c = getPoint(
                    p[triangulation[it * 3 + 0]],
                    p[triangulation[it * 3 + 1]],
                    p[triangulation[it * 3 + 2]]
                );
                d += p5.Vector.dist(p[j], c);
                let vol = constrain(map(d, 0, dia_length * 2, 0, 1), 0, 1);
                vol = lerp(vols[j], vol, 0.1);
                vols[j * triangulation.length / 3 + it] = vol;
                console.log(j + ": " + vols[j]);
                if (speeches[j].isPlaying()) {
                    // speeches[osc_index].setVolume(vol);
                    speeches[j].setVolume(vol);
                } else {
                    speeches[j].loop();
                }
            }
        }
    }

    // let freq = map(dist(pta.x, pta.y, ptb.x, ptb.y), 0, width, 40, 800);
    // oscs[osc_index].freq(freq);
    // oscs[osc_index].amp(0.5);
    // if (startPlaying) {
    //     if (speeches[osc_index].isPlaying()) {
    //         speeches[osc_index].setVolume(vol);
    //         // map(dist(pta.x, pta.y, ptb.x, ptb.y), 0, dia_length, 0.1, 0.9)
    //     } else {
    //         speeches[osc_index].play();
    //     }
    // }
}

function mouse() {
    return createVector(mouseX, mouseY);
}

function draw_poly_vertices() {
    push();

    stroke(100);
    for (i = 0; i < p.length; ++i) {
        if (p_selected[i]) {
            if (mouseIsPressed) fill(200);
            else fill(225);
        } else fill(255);
        circle(p[i].x, p[i].y, p_radius);
    }

    textSize(p_radius * 0.6);
    textAlign(CENTER, CENTER);
    noStroke();
    fill(0);
    for (i = 0; i < p.length; ++i) {
        text(i, p[i].x, p[i].y);
    }
    pop();
}

function draw_triangulation(triangulation) {
    push();
    noFill();
    stroke(200);
    strokeWeight(1.5);
    for (i = 0; i < triangulation.length / 3; ++i) {
        triangle(
            p[triangulation[i * 3 + 0]].x,
            p[triangulation[i * 3 + 0]].y,
            p[triangulation[i * 3 + 1]].x,
            p[triangulation[i * 3 + 1]].y,
            p[triangulation[i * 3 + 2]].x,
            p[triangulation[i * 3 + 2]].y
        );
        //vol a = edge1 + edge2;
        //vol b = edge2 + edge3;
        //vol c = edge1 + edge3;

        makeSound(triangulation);
        // makeSound(i + 1, p[triangulation[i + 0]], p[triangulation[i + 2]]);
        // makeSound(i + 2, p[triangulation[i + 1]], p[triangulation[i + 2]]);
    }

    pop();
}

function getPoint(a, b, c) {
    return circumcenter(a, b, c);
}

function barycenter(a, b, c) {
    return p5.Vector.add(a, p5.Vector.add(b, c)).div(3);
}

//Gets the circumcenter of triangle abc
function circumcenter(a, b, c) {
    cx = c.x;
    cy = c.y;
    ax = a.x - cx;
    ay = a.y - cy;
    bx = b.x - cx;
    by = b.y - cy;

    denom = 2 * det(ax, ay, bx, by);
    numx = det(ay, ax * ax + ay * ay, by, bx * bx + by * by);
    numy = det(ax, ax * ax + ay * ay, bx, bx * bx + by * by);

    ccx = cx - numx / denom;
    ccy = cy + numy / denom;

    return createVector(ccx, ccy);
}

//Determinant of 2x2 matrix
function det(m00, m01, m10, m11) {
    return m00 * m11 - m01 * m10;
}

function compute_edge_tri_map(triangulation) {
    var edge_tri_map = {};
    for (var it = 0; it < triangulation.length / 3; ++it) {
        for (var iv = 0; iv < 3; ++iv) {
            i0 = triangulation[it * 3 + iv];
            i1 = triangulation[it * 3 + ((iv + 1) % 3)];
            edge = [min(i0, i1), max(i0, i1)];

            if (!(edge in edge_tri_map)) edge_tri_map[edge] = [];

            edge_tri_map[edge].push(it);
        }
    }
    return edge_tri_map;
}

function draw_triangulation_circumcircles(triangulation) {
    push();
    noFill();
    stroke(200);
    strokeWeight(0.5);

    for (var it = 0; it < triangulation.length / 3; ++it) {
        c = getPoint(
            p[triangulation[it * 3 + 0]],
            p[triangulation[it * 3 + 1]],
            p[triangulation[it * 3 + 2]]
        );
        r = c.dist(p[triangulation[it * 3 + 0]]);
        circle(c.x, c.y, r * 2);
    }
    pop();
}

function compute_voronoi(triangulation, edge_tri_map) {
    verts = [];
    for (var it = 0; it < triangulation.length / 3; ++it) {
        verts.push(
            getPoint(
                p[triangulation[it * 3 + 0]],
                p[triangulation[it * 3 + 1]],
                p[triangulation[it * 3 + 2]]
            )
        );
    }

    edges = [];
    for (var edge in edge_tri_map) {
        if (edge_tri_map[edge].length == 2) {
            t0 = edge_tri_map[edge][0];
            t1 = edge_tri_map[edge][1];
            edges.push([t0, t1]);
        } else {
            t0 = edge_tri_map[edge][0];

            edges.push([t0, verts.length]);

            p0 = getPoint(
                p[triangulation[t0 * 3 + 0]],
                p[triangulation[t0 * 3 + 1]],
                p[triangulation[t0 * 3 + 2]]
            );
            pt_0 = p[parseInt(edge.split(",")[0], 10)];
            pt_1 = p[parseInt(edge.split(",")[1], 10)];

            dir = p5.Vector.sub(pt_1, pt_0).normalize().mult(10000);
            dir.rotate(PI / 2);

            if (
                dir.dot(
                    p5.Vector.sub(
                        p5.Vector.lerp(pt_0, pt_1, 0.5),
                        barycenter(
                            p[triangulation[t0 * 3 + 0]],
                            p[triangulation[t0 * 3 + 1]],
                            p[triangulation[t0 * 3 + 2]]
                        )
                    )
                ) < 0
            )
                dir.mult(-1);

            verts.push(p5.Vector.add(p0, dir));
        }
    }

    return [verts, edges];
}

function draw_voronoi_cells(verts, edges) {
    push();
    let p1_index = 1;
    let p2_index = 2;

    stroke(130);
    strokeWeight(1);
    for (i = 0; i < edges.length; ++i) {
        p0 = verts[edges[i][0]];
        p1 = verts[edges[i][1]];

        line(p0.x, p0.y, p1.x, p1.y);

    }
    // for (let i = 0; i < 3; i++) {
    //     fill(colors[i % colors.length]);
    //     beginShape();
    //     vertex(p0.x, p0.y);
    //     vertex(verts[p1_index].x, verts[p1_index].y);
    //     vertex(verts[p2_index].x, verts[p2_index].y);

    //     p1_index++;
    //     p2_index = (p2_index + 1) % 4;
    //     if (p2_index == 0) p2_index++;
    //     endShape();
    // }

    noStroke();
    fill(200);
    for (i = 0; i < verts.length; ++i) {
        fill(255, 0, 0);
        circle(verts[i].x, verts[i].y, p_radius * 0.25);
    }

    pop();
}

function draw() {
    background(255);

    for (i = 0; i < p.length; ++i) {
        if (p_selected[i] && mouseIsPressed) {
            p[i].add(createVector(movedX, movedY));
        }
    }

    fill(220);
    stroke(0);
    strokeWeight(3);

    var triangulation = Delaunay.triangulate(
        p.map(function(pt) {
            return [pt.x, pt.y];
        })
    );

    edge_tri_map = compute_edge_tri_map(triangulation);

    voronoi = compute_voronoi(triangulation, edge_tri_map);
    verts = voronoi[0];
    edges = voronoi[1];

    if (draw_voronoi) {
        draw_voronoi_cells(verts, edges);
    }

    if (draw_circles) {
        draw_triangulation_circumcircles(triangulation);
    }

    strokeWeight(2.5);

    if (draw_delaunay) {
        draw_triangulation(triangulation);
    }

    if (draw_vertices) {
        draw_poly_vertices();
    }

    //print data (text)

    // fill(0);
    // noStroke();
    // textAlign(LEFT, BOTTOM);

    // data = [
    //     ["#points", p.length.toFixed(0)],
    //     ["#triangle", triangulation.length.toFixed(0)],
    //     ["#edges", Object.keys(edge_tri_map).length.toFixed(0)],
    //     ["mode (ctrl)", del ? "RM" : "ADD"],
    //     ["draw triangles (t)", draw_delaunay ? "yes" : "no"],
    //     ["draw cells (v)", draw_voronoi ? "yes" : "no"],
    //     ["draw circles (c)", draw_circles ? "yes" : "no"],
    //     ["draw vertices (s)", draw_vertices ? "yes" : "no"],
    // ];

    // // 	for(i=0; i<triangulation.length; ++i)
    // // 		data.push(["  "+i, triangulation[i][0]+" "+triangulation[i][1]+" "+triangulation[i][2]])

    // x = 15;
    // y = 30;
    // dy = 15;
    // w = 150;

    // fill(240, 240, 240, 200);
    // rect(x - dy * 0.5, y - dy * 1.5, w + dy, dy + dy * data.length);
    // fill(100);

    // for (i = 0; i < data.length; ++i) {
    //     textAlign(LEFT);
    //     text(data[i][0] + " :", x, y);
    //     textAlign(RIGHT);
    //     text(data[i][1], x + w, y);
    //     y += dy;
    // }
}

function mousePressed() {
    if (del) {
        for (i = 0; i < p.length; ++i) {
            if (p_selected[i]) {
                p.splice(i, 1);
                p_selected.splice(i, 1);
                break;
            }
        }
    }
}

function mouseMoved() {
    for (i = 0; i < p.length; ++i) {
        p_selected[i] = false;
    }

    m = mouse();
    i_min = 0;
    for (i = 1; i < p.length; ++i) {
        if (m.dist(p[i]) < m.dist(p[i_min])) {
            i_min = i;
        }
    }
    p_selected[i_min] = true;
}

function mouseReleased() {
    for (i = 0; i < p.length; ++i) {
        p_selected[i] = false;
    }
}

function doubleClicked() {
    p.push(mouse());
    p_selected.push(false);
}

function keyPressed() {

    //   if (keyCode === 17) {
    //     del = true;
    //   }
    //   if (key === "v") draw_voronoi = !draw_voronoi;
    //   if (key === "t") draw_delaunay = !draw_delaunay;
    //   if (key === "c") draw_circles = !draw_circles;
    //   if (key === "s") draw_vertices = !draw_vertices;
}

function keyReleased() {
    del = false;
    startPlaying = true;
}
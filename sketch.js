
let started
let algo
let startButton
let screen
let graph
let rows
let cols
let resolution
let openSet
let closedSet
let source;
let destination;
let shortestPath
let w;
let h;
let sourceSelected
let destinationSelected

function resetCanvas() {
    console.log(new Node(0, 0))
    started = false
    algo = null
    resolution = 30
    openSet = []
    closedSet = []
    shortestPath = []
    sourceSelected = false
    destinationSelected = false

    rows = floor(height / resolution);
    cols = floor(width / resolution);
    w = width / cols;
    h = height / rows;
    graph = twoDArray(rows, cols);
    startButton = document.getElementById("startButton")
    startButton.disabled = false
    startButton.innerHTML = "Visualize"
    startButton.onclick = start;
    let message = document.getElementById('message')
    message.innerHTML = ""

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            graph[i][j] = new Node(i, j);
        }
    }
    
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            graph[i][j].addNeighbor();
        }
    }
    
    if (source === undefined || destination === undefined) {

        x = Math.floor(Math.random() * cols / 2)
        y = Math.floor(Math.random() * rows)

        source = graph[x][y];

        x = Math.floor(Math.random() * (cols - Math.floor((cols / 2 + 1)))) + Math.floor((cols / 2 + 1));
        y = Math.floor(Math.random() * rows)

        destination = graph[x][y];
    }
    
    else {
        graph.forEach(row => {
            row.forEach((node) => {
                if (node.i === source.i && node.j === source.j) {
                    source = node
                }
                if (node.i === destination.i && node.j === destination.j) {
                    destination = node
                }
            })
        })
    }
    
    source.obstacle = false;
    destination.obstacle = false;

    background(255);
    
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            graph[i][j].show(255);
        }
    }
    source.show(color(87, 50, 168));
    destination.show(color(140, 68, 20));
    noLoop();
    console.log(openSet)
}

function Node(i, j) {
    this.i = i;
    this.j = j;
    this.x = this.i * resolution;
    this.y = this.j * resolution;
    this.r = resolution - 1;

    
    this.f = 0;
    this.g = 0;
    this.h = 0;

    
    this.d = Infinity

    this.obstacle = false;
    this.parent = undefined;
    this.neighbors = []
    this.dragging = false

    this.show = (color) => {
        console.log(color)
        let x = this.x;
        let y = this.y;
        let r = this.r;
        if (this.obstacle) {
            fill(128, 128, 128);
        }
        else {
            fill(color);
        }
        
        stroke(66, 148, 255, 90);
        strokeWeight(1);
        rect(x, y, r, r);
    }
    this.addNeighbor = () => {

        let i = this.i;
        let j = this.j;
        
        if (i > 0) this.neighbors.push(graph[i - 1][j]);
        if (i < cols - 1) this.neighbors.push(graph[i + 1][j]);
        if (j > 0) this.neighbors.push(graph[i][j - 1]);
        if (j < rows - 1) this.neighbors.push(graph[i][j + 1]);
    }

    this.clicked = () => {
        if (sourceSelected) {
            this.show(color(87, 50, 168))
        }
        else if (destinationSelected) {
            this.show(color(140, 68, 20))
        }
        else if (!this.obstacle) {
            this.obstacle = true;
            this.show(color(128, 128, 128));
        }

    }
}

function twoDArray(rows, cols) {
    let arrays = new Array(cols);
    for (let i = 0; i < arrays.length; i++) {
        arrays[i] = new Array(rows)
    }
    return arrays;
}

function windowResized() {
    centerCanvas();
}

function centerCanvas() {
    var x = ((windowWidth) - width) / 2;
    var y = ((windowHeight - (windowHeight * 0.20)) - height) / 2;
    screen.position(x, y);
}

function setup() {
    screen = createCanvas(windowWidth - (windowHeight * 0.05), windowHeight - (windowHeight * 0.20));
    screen.parent("sketch01");
    centerCanvas();
    resetCanvas()
}

function dijkstraInitialize(){
    source.d = 0

    graph.forEach( row => {
        row.forEach( node => {
            openSet.push(node)
        })
    })
}

function initialize() {
    openSet.push(source);
}

function BFSorDFS_initialize() {
    openSet.push(source);
    closedSet.push(source)

}
function draw() {
    if (started) {
        if (algo == "Dijkstra") {
            if (openSet.length > 0) {
                current = lowestDscoreNode();
                
                if(current.d === Infinity){
                    console.log('no solution');
                    noLoop();
                    return;
                }
            
                if (current === destination) {
                    noLoop();
                    console.log("We're Done!")
                }

                var removeIndex = openSet.map(function (item) { return item; }).indexOf(current);
                openSet.splice(removeIndex, 1);
                closedSet.push(current)
                for (neighbor of current.neighbors) {
                    if (!neighbor.obstacle) {
                        dScore = current.d + 1
                        if(dScore < neighbor.d){
                            neighbor.d = dScore
                            neighbor.parent = current
                        }
                        
                    }
                }

            }

        }

        if (algo == "A* Search") {
            if (openSet.length > 0) {
                current = lowestFscoreNode();
                if (current == destination) {
                    noLoop();
                    console.log("We're Done!")
                }

                var removeIndex = openSet.map(function (item) { return item; }).indexOf(current);
                openSet.splice(removeIndex, 1);
                closedSet.push(current);

                for (neighbor of current.neighbors) {
                    if (!closedSet.includes(neighbor) && !neighbor.obstacle) {
                        gScore = current.g + heuristic(neighbor, current);
                        let isGbetter = false;
                        if (openSet.includes(neighbor)) {
                            if (gScore < neighbor.g) {
                                neighbor.g = gScore;
                                isGbetter = true;
                            }
                        }
                        else {
                            neighbor.g = gScore;
                            isGbetter = true;
                            openSet.push(neighbor);
                        }
                        if (isGbetter) {
                            neighbor.h = heuristic(neighbor, destination);
                            neighbor.f = neighbor.g + neighbor.h;
                            neighbor.parent = current;
                        }
                    }
                }

            }
            else {
                console.log('no solution');
                noLoop();
                return;
            }
        }

        if (algo == "Greedy Best First Search") {
            if (openSet.length > 0) {
                current = lowestHeuristicNode();
                if (current == destination) {
                    noLoop();
                    console.log("We're Done!")
                }

                var removeIndex = openSet.map(function (item) { return item; }).indexOf(current);
                openSet.splice(removeIndex, 1);
                closedSet.push(current);

                for (neighbor of current.neighbors) {
                    if (!closedSet.includes(neighbor) && !openSet.includes(neighbor) && !neighbor.obstacle) {
                        neighbor.h = heuristic(neighbor, destination);
                        neighbor.parent = current;
                        openSet.push(neighbor)
                    }
                }

            }
            else {
                console.log('no solution');
                noLoop();
                return;
            }
        }

        if (algo == "Breadth First Search") {
            if (openSet.length > 0) {
                current = openSet[0]
                if (current == destination) {
                    noLoop();
                    console.log("We're Done!")
                }

                var removeIndex = openSet.map(function (item) { return item; }).indexOf(current);
                openSet.splice(removeIndex, 1);
                console.log(openSet)
                for (neighbor of current.neighbors) {
                    if (!closedSet.includes(neighbor) && !neighbor.obstacle) {
                        openSet.push(neighbor);
                        closedSet.push(neighbor);
                        neighbor.parent = current
                    }
                }

            }
            else {
                console.log('no solution');
                noLoop();
                return;
            }
        }

        if (algo == "Depth First Search") {
            if (openSet.length > 0) {
                console.log(openSet)
                current = openSet[openSet.length - 1]
                if (current == destination) {
                    noLoop();
                    console.log("We're Done!")
                }

                var removeIndex = openSet.map(function (item) { return item; }).indexOf(current);
                openSet.splice(removeIndex, 1);
                console.log(openSet)
                for (neighbor of current.neighbors) {
                    if (!closedSet.includes(neighbor) && !neighbor.obstacle) {
                        openSet.push(neighbor);
                        closedSet.push(neighbor);
                        neighbor.parent = current
                    }
                }

            }
            else {
                console.log('no solution');
                noLoop();
                return;
            }
        }

        background(255);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                graph[i][j].show(255);
            }
        }

        for (node of openSet) {
            if(algo === "Dijkstra"){
                if(node.d != Infinity){
                    node.show(color(45, 196, 129));    
                }
            }
            else{
                node.show(color(45, 196, 129));
            }
        }
        for (node of closedSet) {
            node.show(color(255, 0, 0, 50));
        }
        
        shortestPath = [];
        let temp = current;
        shortestPath.push(temp);
        while (temp.parent) {
            shortestPath.push(temp.parent);
            temp = temp.parent;
        }
        
        noFill();
        stroke(255, 0, 200);
        strokeWeight(4);
        beginShape();
        for (path of shortestPath) {
            vertex(path.i * resolution + resolution / 2, path.j * resolution + resolution / 2);
        }
        endShape();
        source.show(color(87, 50, 168));
        destination.show(color(140, 68, 20));
    }

}

function dropdown(event) {
    algo = event.target.text
    let startButton = document.getElementById('startButton')
    startButton.innerHTML = `Start ${algo}`
    let message = document.getElementById('message')
    if(algo === "A* Search"){
        message.innerHTML = `Insight: A* Search <span style = "font-weight: bold;">Gurantees</span> Shortest Path`
    }
    else if(algo === "Dijkstra"){
        message.innerHTML = `Insight: Dijkstra's Algorithm Or A Variant Of It Is Known As UCS <span style = "font-weight: bold;">Gurantees</span> Shortest Path`
    }
    else if(algo === "Breadth First Search"){
        message.innerHTML = `Insight: Breadth First Search (BFS) <span style = "font-weight: bold;">Gurantees</span> Shortest Path In An <span style = "font-weight: bold;">Unweighted Graph</span> And A Feasible Choice <span style = "font-weight: bold;">If The Destination Is Closer To The Source</span>`
    }
    else if(algo === "Depth First Search"){
        message.innerHTML = `Insight: Depth First Search (DFS) <span style = "font-weight: bold;">Does Not Gurantee</span> Shortest Path Though Is A Feasible Choice For Memory <span style = "font-weight: bold;">If The Destination Is Far Away From The Source</span>`
    }
    else{
        message.innerHTML = `Insight: Greedy Best-First Search <span style = "font-weight: bold;">Does Not Gurantee</span> Shortest Path As It Takes Decision Solely Based On <span style = "font-weight: bold;">Heuristics</span>`
    }
}

function start() {
    if (algo === null) {
        let startButton = document.getElementById('startButton')
        startButton.innerHTML = `Pick An Algorithm!`
        return
    }
   else if(algo === "Dijkstra"){
        dijkstraInitialize()
    }
    else if (algo != "Breadth First Search" && algo != "Depth First Search") {
        initialize()
    }
    else {
        BFSorDFS_initialize()
    }

    started = true;
    startButton.disabled = true
    loop();
}

function throwObstacles() {
    let weights = [
        ["Obstacle", 30],
        ["Non Obstacle", 70]
    ]
    console.log(weights[1][1])
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (graph[i][j] != source && graph[i][j] != destination) {
                let decision = weightedRandom(weights)
                if (decision === "Obstacle") {
                    graph[i][j].obstacle = true
                    graph[i][j].show()
                }
            }
        }
    }
}

function mouseDragged() {
    if(started){
        return
    }
    console.log("clicked");
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (mouseX >= graph[i][j].x && mouseX <= graph[i][j].x + graph[i][j].r && mouseY >= graph[i][j].y && mouseY <= graph[i][j].y + graph[i][j].r) {
                console.log("in IF");
                if (graph[i][j] != source && graph[i][j] != destination) {
                    graph[i][j].clicked();
                }
                if (sourceSelected) {
                    console.log("HERE")
                    source.show(255)
                    source = graph[i][j]
                    graph[i][j].clicked();
                }
                if (destinationSelected) {
                    destination.show(255)
                    destination = graph[i][j]
                    graph[i][j].clicked();
                }
            }
        }
    }
}

function mousePressed() {
    if(started){
        return
    }
    console.log("clicked2");
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (mouseX >= graph[i][j].x && mouseX <= graph[i][j].x + graph[i][j].r && mouseY >= graph[i][j].y && mouseY <= graph[i][j].y + graph[i][j].r) {
                if (graph[i][j] != source && graph[i][j] != destination) {
                    console.log("in IF");
                    console.log(graph[i][j])
                    console.log(source)
                    console.log(graph[i][j] === source)
                    graph[i][j].clicked();
                }
                else {
                    if (source === graph[i][j]) {
                        sourceSelected = true
                    }
                    if (destination === graph[i][j]) {
                        destinationSelected = true
                    }
                }
            }
        }
    }
}

function mouseReleased() {
    if (sourceSelected || destinationSelected) {
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (mouseX >= graph[i][j].x && mouseX <= graph[i][j].x + graph[i][j].r && mouseY >= graph[i][j].y && mouseY <= graph[i][j].y + graph[i][j].r) {
                    if (sourceSelected) {
                        if (graph[i][j] === destination) {
                            source = graph[i - 1][j]
                            source.obstacle = false
                            graph[i][j].show(color(140, 68, 20))
                            source.show(color(87, 50, 168))
                            sourceSelected = false
                        }
                        else {
                            source = graph[i][j]
                            source.obstacle = false
                            source.show(color(87, 50, 168))
                            sourceSelected = false
                        }
                    }
                    else {
                        if (graph[i][j] === source) {

                            destination = graph[i - 1][j]
                            destination.obstacle = false
                            source.show(color(87, 50, 168))
                            destination.show(color(140, 68, 20))
                            destinationSelected = false
                        }
                        else {
                            destination = graph[i][j]
                            destination.obstacle = false
                            destination.show(color(140, 68, 20))
                            destinationSelected = false
                        }
                    }
                }
            }
        }
    }
}

function heuristic(node, goal) {
    dx = abs(node.x - goal.x);
    dy = abs(node.y - goal.y);
    return 1 * (dx + dy);
}

function lowestFscoreNode() {
    let minNode = openSet[0];
    for (node of openSet) {
        if (node.f < minNode.f) {
            minNode = node;
        }
    }
    return minNode;
}

function lowestDscoreNode() {
    let minNode = openSet[0];
    for (node of openSet) {
        if (node.d < minNode.d) {
            minNode = node;
        }
    }
    return minNode;
}

function lowestHeuristicNode() {
    let minNode = openSet[0];
    for (node of openSet) {
        if (node.h < minNode.h) {
            minNode = node;
        }
    }
    return minNode;
}

function weightedRandom(data) {
    let total = 1;
    for (let i = 0; i < data.length; ++i) {
        total += data[i][1];
    }

    const threshold = Math.floor(Math.random() * total);

    total = 0;
    for (let i = 0; i < data.length; ++i) {
        total += data[i][1];

        if (total >= threshold) {
            return data[i][0];
        }
    }
}
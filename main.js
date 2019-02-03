// Canvas DOM object and drawing context
var c, context;

var playing = false;

class Grid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.data = Array(width * height);
        for (var i = 0; i < width * height; i++) {
            this.data[i] = 0;
        }
    }

    get(x, y) {
        return this.data[y * this.width + x];
    }

    set(x, y, value) {
        this.data[y * this.width + x] = value;
    }
}

/**
 * Responsible for displaying a grid in a given area of the canvas
 * with the given colors
 */
class GridRenderer {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw(ctx, grid) {

        var cellWidth = this.width / grid.width;
        var cellHeight = this.height / grid.height;

        // Draw the striped background
        for (var x = 0; x < (grid.width / this.color.stripe); x++) {
            ctx.fillStyle = (x % 2 === 0 ? this.color.bg1 : this.color.bg2);
            ctx.fillRect(
                this.x + x * cellWidth * this.color.stripe,
                this.y,
                cellWidth * this.color.stripe,
                this.height);
        }

        // Draw grid lines
        ctx.strokeStyle = this.color.grid;
        ctx.beginPath;
        for (var x = 0; x < grid.width; x++) {
            ctx.moveTo(this.x + (x * cellWidth), this.y);
            ctx.lineTo((this.x + x * cellWidth), this.y + this.height);
        }
        for (var y = 0; y < grid.height; y++) {
            ctx.moveTo(this.x, (this.y + y * cellHeight));
            ctx.lineTo(this.x + this.width, (this.y + y * cellHeight));
        }
        ctx.stroke();

        // Draw active cells
        ctx.fillStyle = this.color.fg;
        for (var i = 0; i < grid.data.length; i++) {
            if (grid.data[i] != 0) {
                var x = (i % grid.width) * cellWidth;
                var y = Math.floor(i / grid.width) * cellHeight;
                ctx.fillRect(this.x + x + 1, this.y + y + 1, cellWidth - 2, cellHeight - 2);
            }
        }
    }
}

var grid;
var renderer;
var notes = [];
var values = audio.range.chromatic(audio.note('F', 3), 25);

var cursorPos = 0;

var color = {
    bg1: '#282828',  // Primary background
    bg2: '#32302f',  // Secondary background
    grid: '#3c3836', // Color of the gridlines
    fg: '#fbf1c7',   // Foreground (active squares)
    stripe: 8 // Every 8 columns switch between bg1 and bg2
}
    

/**
 * Automatically set the optimum canvas size based on window width and height
 */
function setCanvasSize() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    renderer = new GridRenderer(50, 100, c.width - 200, c.height - 200, color);
}

window.onload = function() {

    c = document.getElementById('canvas');
    context = c.getContext('2d');

    setCanvasSize();
    grid = new Grid(48, 25);

    for (var i = 0; i < grid.height; i++) {
        notes.push(new Pitch(values[i % values.length]));
    }

    document.addEventListener('mousedown', handleMouse);
    document.addEventListener('keydown', handleKeyboard);

    window.addEventListener("resize", setCanvasSize, false);

    requestAnimationFrame(draw);
}

function handleMouse(e) {
    pos = mouseToGrid(e, grid, renderer);
    grid.set(pos.x, pos.y, (grid.get(pos.x, pos.y) === 0 ? 1 : 0));
}

function handleKeyboard(e) {
    if (e.keyCode === 32) { // space
        play();
    }
}

function play() {
    for (var x = 0; x < grid.width; x++) {
        for (var y = 0; y < grid.height; y++) {
            if (grid.get(x, y) === 1) {
                notes[notes.length - y - 1].play(x * 0.2, 0.5, audio.wave.triangle);
            }
        }
    }
}

function draw() {

    // Set up an offscreen canvas to render to for better performance
    var dummy_canvas = document.createElement('canvas');  
    dummy_canvas.width = c.width;
    dummy_canvas.height = c.height;
    var dummy_context = dummy_canvas.getContext('2d');

    // Render everything on the dummy canvas
    renderer.draw(dummy_context, grid);
    drawPianoRoll(dummy_context, 0, 100, 50, c.height - 200, 25, 4);

    // Render the dummy canvas onto the real canvas
    context.drawImage(dummy_canvas, 0, 0);

    // Draw the next frame
    requestAnimationFrame(draw);
}

function drawPianoRoll(ctx, x, y, width, height, keys, note) {

    ctx.fillStyle = 'white';
    ctx.fillRect(x, y, width, height);

    var keyColors = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];

    var keyHeight = height / keys;

    for (var i = 0; i < keys; i++) {
        var ypos = y + Math.floor(i * keyHeight);
        ctx.moveTo(x, ypos);
        ctx.lineTo(x + width, ypos);
    }
    ctx.stroke();

    ctx.fillStyle = 'black';
    var blackKeyWidth = Math.floor(width * .6);
    for (var i = 0; i < keys; i++) {
        if (keyColors[(i + note) % 12] === 1) {
            ctx.fillRect(x, y + Math.floor(i * keyHeight), width, keyHeight);
        }
    }
}

function reset() {
    grid = new Grid(48, 25);
}

/**
 * Translates mouse coordinates into grid coordinates
 */
function mouseToGrid(evt, grid, renderer) {
    var rect = c.getBoundingClientRect();

    return {
        x: Math.floor((evt.clientX - rect.left - renderer.x) / (renderer.width / grid.width)),
        y: Math.floor((evt.clientY - rect.top - renderer.y)  / (renderer.height / grid.height))
    }
}

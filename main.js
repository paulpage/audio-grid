// Canvas DOM object and drawing context
var c, ctx;

// Size of each cell (set automatically)
var cellWidth;
var cellHeight;

var backgroundColor = '#282828'; // Color of inactive cells
var foregroundColor = '#111111'; // Color of active cells
var gridColor = '#3c3836'; // Color of dividing lines
var textColor = '#ebdbb2'; // Color of grid cell text
var cursorColor = '#a89984';

var offset = 2;

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

var grid;
var notes = [];

var cursorPos = 0;

/**
 * Automatically set the optimum canvas size based on window width and height
 */
function setCanvasSize() {
    c.width = window.innerWidth * 0.98;
    cellWidth = c.width / grid.width;
    cellHeight = cellWidth;
    c.height = grid.height * cellHeight;
}

window.onload = function() {

    grid = new Grid(50, 25);

    var values = [
        audio.NOTES.C2,
        audio.NOTES.Cs2,
        audio.NOTES.D2,
        audio.NOTES.Ds2,
        audio.NOTES.E2,
        audio.NOTES.F2,
        audio.NOTES.Fs2,
        audio.NOTES.G2,
        audio.NOTES.Gs2,
        audio.NOTES.A2,
        audio.NOTES.As2,
        audio.NOTES.B2,
        audio.NOTES.C3,
        audio.NOTES.Cs3,
        audio.NOTES.D3,
        audio.NOTES.Ds3,
        audio.NOTES.E3,
        audio.NOTES.F3,
        audio.NOTES.Fs3,
        audio.NOTES.G3,
        audio.NOTES.Gs3,
        audio.NOTES.A3,
        audio.NOTES.As3,
        audio.NOTES.B3,
        audio.NOTES.C4,
    ];

    for (var i = 0; i < grid.height; i++) {
        notes.push(new Note(values[i % values.length]));
    }

    c = document.getElementById('canvas');
    ctx = c.getContext('2d');

    document.addEventListener('click', function(e) {
        pos = mouseToGrid(e);
        grid.set(pos.x, pos.y, (grid.get(pos.x, pos.y) === 0 ? 1 : 0));
    });

    document.addEventListener('keydown', play);

    setCanvasSize();

    window.addEventListener("resize", setCanvasSize, false);

    requestAnimationFrame(draw);
}

function play() {
    for (var x = 0; x < grid.width; x++) {
        for (var y = 0; y < grid.height; y++) {
            if (grid.get(x, y) === 1) {
                notes[notes.length - y - 1].play(x * 0.2, 0.5, audio.WAVES.triangle);
            }
        }
    }
}

/**
 * Draw the grid.
 * Runs once every frame.
 */
function draw() {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.strokeStyle = gridColor;
    ctx.beginPath();
    for (var x = 0; x < grid.width; x++) {
        ctx.moveTo(x * cellWidth, 0);
        ctx.lineTo(x * cellWidth, c.height);
    }
    for (var y = 0; y < grid.height; y++) {
        ctx.moveTo(0, y * cellHeight);
        ctx.lineTo(c.width, y * cellHeight);
    }
    ctx.stroke();

    for (var i = 0; i < grid.data.length; i++) {
        drawCell(i, grid.data[i]);
    }
    requestAnimationFrame(draw);
}

/**
 * Draw each individual cell
 */
function drawCell(pos, val) {
    if (val != 0) {
        var x = pos % grid.width;
        var y = (pos - pos % grid.width) / grid.width;

        var piece_x = x * cellWidth;
        var piece_y = y * cellHeight;

        ctx.fillStyle = foregroundColor;
        ctx.fillRect(piece_x, piece_y, cellWidth, cellHeight);
    }
}

/**
 * Translates mouse coordinates into grid coordinates
 */
function mouseToGrid(evt) {
    var rect = c.getBoundingClientRect();

    return {
        x: Math.floor((evt.clientX - rect.left) / cellWidth),
        y: Math.floor((evt.clientY - rect.top)  / cellHeight)
    }
}
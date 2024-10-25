const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const lineWidthRange = document.getElementById('lineWidthRange');
const clearButton = document.getElementById('clearButton');
const downloadButton = document.getElementById('downloadButton');

let drawing = false;
let currentColor = '#000000';
let currentLineWidth = 2;

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
});

lineWidthRange.addEventListener('input', (e) => {
    currentLineWidth = e.target.value;
});

clearButton.addEventListener('click', clearCanvas);
downloadButton.addEventListener('click', downloadCanvas);

function startDrawing(e) {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
}

function draw(e) {
    if (!drawing) return;
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentLineWidth;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.stroke();
}

function stopDrawing() {
    drawing = false;
    ctx.closePath();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function downloadCanvas() {
    const dataURL = canvas.toDataURL('image/png');
    downloadButton.href = dataURL;
}
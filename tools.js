let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

var frequency = 0.01744826987970336;
var color = "hsl(30,100%,50%)"
var lum = 50;

window.onload = function () {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    init();

};

function showAxes(ctx, axes) {
    var width = ctx.canvas.width;
    var height = ctx.canvas.height;
    var xMin = 0;

    ctx.beginPath();
    ctx.strokeStyle = "rgb(128,128,128)";

    // X-Axis
    ctx.moveTo(xMin, height / 2);
    ctx.lineTo(width, height / 2);

    // Y-Axis
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);

    // Starting line
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);

    ctx.stroke();
}

function plotSine(ctx, xOffset, yOffset) {
    var width = ctx.canvas.width;
    var height = ctx.canvas.height;
    var scale = 20;

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;

    var x = 4;
    var y = 0;
    var amplitude = 100;


    ctx.moveTo(x, ctx.canvas.height / 2);
    while (x < width) {
        y = height / 2 + amplitude * Math.sin((x + xOffset) * frequency);
        ctx.lineTo(x, y);
        x++;

    }
    ctx.stroke();
    ctx.save();

    ctx.stroke();
    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.save();
    plotSine(ctx, step, 50);
    ctx.restore();

    step += 4;

    // Update label text for the current frequency
    updateWavelengthLabel();

    window.requestAnimationFrame(draw);
}

function frequencyForHue(hueDeg) {
    // 0° = red, 270° = violet in our mapping
    let c = hueDeg / 270;             // 0..1 across visible
    c = Math.max(0, Math.min(1, c));

    // Find t in [VIS_START, VIS_END] corresponding to this color
    const t = VIS_START + c * (VIS_END - VIS_START);

    // Convert t back to frequency
    return MIN_FREQ + t * (MAX_FREQ - MIN_FREQ);
}

function setFrequencyFromNormalized(t) {
    t = Math.max(0, Math.min(1, t)); // clamp
    frequency = MIN_FREQ + t * (MAX_FREQ - MIN_FREQ);
}

// Map frequency range to a physical-ish wavelength range in nm
// Adjust these if you want a different IR/UV extent.
const LAMBDA_IR = 750;  // nm, long-wave IR end
const LAMBDA_UV = 380;   // nm, short-wave UV end

function getNormalizedFrequency() {
    // 0 at IR end (long wavelength), 1 at UV end (short wavelength)
    let t = (frequency - MIN_FREQ) / (MAX_FREQ - MIN_FREQ);
    return Math.max(0, Math.min(1, t));
}

function getWavelengthNm() {
    const t = getNormalizedFrequency();
    // frequency ↑ (toward UV) => wavelength ↓
    return LAMBDA_IR - t * (LAMBDA_IR - LAMBDA_UV);
}

function updateWavelengthLabel() {
    const labelEl = document.getElementById("wavelengthLabel");
    if (!labelEl) return;

    const lambda = getWavelengthNm();
    labelEl.textContent = `${lambda.toFixed(0)} nm`;
}

function init() {
    frequency = frequencyForHue(30);
    updateColorFromFrequency();
    updateWavelengthLabel();
    window.requestAnimationFrame(draw);
}
var step = -4;

const MIN_FREQ = 0.006616197340194356;
const MAX_FREQ = 0.795;
const VIS_START = 0.15;
const VIS_END = 0.85;
const MAX_LUM = 50;

function clampFrequency(f) {
    return Math.min(MAX_FREQ, Math.max(MIN_FREQ, f));
}

// Map frequency → hue (red→violet) and luminance envelope (IR/UV invisible)
function updateColorFromFrequency() {
    // Normalize frequency to t in [0, 1], 0 = IR end, 1 = UV end
    let t = (frequency - MIN_FREQ) / (MAX_FREQ - MIN_FREQ);
    t = Math.max(0, Math.min(1, t));

    // ----- LUMINANCE: fade out in IR and UV -----
    // t < VIS_START: ramp from 0 (deep IR) → 1 (red edge)
    // VIS_START ≤ t ≤ VIS_END: fully bright visible band
    // t > VIS_END: ramp from 1 (violet edge) → 0 (deep UV)
    let lumFactor;
    if (t < VIS_START) {
        lumFactor = t / VIS_START;                    // 0 → 1
    } else if (t <= VIS_END) {
        lumFactor = 1;                                // fully bright
    } else {
        lumFactor = (1 - t) / (1 - VIS_END);          // 1 → 0
    }
    lum = lumFactor * MAX_LUM;

    // ----- HUE: red → violet across visible band -----
    // c = 0 → red, c = 1 → violet
    let c;
    if (t <= VIS_START) {
        c = 0; // still red in the IR tail, just dimmer
    } else if (t >= VIS_END) {
        c = 1; // violet in the UV tail, just dimmer
    } else {
        c = (t - VIS_START) / (VIS_END - VIS_START);  // 0..1 across visible
    }

    const hue = 270 * c;  // 0° ≈ red, 270° ≈ violet-blue
    color = `hsl(${hue}, 100%, ${lum}%)`;
}

canvas.addEventListener("wheel", function (event) {
    event.preventDefault();

    const ZOOM_STEP = 1.05;
    if (event.deltaY > 0) {
        frequency = clampFrequency(frequency * ZOOM_STEP);
    } else if (event.deltaY < 0) {
        frequency = clampFrequency(frequency / ZOOM_STEP);
    }

    updateColorFromFrequency();  // if you have this
    updateWavelengthLabel();     // keep text in sync immediately
}, { passive: false });
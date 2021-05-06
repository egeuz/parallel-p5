/*********************/
/***** DOM SETUP *****/
/*********************/
//setup div to contain p5 canvas
const canvas = document.createElement("div");
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.position = "absolute";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.zIndex = "-1";
canvas.id = "canvas-bg";
//find and select the element that will contain the sketch
const containerID = document
  .querySelector("script[container-id]")
  .getAttribute("container-id");
const container = document.getElementById(containerID)
container.style.position = "relative"
container.appendChild(canvas)

/**********************/
/***** P5 RUNTIME *****/
/**********************/
//data containers
let baseImageData;
let baseImage;
let pg; //p5 graphics buffer
let glitchShader;
const ASPECT_RATIO = 1.78;
//mouse movement variables
let prevMouseX = 0;
let prevMouseY = 0;
let prevMouseDelta = 0;

function preload() {
  baseImageData = loadImage('./base_image.png');
  glitchShader = loadShader('./glitch.vert', './glitch.frag');
}

function setup() {
  //shader config
  if (isRetinaDisplay()) pixelDensity(1);
  setAttributes({});
  //p5 config
  frameRate(24);
  rectMode(CENTER);
  imageMode(CENTER);
  noStroke();
  //canvas setup
  const w = document.getElementById("canvas-bg").clientWidth;
  const h = w * ASPECT_RATIO;
  createCanvas(w, h, WEBGL).parent("canvas-bg");
  //graphics buffer config
  pg = createGraphics(w, h, WEBGL);
  pg.imageMode(CENTER);
  //p5 graphics setup
  // baseImage = new BaseImage(baseImageData, 1);
}

function windowResized() {
  //shader config
  if (isRetinaDisplay()) pixelDensity(1);
  //resize canvas
  const w = document.getElementById("canvas-bg").clientWidth;
  const h = w * ASPECT_RATIO;
  resizeCanvas(w, h);
  //resize p5 graphics
  // baseImage.resize()
}

function draw() {
  //delete previous frame contents
  clear();
  pg.clear();
  //apply shader with graphics buffer as channel
  shader(glitchShader)
  glitchShader.setUniform("iResolution", [width, height]);
  glitchShader.setUniform("iFrame", frameCount);
  glitchShader.setUniform("iMouse", [mouseX, mouseY]);
  glitchShader.setUniform("iTime", frameCount);
  glitchShader.setUniform("iChannel0", pg);
  //SET MOUSE VELOCITY UNIFORM
  const mouseDelta = dist(mouseX, mouseY, prevMouseX, prevMouseY)
  const mouseVelocity = map(mouseDelta, 0, width / 2, 0, 1)
  glitchShader.setUniform("iMouseVelocity", mouseVelocity);
  glitchShader.setUniform("iTimeScale", 0.02);
  prevMouseX = mouseX;
  prevMouseY = mouseY;
  //render p5 graphics (into graphics buffer)
  pg.image(baseImageData, 0, 0, pg.width, pg.width * ASPECT_RATIO)
  //render shader onto a canvas-wide rectangle
  rect(0, 0, width, height);
}

class BaseImage {
  constructor(img, scale) {
    this.image = img;
    this.x = pg.width / 2;
    this.y = pg.height / 2;
    this.w = width * scale;
    this.h = height * scale;
    this.scale = scale;
  }

  render() {
    pg.image(this.image, 0, 0, this.w, this.h)
  }

  resize() {
    this.x = pg.width / 2;
    this.y = pg.height / 2;
    this.w = pg.width * this.scale;
    this.h = pg.width * ASPECT_RATIO * this.scale;
  }
}

function isRetinaDisplay() {
  if (window.matchMedia) {
    var mq = window.matchMedia("only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
    return (mq && mq.matches || (window.devicePixelRatio > 1));
  }
}
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
//handle basic responsiveness for canvas element
canvas.style.display = window.innerWidth >= 700 ? "block" : "none"
window.addEventListener("resize", () => {
  canvas.style.display = window.innerWidth >= 700 ? "block" : "none"
})
//find and select the element that will contain the sketch
const containerID = document
  .querySelector("script[container-id]")
  .getAttribute("container-id");
const container = document.getElementById(containerID)
container.style.position = "relative"
container.appendChild(canvas)
/*** END DOM SETUP ***/

/**********************/
/***** P5 RUNTIME *****/
/**********************/
//data containers
let baseImageData;
let baseImage;
let sampleBlocks = [];
let blackoutBlocks = [];
let pg; //p5 graphics buffer
let glitchShader;
//render parameters
const NUM_STRIPS = 8;
const NUM_HIGH_RES_FRAGMENTS = 15;
const NUM_LOW_RES_FRAGMENTS = 15;
const NUM_BLACKOUTS = 16;
const BLACKOUT_COLOR = "#0a0a0a"
const ASPECT_RATIO = 1.78;

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
  baseImage = new BaseImage(baseImageData, 0.9);
  generateSamples();
  generateBlackouts();
}

function windowResized() {
  //shader config
  if (isRetinaDisplay()) pixelDensity(1);
  //resize canvas
  const w = document.getElementById("canvas-bg").clientWidth;
  const h = w * ASPECT_RATIO;
  resizeCanvas(w, h);
  //resize p5 graphics
  baseImage.resize()
  sampleBlocks.forEach(block => block.resize());
  blackoutBlocks.forEach(block => block.resize());
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
  glitchShader.setUniform("iTime", frameCount * 0.0000001);
  glitchShader.setUniform("iChannel0", pg);
  //render p5 graphics (into graphics buffer)
  baseImage.render()
  blackoutBlocks.forEach(block => block.render());
  sampleBlocks.forEach(block => block.render());
  if (noise(frameCount) < 0.25) glitchOut();
  //render shader onto a canvas-wide rectangle
  rect(0, 0, width, height);
}

function mouseMoved() {
  if (random() < 0.85) glitchOut();
}
/*** END P5 RUNTIME ***/

/**************************/
/***** HELPER METHODS *****/
/**************************/
function generateSamples() {
  for (let i = 0; i < NUM_STRIPS; i++) {
    const strip = new GlitchStrip({
      sampleImage: baseImageData,
      sampleArea: new Area(1, 0.01).init(),
      renderArea: new Area(0.65).init(),
      minSizeRatio: 0.04 * 1.5, //0.04
      maxSizeRatio: 0.017 * 1.5 //0.017
    }).init();
    sampleBlocks.push(strip);
  }

  for (let i = 0; i < NUM_HIGH_RES_FRAGMENTS; i++) {
    const fragment = new GlitchFragment({
      sampleImage: baseImageData,
      sampleArea: new Area(1, 0.1).init(),
      renderArea: new Area(0.65).init(),
      minSizeRatio: 0.09 * 1.5,
      maxSizeRatio: 0.16 * 1.5,
      minSampleRatio: 0.2,
      maxSampleRatio: 0.25
    }).init();
    sampleBlocks.push(fragment);
  }

  for (let i = 0; i < NUM_LOW_RES_FRAGMENTS; i++) {
    const fragment = new GlitchFragment({
      sampleImage: baseImageData,
      sampleArea: new Area(1, 0.4).init(),
      renderArea: new Area(0.65).init(),
      minSizeRatio: 0.04 * 1.5,
      maxSizeRatio: 0.07 * 1.5,
      minSampleRatio: 0.1,
      maxSampleRatio: 0.15
    }).init();
    sampleBlocks.push(fragment);
  }
  shuffle(sampleBlocks)
}

function generateBlackouts() {
  for (let i = 0; i < NUM_BLACKOUTS; i++) {
    const fragment = new GlitchBlock({
      renderArea: new Area(0.75, 0.55).init(),
      minSizeRatio: 0.1,
      maxSizeRatio: 0.24
    }).init();
    blackoutBlocks.push(fragment);
  }
}

function glitchOut() {
  sampleBlocks.forEach(block => { if (random() < 0.3) block.glitchOut() })
  blackoutBlocks.forEach(block => { if (random() < 0.5) block.init() })
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function isRetinaDisplay() {
  if (window.matchMedia) {
    var mq = window.matchMedia("only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
    return (mq && mq.matches || (window.devicePixelRatio > 1));
  }
}
/*** END HELPER METHODS ***/

/***************/
/*** CLASSES ***/
/***************/
class Area {
  constructor(outerLimit, innerLimit) {
    this.baseW = pg.width;
    this.baseH = pg.height;
    this.outerLimit = outerLimit;
    this.innerLimit = innerLimit;
    this.areas;
  }

  init() {
    this.setAreas();
    return this;
  }

  resize() {
    this.setAreas()
  }

  setAreas() {
    if (!this.innerLimit) {
      const [x, y, w, h] = this.getScaledRect(this.outerLimit)
      this.areas = [
        { xmin: x, xmax: x + w, ymin: y, ymax: y + h }
      ]
    } else {
      //facilitate a frame-like selection area
      const [x1, y1, w1, h1] = this.getScaledRect(this.outerLimit)
      const [x2, y2, w2, h2] = this.getScaledRect(this.innerLimit)
      this.areas = [
        { xmin: x1, xmax: x2, ymin: y1, ymax: y1 + h1 },
        { xmin: x2 + w2, xmax: x1 + w1, ymin: y1, ymax: y1 + h1 },
        { xmin: x2, xmax: x2 + w2, ymin: y1, ymax: y2 },
        { xmin: x2, xmax: x2 + w2, ymin: y1 + h1, ymax: y2 + h2 }
      ]
    }
  }

  getRandomPoint() {
    const range = this.areas.length > 1 ?
      this.areas[floor(random(this.areas.length))] :
      this.areas[0]
    const x = floor(random(range.xmin, range.xmax))
    const y = floor(random(range.ymin, range.ymax))
    return createVector(x, y)
  }

  getScaledRect(scale) {
    const margin = (1 - scale) / 2; //horizontal margin
    const w = this.baseW * scale;
    const h = w * 1.78; //16:9 aspect ratio -- 0.5625 for horizontal image
    const x = this.baseW * margin;
    const y = (this.baseH - h) / 2;
    return [x, y, w, h]
  }
}

class GlitchBlock {
  constructor({
    renderArea,
    minSizeRatio,
    maxSizeRatio,
  }) {
    /*** operational properies ***/
    this.renderArea = renderArea;
    this.minSizeRatio = minSizeRatio;
    this.maxSizeRatio = maxSizeRatio;
    this.minSize = width * minSizeRatio;
    this.maxSize = width * maxSizeRatio;
    /*** render properties ***/
    this.size;
    this.position;
    this.originalPos;
  }

  init() {
    this.position = this.generateRenderPosition()
    this.size = this.generateRenderSize()
    return this;
  }

  generateRenderPosition() {
    return this.renderArea.getRandomPoint()
  }

  generateRenderSize() {
    return {
      w: this.getRandomSize(),
      h: this.getRandomSize()
    }
  }

  getRandomSize() {
    return floor(random(this.minSize, this.maxSize))
  }

  render() {
    const { x, y } = this.position;
    const { w, h } = this.size;
    pg.push()
    pg.fill(BLACKOUT_COLOR)
    pg.noStroke()
    pg.rect(x, y, w, h)
    pg.pop()
  }

  resize() {
    this.renderArea.resize()
    let newMinSize = width * this.minSizeRatio
    let newMaxSize = width * this.maxSizeRatio
    this.minSize = newMinSize;
    this.maxSize = newMaxSize;
    this.init()
  }

  snapBack() {
    this.position = this.originalPos;
  }
}

class GlitchSample extends GlitchBlock {
  constructor(config) {
    super(config)
    this.sampleImage = config.sampleImage;
    this.sampleArea = config.sampleArea;
    this.sample;
  }

  init() {
    this.sample = this.generateSample()
    let pos = this.generateRenderPosition()
    this.position = pos;
    this.originalPos = pos;
    this.size = this.generateRenderSize()
    return this;
  }

  generateSample() {
    const { x, y } = this.generateSamplePosition();
    const { w, h } = this.generateSampleSize();
    this.sampledAreaTester = [x, y, w, h]
    return this.sampleImage.get(x, y, w, h);
  }

  generateSamplePosition() {
    return this.sampleArea.getRandomPoint()
  }

  generateSampleSize() {
    return {
      w: this.getRandomSize(),
      h: this.getRandomSize() * ASPECT_RATIO
    }
  }

  glitchOut() {
    let minOffset = 15;
    let maxOffset = 45;
    let x = this.originalPos.x + random(minOffset, maxOffset) * floor(random(-1, 2))
    let y = this.originalPos.y + random(minOffset, maxOffset) * floor(random(-1, 2))
    this.position = createVector(x, y)
    if (random() < 0.4) this.sample = this.generateSample()
  }

  render() {
    const { x, y } = this.position;
    const { w, h } = this.size;
    pg.push()
    pg.noSmooth()
    pg.image(this.sample, x - width / 2, y - height / 2, w, h)
    pg.pop()
  }
}

class GlitchStrip extends GlitchSample {
  constructor(config) {
    super(config)
  }

  generateSampleSize() {
    const stripDir = random() > 0.5 ?
      "horizontal" :
      "vertical"
    if (stripDir === "horizontal") {
      return {
        w: floor(random(5, 10)),
        h: this.getRandomSize()
      }
    } else {
      return {
        w: this.getRandomSize(),
        h: floor(random(5, 10))
      }
    }
  }

  generateRenderSize() {
    const sw = this.sample.width;
    const sh = this.sample.height;
    return {
      w: sw > sh ? sw : this.getRandomSize(),
      h: sh > sw ? sh : this.getRandomSize()
    }
  }
}

class GlitchFragment extends GlitchSample {
  constructor(config) {
    super(config)
    this.minSampleRatio = config.minSampleRatio
    this.maxSampleRatio = config.maxSampleRatio
    this.minSampleSize = width * config.minSampleRatio;
    this.maxSampleSize = width * config.maxSampleRatio;
  }

  generateSampleSize() {
    return {
      w: floor(random(this.minSampleSize, this.maxSampleSize)),
      h: floor(random(this.minSampleSize, this.maxSampleSize)) * 1.78
    }
  }
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
    this.w = width * this.scale;
    this.h = width * ASPECT_RATIO * this.scale;
  }
}
/*** END CLASSES ***/
/*** DOM SETUP ***/
const canvasBG = document.createElement("div")
canvasBG.id = "canvas-bg"
canvasBG.style.width = "100%"
canvasBG.style.height = "100%"
canvasBG.style.position = "absolute"
canvasBG.style.top = "0"
canvasBG.style.left = "0"
canvasBG.style.transform = "rotateX(180deg)"
document.body.appendChild(canvasBG)

/*** P5 RUNTIME ***/
let mainPG, img1, img2, bgImage1, bgImage2, glitchShader

function preload() {
  img1 = loadImage("./img-events-1.png")
  img2 = loadImage("./img-events-2.png")
  glitchShader = loadShader("./glitch.vert", "./glitch.frag")
}

function setup() {
  pixelDensity(1)
  const {clientWidth: w, clientHeight: h} = document.body;
  createCanvas(w, h, WEBGL).parent("canvas-bg")
  mainPG = createGraphics(w, h)
  bgImage1 = new BGImage({
    img: img1,
    xpos: "left",
    ypos: "top",
    ratio: 0.62,
    minWidth: 400,
    maxWidth: 900
  })

  bgImage2 = new BGImage({
    img: img2,
    xpos: "right",
    ypos: "bottom",
    ymargin: 80,
    ratio: 0.635,
    minWidth: 400,
    maxWidth: 950
  })
}

function windowResized() {
  const {clientWidth: w, clientHeight: h} = document.body;
  resizeCanvas(w, h)
  mainPG = createGraphics(w, h)
}

function draw() {
  mainPG.clear()
  clear()
  shader(glitchShader)
  glitchShader.setUniform("iResolution", [width, height]);
  glitchShader.setUniform("iFrame", frameCount);
  glitchShader.setUniform("iMouse", [mouseX, mouseY]);
  glitchShader.setUniform("iTime", frameCount * 0.00000001);
  glitchShader.setUniform("iChannel0", mainPG);
  bgImage1.render()
  bgImage2.render()
  rect(0, 0, width, height)
}

class BGImage {
  constructor({
    img,
    shader,
    xpos = "left",
    ypos = "top",
    xmargin = 0,
    ymargin = 0,
    ratio = 1,
    minWidth = 400,
    maxWidth = 800
  }) {
    this.image = img
    this.shader = shader
    this.xpos = xpos
    this.ypos = ypos
    this.xmargin = xmargin
    this.ymargin = ymargin
    this.minWidth = minWidth
    this.maxWidth = maxWidth
    this.ratio = ratio
  }

  render() {
    //calculate render proportions
    const w = width * this.ratio;
    const rw = w < this.minWidth ? this.minWidth : w > this.maxWidth ? this.maxWidth : w
    const rh = rw * (this.image.height / this.image.width);
    const x = this.xpos === "left" ? 0 + this.xmargin :
      this.xpos === "right" ? width - rw - this.xmargin :
        width / 2
    const y = this.ypos === "top" ? 0 + this.ymargin :
      this.ypos === "bottom" ? height - rh - this.ymargin :
        width / 2
    //render the image in graphics buffer
    mainPG.image(this.image, x, y, rw, rh)
  }
}
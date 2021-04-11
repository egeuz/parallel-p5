### Implementation Notes - Main Sketch
Should be pretty straightforward-- download the contents of the main-sketch folder into the project & add a script tag like this into the HTML file where the sketch will be placed:

```
<script src="./main-sketch/p5.min.js">
<script
  src="./main-sketch/sketch.js"
  container-id=[INSERT ID OF CONTAINER ELEMENT HERE]
>
</script>
```
See demo.html for uh, a demo.
The sketch will be placed into the HTML element specified in `container-id` and set up to be a absolute-positioned background element.
It will also give the container element position:relative, so heads up!

Based on the file system you're working on URLs may need to change in sketch.js. All external URLs are done in the `preload()` function (lines 45-48)

Will add implementation notes for other sketches as they come in.

For questions, contact me! Toodles!

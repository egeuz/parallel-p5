### Implementation Notes - Main Sketch
Should be pretty straightforward-- download the main-sketch folder and add a script tag like this into the HTML file where the sketch will be shown:

```
<script src="./main-sketch/p5.min.js">
<script
  src="./main-sketch/sketch.js"
  container-id=[INSERT ID OF CONTAINER ELEMENT HERE]
>
</script>
```

the `container-id` custom attribute will place the sketch into the HTML element specified, and set it up as a absolutely positioned background element 
(it will also give the container element position:relative so heads up)


Will add implementation notes for other sketches as they come in.

For questions, contact me! Toodles!
'use strict'

const SEED_CONST = 10000
const BACKGROUND = '#2c3e50' // inline styled for now
const FOREGROUND = '#bdc3c7'

document.querySelector('.seed-input').value = Math.ceil(Math.random() * 1000)
let unit = 10
let seed
let start_seed

let timeoutId
let checkKeyPress = function(e) {
  // Run main if user presses enter
  if (e.keyCode == 13)
    main()
  else {
    // Set a timeout to call main after a second
    clearTimeout(timeoutId)
    timeoutId = setTimeout(main, 1000)
  }
}

// http://stackoverflow.com/a/19303725/4018167
let random = function() {
  let x = Math.sin(seed++) * SEED_CONST
  return x - Math.floor(x)
}

// helpers

let range = function(x, y) {
  let lower = Math.min(x, y)
  let upper = Math.max(y, x)
  let arr = []
  while(lower <= upper) {
    arr.push(lower++)
  }
  return arr
}

let sample = function(arr) {
  return arr[Math.floor(random() * arr.length)]
}

let calc_position = function(point, distance, angle, round=true) {
  let x = Math.cos(angle * Math.PI / 180) * distance + point.x
  let y = Math.sin(angle * Math.PI / 180) * distance + point.y

  if (round) {
    x = Math.round(x)
    y = Math.round(y)
  }

  return new Point(x, y)
}

// classes

class Branch {
  constructor(start_point=new Point, parent=null, angle=null) {
    this.length = sample(range(1,10)) * unit
    let valid_angles = [-90, -45, 0, 45, 90].filter(x => {
      if (parent && parent.angle != null) {
        // Each branch should be a new degree from the last
        return Math.abs(x) != Math.abs(parent.angle)
      }
    })

    this.angle = (angle === null ? sample(valid_angles) : angle)
    this.start_point = start_point
    this.end_point = calc_position(start_point, this.length, this.angle)
    this.children = []
    this.parent = parent
  }

  grow(i=1) {
    if (i < 1) { return }
    if (this.children.length === 0) {
      let child = new Branch(this.end_point, this)
      this.children.push(child)
      this.grow(i - 1)
    } else {
      this.children.map(child => child.grow(i))
    }
  }

  draw(ctx) {
    let frames = this.length
    let i = frames
    let current_point = this.start_point

    let intervalID = setInterval(() => {
      let next_point = calc_position(current_point, this.length / frames, this.angle, false)

      ctx.moveTo(current_point.x, current_point.y)
      ctx.lineTo(next_point.x, next_point.y)
      ctx.stroke()

      current_point = next_point
      i--

      if (i < 1) {
        clearInterval(intervalID)
        this.children.map(child => { child.draw(ctx) })
      }
    }, 20)
  }
}

class Point {
  constructor(x=0, y=0) {
    this.x = x
    this.y = y
  }
}

let main = function() {
  if (start_seed == Math.round(document.querySelector('.seed-input').value)) {
    return
  }
  // Set the seed
  seed = Math.round(document.querySelector('.seed-input').value);
  start_seed = seed

  // Get the container and empty it out
  let container = document.querySelector('.canvas-container')
  container.innerHTML = ''

  // Create a new canvas to put in the container
  let canvas = document.createElement('canvas')
  container.appendChild(canvas)

  // Initialize the canvas' styles
  let ctx = canvas.getContext('2d')
  ctx.canvas.width  = window.innerWidth
  ctx.canvas.height = window.innerHeight
  unit = Math.min(ctx.canvas.width, ctx.canvas.height) / 50
  ctx.translate(ctx.canvas.width / 2, ctx.canvas.height - unit)
  ctx.strokeStyle = FOREGROUND
  ctx.fillStyle = FOREGROUND
  ctx.lineWidth = 1

  // Let's have 5 trees for a demo
  ctx.rotate(-90 * Math.PI / 180)
  let trees = [new Branch(new Point, null, 0)]
  for (let i = 1; i < 3; i++) {
    trees.push(new Branch(new Point(0, i * unit), null, 0))
    trees.push(new Branch(new Point(0, -i * unit), null, 0))
  }
  trees.map(tree => {
    tree.grow(1)
    tree.draw(ctx)
  })
}

main()

'use strict'

const SEED_CONST = 10000
const BACKGROUND = '#2c3e50' // inline styled for now
const FOREGROUND = '#bdc3c7'

let seed = Math.ceil(Math.random() * 1000)
let unit = 10

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
  let ctx = document.querySelector('canvas').getContext('2d')
  ctx.translate(ctx.canvas.width / 2, ctx.canvas.height - unit)
  ctx.strokeStyle = FOREGROUND
  ctx.fillStyle = FOREGROUND
  ctx.lineWidth = 1

  // Print seed value
  ctx.textAlign = 'center'
  ctx.fillText(`Seed: ${seed}`, 0, unit)

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

// Based on http://www.pixelbox.com/circuitflora/
'use strict'

const SEED_CONST = 10000

let seed = Math.ceil(Math.random() * 1000);

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

let calc_position = function(point, distance, angle) {
  let x = Math.round(Math.cos(angle * Math.PI / 180) * distance + point.x)
  let y = Math.round(Math.sin(angle * Math.PI / 180) * distance + point.y)
  return new Point(x, y)
}

// classes

class Branch {
  constructor(start_point=new Point, angle=null) {
    angle = (angle === null ? sample([-90, -45, 0, 45, 90]) : angle)
    let length = sample(range(1,10)) * 20

    this.start_point = start_point
    this.end_point = calc_position(start_point, length, angle)
    this.children = []
  }

  grow() {
    if (this.children.length === 0) {
      let child = new Branch(this.end_point)
      this.children.push(child)
    } else {
      this.children.map(child => child.grow())
    }
  }

  draw(ctx) {
    ctx.moveTo(this.start_point.x, this.start_point.y)
    ctx.lineTo(this.end_point.x, this.end_point.y)
    ctx.stroke()
    this.children.map(child => { child.draw(ctx) })
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
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2
  let tree = new Branch(new Point(0, ctx.canvas.height/2), 0)
  tree.grow()
  tree.draw(ctx)
}

main()

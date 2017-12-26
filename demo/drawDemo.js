var j6 = require('j6')

function main () {
  c6.canvas.window = { x: -2, y: -2, width: 4, height: 4 }
  c6.drawCanvas('#chart1', function (ctx, canvas) {
    ctx.fillText('Hello Canvas!', 10, 50)
  })
  c6.drawCanvas('#chart2', function (ctx, canvas) {
    var r = c6.steps(0, 10, 0.3)
    var x = r.sin()
    var y = r.cos()
    c6.drawPath(ctx, x, y)
  })
  c6.drawCanvas('#chart3', function (ctx, canvas) {
    var t = c6.steps(0, 20, 0.1)
    var r = t.div(10)
    var x = t.sin().mul(r)
    var y = t.cos().mul(r)
    c6.drawPath(ctx, x, y)
  })
  c6.drawCanvas('#chart4', function (ctx, canvas) {
    var xy = []
    for (var x = -2; x < 2; x += 0.3) {
      for (var y = -2; y < 2; y += 0.3) {
        xy.push({x: x, y: y, dx: 0.1, dy: 0.2})
      }
    }
    c6.drawField(ctx, xy)
  })
  c6.drawCanvas('#chart5', function (ctx, canvas) {
    var xy = []
    for (var x = -5; x < 5; x += 0.3) {
      for (var y = -5; y < 5; y += 0.3) {
        xy.push({x: x, y: y, dx: 0.3*x, dy: 0.3*(-y)})
      }
    }
    c6.drawField(ctx, xy)
  })
  c6.drawCanvas('#chart6', function (ctx, canvas) {
    var xy = []
    for (var x = -5; x < 5; x += 0.3) {
      for (var y = -5; y < 5; y += 0.3) {
        xy.push({x: x, y: y, dx: j6.random(-0.5, 0.5), dy: j6.random(-0.5, 0.5)})
      }
    }
    c6.drawField(ctx, xy)
  })
  c6.view()
}

main()

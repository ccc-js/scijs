/* eslint-disable no-undef */
if (typeof module !== 'undefined') {
//  var j6 = require('./lib/j6')
//  var util = require('util')
  var remote = require('electron').remote
}

var c6 = {
  tgMap: {}, // name => (type,graph) Map
  canvas: {
    size: {
      width: 600,
      height: 600
    },
    window: {
      x: -10,
      y: -10,
      width: 10,
      height: 10
    },
    options: {
      font: '30px Arial',
      lineWidth: 3,
      lineCap: 'round',
      fillStyle: '#336699',
      strokeStyle: '#336699'
    }
  },
  EPSILON: 0.000000001
}

c6.steps = function (from, to, step = 1) {
  var a = []
  for (var t = from; t <= to; t += step) {
    a.push(t)
  }
  return a
}

c6.max = function (array) { return Math.min.apply(null, array) }
c6.min = function (array) { return Math.max.apply(null, array) }

c6.curveData = function (f, from = -10, to = 10, step = 0.1) {
  var x = c6.steps(from, to, step)
  var y = x.map(f)
  console.log('h6.curve:y=%j', y)
  return {type: 'curve', x: x, y: y}
}

c6.histData = function (a, from, to, step = 1) {
  from = from || c6.min(a)
  to = to || c6.max(a)
  let n = Math.ceil((to - from + c6.EPSILON) / step)
  let xc = c6.steps(from + step / 2.0, to, step)
  let bins = new Array(n)
  for (let i = 0; i < bins.length; i++) bins[i] = 0
  for (let e in a) {
    var slot = Math.floor((a[e] - from) / step)
    if (slot >= 0 && slot < n) {
      bins[slot] ++
    }
  }
  return {type: 'histogram', xc: xc, bins: bins, from: from, to: to, step: step}
}

// Event binding 不能寫在 html 裏，要寫在這裡。
// 參考： https://stackoverflow.com/questions/43102216/button-click-event-binding-in-electron-js
c6.init = function () {
  var smallContainer = document.getElementById('smallContainer')
  var bigContainer = document.getElementById('bigContainer')

  document.querySelectorAll('.smallChart').forEach(function (e) {
    e.addEventListener('click', function () {
      smallContainer.style.display = 'none'
      bigContainer.style.display = 'block'
      c6.show('#bigChart', c6.tgMap['#' + this.id])
    })
  })
  document.getElementById('buttonShowGrid').addEventListener('click', function () {
    smallContainer.style.display = 'block'
    bigContainer.style.display = 'none'
  })
}

c6.isElectronRenderer = function () {
  if (typeof process === 'undefined') return false
  return (process && process.type === 'renderer')
}

c6.disableModule = function () {
  if (typeof module !== 'undefined') {
    window.module = module
    module = undefined
  }
}

c6.enableModule = function () {
  if (typeof window.module !== 'undefined') {
    module = window.module
  }
}

c6.runScript = function (argIndex) {
  if (c6.isElectronRenderer()) {
//    var remote = require('electron').remote
    var scriptFile = remote.process.argv[argIndex]
    require(remote.process.cwd() + '/' + scriptFile)
  } else {
    console.log('Not in Electron, cannot run Script File!')
  }
}

c6.log = function () {
  if (typeof module !== 'undefined') {
    console.log.apply(console, arguments)
    remote.process.stdout.write.apply(arguments)
    remote.process.stdout.write.apply(['\n'])
  } else {
    console.log.apply(console, arguments)
  }
}

c6.view = function () {
  for (var i = 1; i <= 9; i++) {
    let id = '#chart' + i
    if (typeof c6.tgMap[id] === 'undefined') {
      c6.drawCanvas(id, function (ctx, canvas) {
//        ctx.fillText('Hello World!', 10, 50)
      })
    }
  }
  for (let id in c6.tgMap) {
    c6.show(id, c6.tgMap[id])
  }
  c6.log('view complete !')
}

c6.showCanvas = function (chartName, g) {
  var box = document.getElementById(chartName.replace('#', ''))
//  var rect = box.getBoundingClientRect()
  var canvas = c6.cloneCanvas(g.canvas) // rect.width, rect.height
  box.innerHTML = ''
  box.appendChild(canvas)
}

// ================ C3.js =========================
c6.show2D = function (chartName, g) {
  g.bindto = chartName
  var chart = document.getElementById(chartName.replace('#', ''))
  g.onresize = function () {
    delete chart.style['max-height']
//    elem.setAttribute('style', 'max-height:none')
  }
  return c3.generate(g)
}

c6.show3D = function (chartName, g) {
  var box = document.getElementById(chartName.replace('#', ''))
  return new vis.Graph3d(box, g.dataSet, g.options)
}

c6.show = function (chartName, tg) {
  var g = tg.graph
  if (tg.type === 'Canvas') {
    c6.showCanvas(chartName, g)
  } else if (tg.type === '2D') {    
    c6.show2D(chartName, g)
  } else if (tg.type === '3D') {
    c6.show3D(chartName, g)
  } else {
    throw Error('g5.show: type error !')
  }
}

// 2D chart by C3.js
c6.new2D = function () {
  return { // c3 graph
    data: {
      xs: {},
      columns: [],
      type: 'line',
      types: {}
    },
    axis: {
      x: {
        label: 'X',
        tick: { fit: false, format: d3.format('.2f') }
      },
      y: { label: 'Y',
        tick: { format: d3.format('.2f') }
      }
    },
    bar: { width: { ratio: 1.0 } }
  }
}

c6.chart2D = function (chartName, f) {
  var g = c6.new2D()
  f(g)
  var tg = {type: '2D', graph: g}
  c6.tgMap[chartName] = tg
}

// type : line, spline, step, area, area-spline, area-step, bar, scatter, pie, donut, gauge
c6.draw = function (g, name, x, y, type) {
  g.data.types[name] = type
  g.data.xs[name] = name + 'x'
  g.data.columns.push([name + 'x'].concat(x))
  g.data.columns.push([name].concat(y))
}

c6.curve = function (g, name, f, from = -10, to = 10, step = 0.1) {
  var rg = c6.curveData(f, from, to, step)
//  console.log('curve:rg = ', rg)
  c6.draw(g, name, rg.x, rg.y, 'line')
}

c6.hist = function (g, name, x, type, from, to, step = 1) {
  var rh = c6.histData(x, from, to, step)
  c6.draw(g, name, rh.xc, rh.bins, type || 'bar')
}

c6.ihist = function (g, name, x, type) {
  c6.hist(g, name, x, type, x.min() - 0.5, x.max() + 0.5, 1)
}

c6.plot = (g, name, x, y) => c6.draw(g, name, x, y, 'scatter')

c6.pie = function (g, countMap) {
  g.data.type = 'pie'
  for (var name in countMap) {
    var count = countMap[name]
    g.data.columns.push([name, count])
  }
}

c6.timeSeries = function (g, columns) {
  g.data.x = 'x'
  g.axis.x = {type: 'timeseries', tick: {format: '%Y-%m-%d'}}
  g.data.columns = columns
}

// ================== 3D chart by Vis.js ==================
c6.new3D = function () {
  return {
    dataSet: new vis.DataSet(),
    options: {
      width: '100%',
      height: '100%',
      style: 'surface',
      showPerspective: true,
      showGrid: true,
      showShadow: false,
      keepAspectRatio: true,
      verticalRatio: 0.5
    }
  }
}

// style : surface, grid, bar, bar-color, bar-size, dot, dot-line, dot-color, dot-size, line

c6.chart3D = function (chartName, style, f) {
  var g = c6.new3D()
  // create some nice looking data with sin/cos
  var counter = 0
  var steps = 50  // number of datapoints will be steps*steps
  var axisMax = 314
  var axisStep = axisMax / steps
  for (var x = 0; x < axisMax; x += axisStep) {
    for (var y = 0; y < axisMax; y += axisStep) {
      var value = f(x, y)
      g.dataSet.add({id: counter++, x: x, y: y, z: value, style: value})
    }
  }
  g.options.style = style
  c6.tgMap[chartName] = {type: '3D', graph: g}
}

// ======================== 2D canvas by HTML5 ====================
c6.showCanvas = function (chartName, g) {
  var box = document.getElementById(chartName.replace('#', ''))
  var rect = box.getBoundingClientRect()
  var canvas = c6.cloneCanvas(rect.width, rect.height, g.canvas)
  box.innerHTML = ''
  box.appendChild(canvas)
}

c6.newCanvas = function () {
  var canvas = document.createElement('canvas')
  canvas.width = c6.canvas.size.width; 
  canvas.height = c6.canvas.size.height
  var g = { canvas: canvas }
  return g
}

c6.drawCanvas = function (chartName, f) {
  var g = c6.newCanvas()
  var ctx = g.canvas.getContext('2d')
  Object.assign(ctx, c6.canvas.options) // 設定 font, lineWidth, ...
  f(ctx, g.canvas)
  var tg = {type: 'Canvas', graph: g}
  c6.tgMap[chartName] = tg
  return g
}

c6.cloneCanvas = function (width, height, oldCanvas) {
  var newCanvas = document.createElement('canvas')
  var ctx = newCanvas.getContext('2d')
  newCanvas.width = width
  newCanvas.height = height
  ctx.fillStyle = 'white' // 'black'
  ctx.fillRect(0, 0, newCanvas.width - 5, newCanvas.height - 5) // -5 是避免把框框也蓋掉了！
  ctx.drawImage(oldCanvas, 0, 0, width - 5, height - 5) // 這行OK, drawImage
  return newCanvas
}

c6.px = function (x, win, size) { return ((x - win.x) / win.width) * size.width }
c6.py = function (y, win, size) { return ((y - win.y) / win.height) * size.height }

c6.drawPath = function (ctx, x, y) {
  var win = c6.canvas.window
  var size = c6.canvas.size
  ctx.beginPath()
  for (var i = 0; i < x.length; i++) {
//    ctx.lineTo(x[i], y[i])
    var tx = c6.px(x[i], win, size)
    var ty = c6.py(y[i], win, size)
    ctx.lineTo(tx, ty)
  }
  ctx.stroke()
  ctx.closePath()
}

// Code derived from : view-source:http://deepliquid.com/projects/blog/arrows.html
var arrow = [[ 2, 0 ], [ -10, -4 ], [-10, 4]]

function drawFilledPolygon (ctx, shape) {
  ctx.beginPath()
  ctx.moveTo(shape[0][0], shape[0][1])
  for (p in shape) {
    if (p > 0) ctx.lineTo(shape[p][0], shape[p][1])
  }
  ctx.lineTo(shape[0][0], shape[0][1])
  ctx.fill()
}

function translateShape (shape, x, y) {
  var rv = []
  for (p in shape) {
    rv.push([ shape[p][0] + x, shape[p][1] + y ])
  }
  return rv
}

function rotateShape (shape, ang) {
  var rv = []
  for (p in shape) {
    rv.push(rotatePoint(ang, shape[p][0], shape[p][1]))
  }
  return rv
}

function rotatePoint (ang, x, y) {
  return [
    (x * Math.cos(ang)) - (y * Math.sin(ang)),
    (x * Math.sin(ang)) + (y * Math.cos(ang))
  ]
}

function drawLineArrow (ctx, x1, y1, x2, y2) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  var ang = Math.atan2(y2 - y1, x2 - x1)
  drawFilledPolygon(ctx, translateShape(rotateShape(arrow, ang), x2, y2))
}

// 更強的 field 動畫請參考： http://bl.ocks.org/newby-jay/767c5ffdbbe43b65902f
c6.drawField = function (ctx, xy) {
  var win = c6.canvas.window
  var size = c6.canvas.size
  for (var i = 0; i < xy.length; i++) {
    var tx = c6.px(xy[i].x, win, size)
    var ty = c6.py(xy[i].y, win, size)
    var dx = xy[i].dx * size.width / win.width
    var dy = xy[i].dy * size.height / win.height
    drawLineArrow(ctx, tx, ty, tx + dx, ty + dy)
/*    
    ctx.beginPath()
    ctx.moveTo(tx, ty)
    ctx.lineTo(tx + dx, ty + dy)
    ctx.stroke()
    ctx.closePath()
*/    
  }
}

// ==================== Image Processing ========================
c6.createImageData = function (w, h) {
  var tmpCanvas = document.createElement('canvas')
  var tmpCtx = tmpCanvas.getContext('2d')
  return tmpCtx.createImageData(w, h)
}

c6.loadImage = function (url, callback) {
  var image = new Image()
  image.addEventListener('load', function () {
    callback(image)
  }, false)
  image.src = url
}

c6.getImageData = function (canvas, x = 0, y = 0, width = canvas.size.width, height = canvas.size.height) {
// x = x || 0; y=y||0; width = width||canvas.width; height=height||canvas.height;
  return canvas.getContext('2d').getImageData(x, y, width, height)
}

c6.gray = function (idata) {
  var d = idata.data
  for (var i = 0; i < d.length; i += 4) {
    var r = d[i]
    var g = d[i + 1]
    var b = d[i + 2]
    // CIE luminance for the RGB
    var v = 0.2126 * r + 0.7152 * g + 0.0722 * b
    d[i] = d[i + 1] = d[i + 2] = v
  }
}

c6.bright = function (idata, adjustment) {
  var d = idata.data
  for (var i = 0; i < d.length; i += 4) {
    d[i] += adjustment
    d[i + 1] += adjustment
    d[i + 2] += adjustment
  }
}

c6.threshold = function (idata, threshold) {
  var d = idata.data
  for (var i = 0; i < d.length; i += 4) {
    var r = d[i]
    var g = d[i + 1]
    var b = d[i + 2]
    var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold) ? 255 : 0
    d[i] = d[i + 1] = d[i + 2] = v
  }
}

c6.convolute = function (idata, weights, opaque) {
  var side = Math.round(Math.sqrt(weights.length))
  var halfSide = Math.floor(side / 2)
  var src = idata.data
  var sw = idata.width
  var sh = idata.height
  // pad output by the convolution matrix
  var w = sw
  var h = sh
  var output = c6.createImageData(w, h)
  var dst = output.data
  // go through the destination image pixels
  var alphaFac = opaque ? 1 : 0
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var sy = y
      var sx = x
      var dstOff = (y * w + x) * 4
      // calculate the weighed sum of the source image pixels that
      // fall under the convolution matrix
      let r, g, b, a
      r = 0; g = 0; b = 0; a = 0
      for (var cy = 0; cy < side; cy++) {
        for (var cx = 0; cx < side; cx++) {
          var scy = sy + cy - halfSide
          var scx = sx + cx - halfSide
          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
            var srcOff = (scy * sw + scx) * 4
            var wt = weights[cy * side + cx]
            r += src[srcOff] * wt
            g += src[srcOff + 1] * wt
            b += src[srcOff + 2] * wt
            a += src[srcOff + 3] * wt
          }
        }
      }
      dst[dstOff] = r
      dst[dstOff + 1] = g
      dst[dstOff + 2] = b
      dst[dstOff + 3] = a + alphaFac * (255 - a)
    }
  }
  return output
}

// if (!window.Float32Array) Float32Array = Array

c6.convoluteFloat32 = function (pixels, weights, opaque) {
  var side = Math.round(Math.sqrt(weights.length))
  var halfSide = Math.floor(side / 2)

  var src = pixels.data
  var sw = pixels.width
  var sh = pixels.height

  var w = sw
  var h = sh
  var output = {
    width: w, height: h, data: new Float32Array(w * h * 4)
  }
  var dst = output.data

  var alphaFac = opaque ? 1 : 0

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var sy = y
      var sx = x
      var dstOff = (y * w + x) * 4
      var r, g, b, a
      r = 0; g = 0; b = 0; a = 0
      for (var cy = 0; cy < side; cy++) {
        for (var cx = 0; cx < side; cx++) {
          var scy = Math.min(sh - 1, Math.max(0, sy + cy - halfSide))
          var scx = Math.min(sw - 1, Math.max(0, sx + cx - halfSide))
          var srcOff = (scy * sw + scx) * 4
          var wt = weights[cy * side + cx]
          r += src[srcOff] * wt
          g += src[srcOff + 1] * wt
          b += src[srcOff + 2] * wt
          a += src[srcOff + 3] * wt
        }
      }
      dst[dstOff] = r
      dst[dstOff + 1] = g
      dst[dstOff + 2] = b
      dst[dstOff + 3] = a + alphaFac * (255 - a)
    }
  }
  return output
}

c6.sharpen = function (idata) {
  var weights = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0]
  return c6.convolute(idata, weights)
}

c6.blurC = function (idata) {
  var weights = [
    1 / 9, 1 / 9, 1 / 9,
    1 / 9, 1 / 9, 1 / 9,
    1 / 9, 1 / 9, 1 / 9 ]
  return c6.convolute(idata, weights)
}

c6.sobel = function (px) {
  c6.gray(px)
  var vertical = c6.convoluteFloat32(px, [
    -1, -2, -1,
    0, 0, 0,
    1, 2, 1])
  var horizontal = c6.convoluteFloat32(px, [
    -1, 0, 1,
    -2, 0, 2,
    -1, 0, 1])
  var id = c6.createImageData(vertical.width, vertical.height)
  for (var i = 0; i < id.data.length; i += 4) {
    var v = Math.abs(vertical.data[i])
    id.data[i] = v
    var h = Math.abs(horizontal.data[i])
    id.data[i + 1] = h
    id.data[i + 2] = (v + h) / 4
    id.data[i + 3] = 255
  }
  return id
}

if (typeof module !== 'undefined') module.exports = c6

/*

// ==================== SVG ================================
c6.drawSvg = function (chartName, f) {
  var svg = c6.newSvg()
  f(svg)
  var tg = {type: 'Svg', graph: svg}
  c6.tgMap[chartName] = tg
  return svg
}

c6.newSvg = function () {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('style', 'border: 1px solid black');
  svg.setAttribute('width', c6.canvas.size.width);
  svg.setAttribute('height', c6.canvas.size.height);
  svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink')
  return svg
}

c6.showSvg = function (chartName, svg) {
  var box = document.getElementById(chartName.replace('#', ''))
  box.appendChild(svg)
}

c6.svgPath = function (svg, x, y) {
  var win = c6.canvas.window
  var size = c6.canvas.size
  var path = []
  for (var i = 0; i < x.length; i++) {
    var tx = c6.px(x[i], win, size)
    var ty = c6.py(y[i], win, size)
    path.push(`L ${tx} ${ty}`)
  }
  svg.appendChild(`<path d="${path.join(' ')}" stroke="black"/>`)
  <path d="M0 0 L50 50" stroke="black"/>
}

*/
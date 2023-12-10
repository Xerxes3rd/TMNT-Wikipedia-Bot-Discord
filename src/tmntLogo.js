const PImage = require( 'pureimage' )
const MemoryStream = require( 'memorystream' )
const RSCanvas = require( '@napi-rs/canvas' )
const { join } = require( 'path' )
const { splitStringForTMNT } = require( './tmntWords.js' )

function deg2rad( degrees ) {
  const pi = Math.PI
  return degrees * ( pi / 180 )
}

function getLetterAscent( textMetrics ) {
  if ( textMetrics.actualBoundingBoxAscent !== undefined ) {
    return textMetrics.actualBoundingBoxAscent
  } else if ( textMetrics.emHeightAscent !== undefined ) {
    return textMetrics.emHeightAscent
  } else {
    return 0
  }
}

function getLetterDescent( textMetrics ) {
  if ( textMetrics.actualBoundingBoxDescent !== undefined ) {
    return textMetrics.actualBoundingBoxDescent
  } else if ( textMetrics.emHeightDescent !== undefined ) {
    return -textMetrics.emHeightDescent
  } else {
    return 0
  }
}

function getLetterHeight( textMetrics ) {
  return getLetterAscent( textMetrics ) + getLetterDescent( textMetrics )
}

function drawAngledBox( ctx, startX, startY, width, height, borderWidth, color ) {
  // red box(es)
  const boxAngle = 50
  const boxX = startX - borderWidth
  const boxY = startY - height - borderWidth
  const boxWidth = width + borderWidth * 2
  const boxHeight = height + borderWidth * 2

  for ( let i = 0; i <= 1; i++ ) {
    const angle = i > 0 ? -boxAngle : boxAngle
    ctx.save()
    ctx.fillStyle = color
    ctx.translate( boxX + boxWidth, boxY + boxHeight )
    ctx.rotate( deg2rad( 180 ) )
    ctx.transform( 1, 0, angle / 100, 1, 0, 0 )
    ctx.fillRect( 0, 0, boxWidth, boxHeight )
    ctx.restore()
  }
}

function drawTeenageMutantNinja( ctx, canvasWidth, canvasHeight, teenageMutantNinja, teenageMutantNinjaFontName ) {
  const fontSize = Math.floor( canvasWidth * 0.04 )
  ctx.font = `${fontSize}px ${teenageMutantNinjaFontName}`
  const textMetrics = ctx.measureText( teenageMutantNinja )
  const letters = teenageMutantNinja.split( '' )

  const kearning = 0
  const letterHeight = getLetterHeight( textMetrics )
  const letterDescent = getLetterDescent( textMetrics )
  const startX = canvasWidth / 2 - textMetrics.width / 2
  const startY = canvasHeight / 2.5
  const startAngle = 45
  const endAngle = -45

  // red box(es)
  const borderWidth = fontSize * 0.2
  const outlineWidth = 1
  drawAngledBox( ctx, startX + borderWidth - outlineWidth, startY, textMetrics.width, letterHeight, borderWidth + outlineWidth, 'black' )
  drawAngledBox( ctx, startX + borderWidth - outlineWidth, startY, textMetrics.width, letterHeight, borderWidth, 'red' )

  let currentX = startX
  for ( let i = 0; i < letters.length; i++ ) {
    const x = currentX
    const y = startY - letterDescent

    const letterMetrics = ctx.measureText( letters[i] )
    const letterWidth = letterMetrics.width

    let angle = 0
    if ( i == letters.length - 1 ) {
      angle = endAngle
    } else {
      angle = startAngle + i * ( endAngle - startAngle ) / letters.length
    }

    if ( letters[i] == ' ' ) {
      angle = 0
    }

    ctx.save()

    ctx.translate( x, y )
    ctx.transform( 1, 0, angle / 100, 1, 0, 0 )
    ctx.fillStyle = 'white'
    ctx.fillText( letters[i], 0, 0 )

    ctx.restore()

    currentX += letterWidth + kearning
  }
}

function drawTurtles( ctx, canvasWidth, canvasHeight, turtles, turtlesFontName ) {
  const fontSize = Math.floor( canvasWidth * 0.15 )
  ctx.font = `${fontSize}px ${turtlesFontName}`
  const textMetrics = ctx.measureText( turtles )
  const letters = turtles.split( '' )

  const kearningFactor = 1
  const letterHeight = getLetterHeight( textMetrics )
  const letterWidth = ( textMetrics.width * kearningFactor ) / letters.length
  const startX = canvasWidth / 2 - ( textMetrics.width * kearningFactor ) / 2 + letterWidth / 2
  const startY = canvasHeight / 2
  const startAngle = 30
  const endAngle = -30

  for ( let i = 0; i < letters.length; i++ ) {
    let angle = 0
    if ( letters.length == 1 ) {
      angle = 0
    } else {
      angle = startAngle + i * ( endAngle - startAngle ) / ( letters.length - 1 )
    }

    const x = startX + ( letterWidth * kearningFactor * i )
    const yOffset = canvasHeight * 0.75 * ( 1 - Math.cos( deg2rad( angle ) ) )
    const y = startY + yOffset

    ctx.save()

    ctx.translate( x, y )
    ctx.rotate( -deg2rad( angle ) )
    ctx.textAlign = 'center'

    ctx.fillStyle = 'black'
    ctx.lineWidth = 2
    ctx.strokeText( letters[i], 0, letterHeight / 2 )

    ctx.fillStyle = '#9CCB40'
    ctx.fillText( letters[i], 0, letterHeight / 2 )

    ctx.restore()

    // console.log( `${i}: ${letters[i]}: ${x},${y} ang:${angle} lw:${letterWidth} yOff:${yOffset}` )
  }
}

async function makeTMNTLogo( str, backgroundColor = 'transparent' ) {
  // note: PureImage has some rending issues, so use Canvas for now
  const usePureImage = false
  const teenageMutantNinjaFontName = 'TeenageMutantNinja'
  const turtlesFontName = 'Turtles'

  const { teenageMutantNinja, turtles } = splitStringForTMNT( str )

  const tmnFontPath = join( __dirname, '.', 'fonts', 'helvetica-bold.ttf' )
  const turtlesFontPath = join( __dirname, '.', 'fonts', 'Turtles.ttf' )

  const canvasWidth = 442
  const canvasHeight = 172

  let canvas
  if ( usePureImage ) {
    const tmnFont = PImage.registerFont( tmnFontPath, teenageMutantNinjaFontName )
    tmnFont.loadSync()
    const turtFont = PImage.registerFont( turtlesFontPath, turtlesFontName )
    turtFont.loadSync()
    canvas = PImage.make( canvasWidth, canvasHeight )
  } else {
    RSCanvas.GlobalFonts.registerFromPath( tmnFontPath, teenageMutantNinjaFontName )
    RSCanvas.GlobalFonts.registerFromPath( turtlesFontPath, turtlesFontName )
    canvas = RSCanvas.createCanvas( canvasWidth, canvasHeight )
  }

  const ctx = canvas.getContext( '2d' )

  if ( backgroundColor !== 'transparent' ) {
    ctx.fillStyle = backgroundColor
    ctx.fillRect( 0, 0, canvas.width, canvas.height )
  }

  drawTeenageMutantNinja( ctx, canvasWidth, canvasHeight, teenageMutantNinja.toUpperCase(), teenageMutantNinjaFontName )
  drawTurtles( ctx, canvasWidth, canvasHeight, turtles, turtlesFontName )

  if ( usePureImage ) {
    const memStream = new MemoryStream()
    await PImage.encodePNGToStream( canvas, memStream )
    return memStream.read()
  } else {
    return canvas.toBuffer( 'image/png' )
  }
}

module.exports = { makeTMNTLogo }
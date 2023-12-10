/* eslint-disable no-undef */
const expect = require( 'chai' ).expect
const { join } = require( 'path' )
const { isTMNT, splitStringForTMNT } = require( '../src/tmntWords.js' )
const { makeTMNTLogo } = require( '../src/tmntLogo.js' )
const { bannedWords, bannedPhrases } = require( '../src/bannedItems.js' )
const fs = require( 'fs' )

describe( 'Text parsing tests', async () => {
  it( 'Should split phrases correctly', async () => {
    expect( splitStringForTMNT( 'Teenage Mutant Ninja Turtles' ) ).to.be.deep.equal( { teenageMutantNinja : 'Teenage Mutant Ninja', turtles : 'Turtles' } )
    expect( splitStringForTMNT( 'one two three four five six one two' ) ).to.be.deep.equal( { teenageMutantNinja : 'one two three four five six', turtles : 'one two' } )
    expect( splitStringForTMNT( 'Scott has made the best Discord bot' ) ).to.be.deep.equal( { teenageMutantNinja : 'Scott has made the best', turtles : 'Discord bot' } )
  } )

  it( 'Should identify all the syllables in phrases', async () => {
    expect( isTMNT( 'Teenage Mutant Ninja Turtles', false, bannedWords, bannedPhrases ).result ).to.be.true
    expect( isTMNT( '[Single Payer Health Insurance]', false, bannedWords, bannedPhrases ).result ).to.be.true
    expect( isTMNT( 'Romeo, Romeo, wherefore art thou, Romeo?', false, bannedWords, bannedPhrases ).result ).to.be.false
    expect( isTMNT( 'Big fire of 2014', false, bannedWords, bannedPhrases ).result ).to.be.true
    expect( isTMNT( 'Big fire of 1923', false, bannedWords, bannedPhrases ).result ).to.be.false
    expect( isTMNT( 'Sitting on the subway station', false, bannedWords, bannedPhrases ).result ).to.be.true
    expect( isTMNT( 'Murder of the subway station', false, bannedWords, bannedPhrases ) ).to.be.deep.equal( { result: false, reason: 'banned phrase' } )
    expect( isTMNT( 'Nazis are the dumbest people', false, bannedWords, bannedPhrases ) ).to.be.deep.equal( { result: false, reason: 'banned word' } )
    expect( isTMNT( 'Billy is a rugby player', false, bannedWords, bannedPhrases ) ).to.be.deep.equal( { result: false, reason: 'banned phrase' } )
    expect( isTMNT( 'baron Mutant Ninja Turtles', false, bannedWords, bannedPhrases ) ).to.be.deep.equal( { result: false, reason: 'banned phrase' } )
    expect( isTMNT( 'one two three four five six seven', false, bannedWords, bannedPhrases ).result ).to.be.true
    expect( isTMNT( 'HD is the best thing ever', false, bannedWords, bannedPhrases ).result ).to.be.true
  } )
} )

describe( 'Logo generation tests', async () => {
  it( 'Should generate the TMNT logo PNG', async () => {
    const buf = await makeTMNTLogo( 'Teenage Mutant Ninja Turtles' )
    fs.writeFileSync( join( __dirname, 'output', 'tmnt.png' ), buf )
  } )
  it( 'Should generate a "Single Payer Health Insurance" logo PNG with a white background', async () => {
    const buf = await makeTMNTLogo( 'Single Payer Health Insurance', 'white' )
    fs.writeFileSync( join( __dirname, 'output', 'sphi.png' ), buf )
  } )
  it( 'Should generate a "one two three four five six one two" TMNT logo PNG with a black background', async () => {
    const buf = await makeTMNTLogo( 'one two three four five six one two', 'black' )
    fs.writeFileSync( join( __dirname, 'output', '12345612.png' ), buf )
  } )
  it( 'Should generate a "this one has some (parens in it)" TMNT logo PNG', async () => {
    const buf = await makeTMNTLogo( 'this one has some (parens in it)' )
    fs.writeFileSync( join( __dirname, 'output', 'parens.png' ), buf )
  } )
  it( 'Should generate the TMNT logo PNG using PureImage', async () => {
    const buf = await makeTMNTLogo( 'Teenage Mutant Ninja Turtles', 'transparent', true )
    fs.writeFileSync( join( __dirname, 'output', 'tmnt-pi.png' ), buf )
  } )
} )

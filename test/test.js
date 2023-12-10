/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const expect = require( 'chai' ).expect
const { join } = require( 'path' )
const { isTMNT, splitStringForTMNT } = require( '../src/tmntWords.js' )
const { makeTMNTLogo } = require( '../src/tmntLogo.js' )
const { findTMNTPage } = require( '../src/tmntWikiSearch.js' )
const { BANNED_WORDS, BANNED_PHRASES } = require( '../src/bannedItems.js' )
const fs = require( 'fs' )

describe( 'Text parsing tests', async () => {
  it( 'Should split phrases correctly', async () => {
    expect( splitStringForTMNT( 'Teenage Mutant Ninja Turtles' ) ).to.be.deep.equal( { teenageMutantNinja : 'Teenage Mutant Ninja', turtles : 'Turtles' } )
    expect( splitStringForTMNT( 'one two three four five six one two' ) ).to.be.deep.equal( { teenageMutantNinja : 'one two three four five six', turtles : 'one two' } )
    expect( splitStringForTMNT( 'Scott has made the best Discord bot' ) ).to.be.deep.equal( { teenageMutantNinja : 'Scott has made the best Discord', turtles : 'bot' } )
  } )

  it( 'Should identify all the syllables in phrases', async () => {
    expect( isTMNT( 'Teenage Mutant Ninja Turtles', false, BANNED_WORDS, BANNED_PHRASES ).result ).to.be.true
    expect( isTMNT( '[Single Payer Health Insurance]', false, BANNED_WORDS, BANNED_PHRASES ).result ).to.be.true
    expect( isTMNT( 'Romeo, Romeo, wherefore art thou, Romeo?', false, BANNED_WORDS, BANNED_PHRASES ).result ).to.be.false
    expect( isTMNT( 'Big fire of 2014', false, BANNED_WORDS, BANNED_PHRASES ).result ).to.be.true
    expect( isTMNT( 'Big fire of 1923', false, BANNED_WORDS, BANNED_PHRASES ).result ).to.be.false
    expect( isTMNT( 'Sitting on the subway station', false, BANNED_WORDS, BANNED_PHRASES ).result ).to.be.true
    expect( isTMNT( 'Murder of the subway station', false, BANNED_WORDS, BANNED_PHRASES ) ).to.be.deep.equal( { result: false, reason: 'banned phrase' } )
    expect( isTMNT( 'Nazis are the dumbest people', false, BANNED_WORDS, BANNED_PHRASES ) ).to.be.deep.equal( { result: false, reason: 'banned word' } )
    expect( isTMNT( 'Billy is a rugby player', false, BANNED_WORDS, BANNED_PHRASES ) ).to.be.deep.equal( { result: false, reason: 'banned phrase' } )
    expect( isTMNT( 'baron Mutant Ninja Turtles', false, BANNED_WORDS, BANNED_PHRASES ) ).to.be.deep.equal( { result: false, reason: 'banned phrase' } )
    expect( isTMNT( 'one two three four five six seven', false, BANNED_WORDS, BANNED_PHRASES ).result ).to.be.true
    expect( isTMNT( 'HD is the best thing ever', false, BANNED_WORDS, BANNED_PHRASES ).result ).to.be.true
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
} )

// async function test_makeLogoSearch() {
//   const { pageTitle, url } = await findTMNTPage()
//   console.log( `Title: ${pageTitle}, URL: ${url}` )
//   const buf = await makeTMNTLogo( pageTitle )
//   // const buf = await makeTMNTLogo('Teenage Mutant Ninja Turtles')
//   // const buf = await makeTMNTLogo('Single Payer Health Insurance', 'white' )
//   fs.writeFileSync( 'out.png', buf )
//   console.log( 'done' )
// }

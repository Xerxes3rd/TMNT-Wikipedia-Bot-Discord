const { default: wiki } = require( 'wikijs' )
const { bannedWords, bannedPhrases } = require( './bannedItems.js' )
const { isTMNT } = require( './tmntWords.js' )

const MAX_PAGES_TO_CHECK = 250

function getWikiURL( title ) {
  return 'https://en.wikipedia.org/wiki/' + encodeURI( title.replace( / /g, '_' ) )
}

async function searchForTMNT( max_pages = MAX_PAGES_TO_CHECK, doLog = false ) {
  let pagesChecked = 0
  const keepChecking = true
  const numPagesPerCheck = 10
  const delayMS = 2000

  while ( keepChecking ) {
    let page = undefined
    try {
      page = await wiki()
        .random( numPagesPerCheck )
      // .then(titles => titles.find(title => isTMNT(title).result))
        .then( titles => titles.find( title => {
          const { result, reason } = isTMNT( title, false, bannedWords, bannedPhrases )
          if ( doLog ) {
            console.log( `${result ? 'Success' : `Fail (${reason})`}: ${title}` )
          }
          return result
        } ) )
    }
    catch ( ex ) {
      console.log( `Error processing wiki pages: ${ex}` )
    }

    pagesChecked += numPagesPerCheck
    if ( page ) {
      return { page, pagesChecked }
    }
    if ( pagesChecked >= max_pages ) {
      return { page, pagesChecked }
    }
    await new Promise( resolve => setTimeout( resolve, delayMS ) )
  }

  return { page: undefined, pagesChecked }
}

async function findTMNTPage( max_pages = MAX_PAGES_TO_CHECK, doLog = false ) {
  const { page, pagesChecked } = await searchForTMNT( max_pages, doLog )
  let url
  let pageTitle

  if ( page ) {
    url = getWikiURL( page )
    pageTitle = page
    if ( doLog ) {
      console.log( `Found '${page}' (checked ${pagesChecked} pages): ${url}` )
    }
  }
  else {
    console.log( `Failure: checked ${pagesChecked} pages and none matched` )
  }

  return { pageTitle, url, pagesChecked }
}

module.exports = {
  searchForTMNT,
  getWikiURL,
  findTMNTPage,
}

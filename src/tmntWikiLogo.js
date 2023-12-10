const { findTMNTPage } = require( './tmntWikiSearch.js' )
const { makeTMNTLogo } = require( './tmntLogo.js' )

async function getTMNTWikiLogo() {
  const { pageTitle, url, pagesChecked } = await findTMNTPage()
  let buf
  const result = ( pageTitle && url )

  if ( result ) {
    buf = await makeTMNTLogo( pageTitle )
  }

  return { result, pageTitle, url, pagesChecked, buf }
}

module.exports = { getTMNTWikiLogo }
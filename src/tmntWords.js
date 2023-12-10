const { phonesForWord, stresses } = require( 'pronouncing' )
const { toWords, toWordsOrdinal } = require( 'number-to-words' )

const TMNTStressesRegExp = new RegExp( '1[02]1[02]1[02]1[02]' )
const pronunciationOverrides = [['HD', '10'], ['U.S.', '10'], ['Laos', '1'], ['vs.', '10'], ['dr.', '10'], ['bot', '1']]
const stressFail = '9999999999' // Hacky way of discarding candidate title

function toWordsYear( num_str ) {
  const num = parseInt( num_str )
  if ( !num ) {return ''}

  const high = Math.floor( num / 100 )
  const low = num % 100

  if ( high == 0 ||
        ( high % 10 == 0 && low < 10 ) ||
        high >= 100 ) {
    return toWords( num_str )
  } else {
    let lowtext = ''
    if ( low == 0 ) {
      lowtext = 'hundred'
    } else if ( low < 10 ) {
      lowtext = `oh ${toWords( low )}`
    } else {
      lowtext = toWords( low )
    }
    return `${toWords( high )} ${lowtext}`
  }
}

function numbersToWords( word ) {
  const ordinal_number_endings = ['nd', 'rd', 'st', 'th']
  if ( /\d/.test( word ) ) {
    if ( word.length === 4 ) {
      try {
        return toWordsYear( word )
      } catch {
        return stressFail
      }
    } else if ( word.length >= 3 &&
            /\d/.test( word.substring( word.length - 3, 1 ) ) &&
            ordinal_number_endings.includes( word.substring( word.length - 2 ) ) ) {
      try {
        return toWordsOrdinal( word.substring( 0, word.length - 2 ) )
      } catch {
        return stressFail
      }
    }
  }

  return word
}

function getWordStresses( word ) {
  const converted_word = numbersToWords( word )

  let word_stresses = ''
  converted_word.split( ' ' ).forEach( split_word => {

    let found_override = false
    pronunciationOverrides.every( override => {
      if ( split_word === override[0].toLowerCase() ) {
        word_stresses += override[1]
        found_override = true
        return false
      }
      return true
    } )

    if ( !found_override ) {
      const phones = phonesForWord( split_word )
      if ( !phones || phones.length === 0 ) {
        word_stresses += stressFail
      }

      word_stresses += stresses( phones.length > 0 ? phones[0] : '' )
    }
  } )

  return word_stresses
}

function getTitleStresses( title ) {
  const title_words = title.split( ' ' )
  let title_stresses = ''
  for ( const word of title_words ) {
    if ( title_stresses.length > 8 ) {break}
    const word_stresses = getWordStresses( word )
    title_stresses += word_stresses
  }
  return title_stresses
}

function sumWordsStresses( wordsArray ) {
  let numStresses = 0
  for ( let i = 0; i < wordsArray.length; i++ ) {
    const word = wordsArray[i]
    if ( word.trim().length > 0 ) {
      numStresses += getWordStresses( wordsArray[i] )
    }
  }
  return numStresses
}

function splitStringForTMNT( str ) {
  const teenageMutantNinjaArray = str.split( /(\s|-)/ ) // ['teenage', ' ', 'mutant', ' ', 'ninja', ' ', 'turtles']
  //      0,      1,      2,     3,     4,     5,      6
  const turtlesArray = []
  turtlesArray.push( teenageMutantNinjaArray.pop() )

  while ( ( sumWordsStresses( turtlesArray ) < 2 ) && ( teenageMutantNinjaArray.length > 1 ) ) {
    turtlesArray.splice( 0, 0, teenageMutantNinjaArray.pop() )
  }

  const teenageMutantNinja = teenageMutantNinjaArray.join( '' ).trim()
  const turtles = turtlesArray.join( '' ).trim()

  return { teenageMutantNinja, turtles }
}

function cleanStr( str ) {
  // eslint-disable-next-line no-useless-escape
  return str.toLowerCase().replace( /[\])}[{(,:;\.]/g, '' ).replace( /-/g, ' ' )
}

function isTMNT( title, exactTMNTStresses = false, bannedWords = [], bannedPhrases = [] ) {
  const title_clean = cleanStr( title )
  const title_stresses = getTitleStresses( title_clean )

  if ( bannedWords && Array.isArray( bannedWords ) && bannedWords.some( word => title_clean.includes( word ) ) ) {
    return { result: false, reason: 'banned word' }
  }

  if ( bannedPhrases && Array.isArray( bannedPhrases ) && bannedPhrases.some( phrase => title_clean.includes( phrase ) ) ) {
    return { result: false, reason: 'banned phrase' }
  }

  if ( !title_stresses || title_stresses.length !== 8 ) {
    return { result: false, reason: `wrong stresses: ${title_stresses}` }
  }

  if ( exactTMNTStresses && !title_stresses.match( TMNTStressesRegExp ) ) {
    return { result: false, reason: `not TMNT stresses: ${title_stresses}` }
  }

  return { result: true, reason: '' }
}

module.exports = {
  TMNT_STRESSES: TMNTStressesRegExp,
  PRONUNCIATION_OVERRIDES: pronunciationOverrides,
  toWordsYear,
  numbersToWords,
  getWordStresses,
  sumWordsStresses,
  getTitleStresses,
  splitStringForTMNT,
  isTMNT,
}
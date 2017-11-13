const fs = require('fs')
const { promisify } = require('util')
let prices
let preferences

// Function to read files
async function readfile (filename) {
  let readStream = promisify(fs.createReadStream(`./${filename}`, 'utf8'))

  await readStream.on('data', function(chunk) {
      if (filename == 'drinks.txt' || filename == 'food.txt') {
        // format data
        let newEntries = chunk.split('\n').map(line => line.split(':'))
        // add to map
        if (!prices) {
          prices = new Map(newEntries)
        } else {
          newEntries.forEach(entry => prices.set(entry[0], parseInt(entry[1], 10)))
        }
      } else if (filename == 'people.txt') {
        preferences = new Map()
        // map preferences for the party
        let newPrefs = chunk.split('\n')
                         .filter((line, i) => ((i+2) % 3 == 0))
                         .map(line => line.split(','))
         newPrefs.forEach((line) => {
           line.forEach((item) => {
             let key = item.trim() // remove whitespaces
             preferences.get(key) ? preferences.set(key, preferences.get(key)+1) :
                            preferences.set(key, 1)
           })
         })
      }
  }).on('end', function() {
    console.log(`File ${filename} was successfully read`)
    if (prices) { return prices }
    if (preferences) { return preferences }
  })
}

const readFileAsync = promisify(readfile)
// read files
async function readAndProcess(filename) {
  try {
    await readfile(filename)
    await readFileAsync('food.txt')
    // let c = await readFileAsync('people.txt')
  } catch (err) {
    console.log(`Error: ${err}`)
  }
}

readAndProcess('drinks.txt').then((data) => console.log(data))
readAndProcess('food.txt').then(() => console.log(prices))
// const main = promisify(readAndProcess)
// main().then(() => console.log('hidsad'))

const fs = require('fs')
const { promisify } = require('util')
let prices // map of prices of food and drinks
let preferences // map of preferences of guests

/*
 * Get filepaths from command line
 */
let args = process.argv.slice(2)
// filter out files that don't exist
console.log('\nwarning: files with the wrong path will not be read')
let filteredArgs = args.filter(path => fs.existsSync(`./${path}`))
// Function to read files
const readfile = (filename) => {
  // each readStream is wrapped using a promise so we can chain them up
  let event = new Promise((resolve, reject) => {
    let readStream = fs.createReadStream(`./${filename}`, 'utf8')

    readStream.on('data', function (chunk) {
      if (filename == 'drinks.txt' || filename == 'food.txt') {
          // format data, filter to remove empty elements caused by empty strings in file
        let newEntries = chunk.split('\n').filter(n => n).map(line => line.split(':'))
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
                           .filter((line, i) => ((i + 2) % 3 == 0) || ((i+1) % 3 == 0))
                           .map(line => line.split(','))
        newPrefs.forEach((line) => {
          line.forEach((item) => {
            let key = item.trim() // remove whitespaces
            preferences.get(key) ? preferences.set(key, preferences.get(key) + 1) :
                              preferences.set(key, 1)
          })
        })
      }
    }).on('end', () => {
      resolve(console.log(`File ${filename} was successfully read`))
    }).on('error', () => reject)
  })
  return event
}

/*
 * Start reading files
 */
console.log('\nbegin reading files...\n')
// wait for streams to be read using promises
let promises = filteredArgs.map(filename => readfile(filename))
async function allocateBudget() {
  await Promise.all(promises)
  let res = await new Promise((resolve, reject) => {
    let shoppingList = []
    prices && preferences ? console.log('\nWhat is your budget?') : console.log('File mismatch. Please run: "node index.js food.txt drinks.txt people.txt".')
    process.stdin.setEncoding('utf8')
    process.stdin.on('readable', () => {
      const chunk = process.stdin.read()
      if (chunk !== null) {
        let budget = chunk
        if (Number.isInteger(parseInt(budget))) {
          // allocate things to buy into shoppingList
          preferencesCopy = new Map(preferences)
          while (budget > 0) {
            // get one of each item that our guests prefer to satisfy everyone
            for (let [key, value] of preferencesCopy) {
              let price = prices.get(key)
              if (budget - parseInt(price) > 0) {
                //console.log(preferences.get(key))
                if (preferencesCopy.get(key) > 0) {
                  preferencesCopy.set(key, preferencesCopy.get(key)-1)
                  shoppingList.push(key)
                  budget -= price
                }
                // when ratio is depleted, repeat cycle
                if (Array.from(preferencesCopy.values()).reduce((a, b) => a + b) == 0) {
                  preferencesCopy = new Map(preferences)
                }
              } else {
                budget = 0 // break
                resolve(shoppingList)
              }
            }
          }
        } else {
          console.log('\nError: Please enter an integer when asked for the budget.\nRestart by running: "node index.js food.txt drinks.txt people.txt"')
        }
      }
      // stop stdin from reading input
      if (chunk) {
        process.stdin.pause()
      }
    })
  })
  let x = res.reduce((obj, item) => {
    return obj[item] = ++obj[item]||1, obj
  }, {})
  console.log('Allocated items:\n', x)
  // console.log(preferences)
  return x
}

// run async function
allocateBudget()

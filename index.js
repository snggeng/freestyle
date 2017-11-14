const fs = require('fs')
const { promisify } = require('util')
let prices
let preferences

// get filepaths from command line
let args = process.argv.slice(2)
// filter out files that don't exist
console.log('\nwarning: files with the wrong path will not be read')
let filteredArgs = args.filter(path => fs.existsSync(`./${path}`))
// Function to read files
const readfile = (filename) => {
  //args.map()
  let event = new Promise((resolve, reject) => {
    let readStream = fs.createReadStream(`./${filename}`, 'utf8')

    readStream.on('data', function(chunk) {
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
    }).on('end', () => {
      resolve(console.log(`File ${filename} was successfully read`))
    }).on('error', () => reject)
  })
  return event
}

// Start reading files
console.log('\nbegin reading files...\n')
let promises = filteredArgs.map(filename => readfile(filename))
Promise.all(promises).then(() => console.log(prices))
// console.log(x)
//readfile('drinks.txt').then((t) => console.log(t))

// console.log(args)

// // read files
// async function readAndProcess(filename) {
//   try {
//     await readfile(filename)
//     await readFileAsync('food.txt')
//     // let c = await readFileAsync('people.txt')
//   } catch (err) {
//     console.log(`Error: ${err}`)
//   }
// }

// readAndProcess('drinks.txt').then((data) => console.log(data))
// readAndProcess('food.txt').then(() => console.log(prices))
// const main = promisify(readAndProcess)
// main().then(() => console.log('hidsad'))

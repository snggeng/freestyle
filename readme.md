# Freestyle Fellows Engineering Challenge
## Instructions
**NOTE:** *This repository uses ES6 features so you will need to have Node Version 6.4.0 or above*

Clone this repository and cd into it:
```
git clone https://github.com/snggeng/freestyle.git
cd freestyle
```
Run the following command:
```
node index.js drinks.txt food.txt people.txt
```

## How it works
We read files using Node's built-in `fs` library and create streams to read each file. I opted to use `fs.createReadStream()` over `fs.readFile()` since it's faster and more memory efficient when the files are large because it uses streams.

We parse the user's command line input and make sure that only the right files are parsed, and that these files exist before we run our algorithm.

When parsing the files, we construct two hashmaps using Javascript's `Map()` class: `prices` and `preferences`. These maps will allow us to access the respective prices of food/drink at O(1) time and the preferences of our guests at O(1) time.

Since the streams are being parsed asynchronously, I use promises and ES7's Async / Await to create a synchronous process that waits for the streams to finish reading before allocating items for the party.

The algorithm allocates items based on the ratio of preferences of our guests. To make every guest happy, we want to have at least one of each food/drink as long as it is preferred by any guest, regardless of the number of people who actually prefer it. This way, as long as you attend the party, you will see at least one of the food/drink you prefer (if this is within budget). If we run out of budget while allocating this, then we just allocate in sequence of our hashmap. Once our algorithm has allocated at least one of each preference, it will keep allocating one of each food/drink until the quota to fulfil the ratio of preferences is full, and skip those food/drinks.

For example:
```
preferences = {
  tacos: 4,
  salad: 1,
  noodles: 2
}

Allocated items iteration 1:
allocation = {
  tacos: 1, // preference = 4 - 1 = 3
  salad: 1, // preference = 1 - 1 = 0
  noodles: 1 // preference = 2 - 1 = 1
}

Allocated items iteration 2:
allocation = {
  tacos: 2, // preference = 3 - 1 = 2
  salad: 1, // preference = 0
  noodles: 2 // preference = 2 - 1 = 0
}

Allocated items iteration 3:
allocation = {
  tacos: 3, // preference = 2 - 1 = 1
  salad: 1, // preference = 0
  noodles: 2 // preference = 0
}

Allocated items iteration 4:
allocation = {
  tacos: 4, // preference = 1 - 1 = 0
  salad: 1, // preference = 0
  noodles: 2 // preference = 0
}
// At this point, we have fulfilled an entire cycle of preferences
// If there is extra budget at this point, we reset our preferences

Allocated items iteration 5:
allocation = {
  tacos: 5, // preference = 4 - 1 = 3
  salad: 2, // preference = 1 - 1 = 0
  noodles: 3 // preference = 2 - 1 = 1
}

// Process keeps repeating until budget finishes or adding a new item would exceed budget
```

## Challenge Description
You are planning a party for an arbitrary number of people and you need to buy drinks and food. Assume you’re given a budget (integer) and 3 files: `'people.txt', 'drinks.txt', 'food.txt'`.

`'people.txt'` contains an arbitrary number of people with their preferred drinks and food; each entry will be 3 lines long (1st line: name (not unique), 2nd line: drinks (comma delimited, not sorted), 3rd line: food (comma delimited, not sorted).

`'drinks.txt'` and `'food.txt'` are arbitrarily large and each entry will be 1 line long in the following format: `<drink or food name>:unit cost`

Design and implement an algorithm that reads in the files and selects what drinks and foods you should purchase within your budget based on the information in the files. Be creative in how you optimize for food and drinks based on the known preferences.

Your answer should include an explanation of your algorithm, test cases, and a statement of all the assumptions you've made.

Feel free to use any data structures and packages or create your own. Submit all your files in a zipped directory (which can include a link to your GitHub repository of this challenge).brew

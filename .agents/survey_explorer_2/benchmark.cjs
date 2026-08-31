const fs = require('fs');
const path = require('path');
const wordlist = require('../../src/data/wordlist.json');

// Benchmark dictionary lookup speed
const iterations = 1000000;
const pairs = Object.keys(wordlist);

console.time('1,000,000 Dictionary Lookups');
let dummy = 0;
for (let i = 0; i < iterations; i++) {
  const pair = pairs[i % 576];
  const words = wordlist[pair];
  dummy += words.length;
}
console.timeEnd('1,000,000 Dictionary Lookups');
console.log('Dummy checksum:', dummy);

// Memory usage check
const used = process.memoryUsage();
console.log({
  rssMB: (used.rss / 1024 / 1024).toFixed(2),
  heapTotalMB: (used.heapTotal / 1024 / 1024).toFixed(2),
  heapUsedMB: (used.heapUsed / 1024 / 1024).toFixed(2),
});

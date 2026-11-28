// Load the pinned CommonJS source in a fresh process for each variant.
const { isValidList } = require(process.argv[2]);
const assert = require('node:assert/strict');
const variant = process.argv[3];
const examples = [
  // input, expected in the original, expected under the list contract
  ['', true, false], ['a,', true, false], ['alpha', true, true],
  ['foo, bar', true, true], ['A_9,\tz', true, true], ['a b', true, false],
  ['a\n', true, false], [',a', false, false], ['a,,b', false, false],
  ['a,\u00a0b', true, true], ['a,\u200bb', false, false], ['😀', false, false]
];
const observations = examples.map(([input, original, fixed]) => {
  const observed = isValidList(input);
  assert.equal(observed, variant === 'fixed' ? fixed : original);
  return { input, observed };
});

// Each UTF-16 unit in a single-word position and in a separator position.
// The latter also accepts a word unit as the first character of the next word.
function word(u) {
  return (u >= 65 && u <= 90) || (u >= 97 && u <= 122) ||
    (u >= 48 && u <= 57) || u === 95;
}
function space(u) {
  return (u >= 9 && u <= 13) || (u >= 0x2000 && u <= 0x200a) ||
    [32, 160, 0x1680, 0x2028, 0x2029, 0x202f, 0x205f, 0x3000, 0xfeff].includes(u);
}
for (let u = 0; u <= 0xffff; u++) {
  const c = String.fromCharCode(u);
  assert.equal(isValidList(c), word(u), 'word slot ' + u);
  assert.equal(isValidList('a,' + c + 'b'), word(u) || space(u), 'separator slot ' + u);
}
console.log(JSON.stringify({ observations, character_slot_checks: 2 * 65536 }));

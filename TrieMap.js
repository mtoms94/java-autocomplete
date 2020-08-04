const TrieSearch = require("trie-search");

module.exports = class TrieMap {
  constructor() {
    this.trieMap = new Map();
  }

  getTrie(key) {
    return this.trieMap.get(key);
  }

  add(type, obj) {
    let trie = this.getTrie(type);
    if (!trie) {
      trie = new TrieSearch("", { splitOnRegEx: false });
      this.trieMap.set(type, trie);
    }
    trie.map(obj.name, obj);
  }

  search(type, prefix) {
    const trie = this.getTrie(type);
    if (trie) {
      return trie.get(prefix);
    } else {
      return [];
    }
  }
};

const TrieSearch = require("trie-search");

module.exports = class TrieMap {
  constructor() {
    this.trieMap = new Map();
  }

  getTrie(key) {
    return this.trieMap.get(key);
  }

  add(type, obj) {
    //console.log("obj: ", obj);
    let trie = this.getTrie(type);
    //console.log("this.trieMap: ", this.trieMap);
    if (!trie) {
      trie = new TrieSearch("", { splitOnRegEx: false });
      this.trieMap.set(type, trie);
    }
    // TODO: pass obj with brackets?
    trie.map(obj.name, obj);
    //console.log(obj.name, " added successfully: ", trie.get(obj.name));
  }

  search(type, prefix) {
    const trie = this.getTrie(type);
    //console.log("trie for ", type, ": ", trie);
    if (trie) {
      return trie.get(prefix);
    } else {
      return [];
    }
  }
};

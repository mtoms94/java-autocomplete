const Parser = require("tree-sitter");
const Java = require("tree-sitter-java");
const TrieMap = require("./TrieMap");
const fs = require("fs").promises;
const parser = new Parser();
parser.setLanguage(Java);

const javaBasicAnnotationTypes = [
  "Deprecated",
  "Override",
  "SuppressWarnings",
  "HotSpotIntrinsicCandidate",
];
const javaDirectory = "java-standard-library";
this.trieMap = new TrieMap();

const readFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return data;
  } catch (err) {
    console.log(err);
  }
};

// To simplify this program members must be explicitly declared public to be public
const isPublic = (memberNode) => {
  if (!memberNode.descendantsOfType("modifiers")[0]) return false;
  for (let modifier of memberNode.descendantsOfType("modifiers")[0].children) {
    if (modifier.type == "public") return true;
  }
  return false;
};

const isStatic = (memberNode) => {
  if (!memberNode.descendantsOfType("modifiers")[0]) return false;
  for (let modifier of memberNode.descendantsOfType("modifiers")[0].children) {
    if (modifier.type == "static") return true;
  }
  return false;
};

const processConstructors = (args) => {
  let constructors = [];
  args.classBodyNode
    .descendantsOfType("constructor_declaration")
    .forEach((constructorNode) => {
      let parameters = "";
      constructorNode
        .descendantsOfType("formal_parameters")[0]
        .children.forEach((param) => {
          parameters += param.text.concat(" ");
        });
      parameters = parameters.trim();
      const constructorObj = {
        name: args.className + parameters,
        class: args.className,
        parameters,
      };
      this.trieMap.add(args.className + ":constructors", constructorObj);
      constructors.push(constructorObj);
    });
  return constructors;
};

const processMethods = (args) => {
  let methods = [];
  args.classBodyNode
    .descendantsOfType("method_declaration")
    .forEach((methodNode) => {
      if (isPublic(methodNode) && !isStatic(methodNode)) {
        //skip over all annotations like @Override
        let i = 0;
        while (
          javaBasicAnnotationTypes.includes(
            methodNode.descendantsOfType("identifier")[i].text
          )
        ) {
          i++;
        }
        const name = methodNode.descendantsOfType("identifier")[i].text;
        let returnType = "";
        returnType = methodNode.descendantsOfType("type_identifier")[0]
          ? methodNode.descendantsOfType("type_identifier")[0].text
          : returnType;
        returnType = methodNode.descendantsOfType("integral_type")[0]
          ? methodNode.descendantsOfType("integral_type")[0].children[0].text
          : returnType;
        returnType = methodNode.descendantsOfType("boolean_type")[0]
          ? methodNode.descendantsOfType("boolean_type")[0].text
          : returnType;
        let params = "";
        methodNode
          .descendantsOfType("formal_parameters")[0]
          .children.forEach((param) => {
            params += param.text.concat(" ");
          });
        const methodObj = {
          name: name + params, //keeping parameters in the name ensures each method has a unique key in the trie.
          returnType,
          params,
        };
        methods.push(methodObj);
        this.trieMap.add(args.className + ":methods", methodObj);
      }
    });
  return methods;
};

const processFile = async (fileName) => {
  const text = await readFile(fileName);
  this.tree = await parser.parse(text); // Extension: update this to use background processes per docs
  this.tree.rootNode
    .descendantsOfType("class_declaration")
    .forEach((classNode) => {
      if (isPublic(classNode)) {
        const name = classNode.descendantsOfType("identifier")[0].text;
        const scope = classNode
          .descendantsOfType("modifiers")[0]
          .children.map((modifier) => modifier.type);
        const classBodyNode = classNode.descendantsOfType("class_body")[0];
        const constructors = processConstructors({
          classBodyNode,
          className: name,
        });
        const methods = processMethods({
          classBodyNode,
          className: name,
        });
        const classObj = {
          name,
          scope,
          extends: "Object", //Extension: update this with actual inheritance
          constructors,
          methods,
        };
        this.trieMap.add("class", classObj);
      }
    });
};
const processLibraries = async () => {
  let files;
  try {
    files = await fs.readdir(javaDirectory);
  } catch (err) {
    console.log(err);
  }
  if (files === undefined) {
    console.log("undefined");
  } else {
    for (const file of files) {
      await this.processFile(javaDirectory + "/" + file);
    }
  }
};

exports.processLibraries = processLibraries;
exports.processFile = processFile;
exports.tree = this.tree;
exports.trieMap = this.trieMap;

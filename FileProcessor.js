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
      const constructorObj = {
        name: "",
        class: args.className,
        parameters: "",
      };
      let params = "";
      constructorNode
        .descendantsOfType("formal_parameters")[0]
        .children.forEach((param) => {
          params += param.text.concat(" ");
        });
      params = params.trim();
      constructorObj.parameters = params;
      constructorObj.name = args.className + params;
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
        const methodObj = {
          name: "",
          returnType: "",
          params: "",
        };
        //skip over all annotations like @Override
        let i = 0;
        while (
          javaBasicAnnotationTypes.includes(
            methodNode.descendantsOfType("identifier")[i].text
          )
        ) {
          i++;
        }
        methodObj.name = methodNode.descendantsOfType("identifier")[i].text;

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
        methodObj.returnType = returnType;
        let params = "";
        methodNode
          .descendantsOfType("formal_parameters")[0]
          .children.forEach((param) => {
            params += param.text.concat(" ");
          });
        methodObj.params = params;
        methodObj.name += methodObj.params; //keeping parameters in the name ensures each method has a unique key in the trie.
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
        const classObj = {
          name: classNode.descendantsOfType("identifier")[0].text,
          scope: classNode
            .descendantsOfType("modifiers")[0]
            .children.map((modifier) => modifier.type),
          description: "",
          extends: "Object", //Extension: update this with actual inheritance
          constructors: [],
          methods: [],
        };
        const classBodyNode = classNode.descendantsOfType("class_body")[0];
        classObj.constructors = processConstructors({
          classBodyNode,
          className: classObj.name,
        });
        classObj.methods = processMethods({
          classBodyNode,
          className: classObj.name,
        });
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

const fileProcessor = require("./FileProcessor");

const processCursorIndex = async (index) => {
  let cursorNode = this.tree.rootNode.descendantForIndex(index);
  let identifier = "";
  const searchChars = index - 20;
  while (index > searchChars) {
    switch (cursorNode.type) {
      case "identifier":
        identifier = cursorNode.text;
        break;
      case "new":
        //find class being declared
        let className;
        if (cursorNode.parent.descendantsOfType("type_identifier")[0]) {
          className = cursorNode.parent.descendantsOfType("type_identifier")[0]
            .text;
        } else {
          return; //can't find class
        }
        printConstructorSuggestions(className);
        return;
      case ".":
        //find available methods accessible to the object preceding "."
        const variableName = cursorNode.previousSibling.text;
        const methodNode = await findScope(cursorNode.previousSibling);
        methodNode
          .descendantsOfType("variable_declarator")
          .forEach((declaration) => {
            if (
              declaration.descendantsOfType("identifier")[0].text ==
              variableName
            ) {
              let variableType;
              if (declaration.descendantsOfType("type_identifier")[0]) {
                variableType = declaration.descendantsOfType(
                  "type_identifier"
                )[0].text;
              } else if (
                declaration.previousSibling.type == "type_identifier"
              ) {
                variableType = declaration.previousSibling.text;
              } else {
                return; // failed to find variable instance type
              }
              printClassSuggestions({
                class: variableType,
                prefix: identifier,
              });
            }
          });
        return;
    }
    --index;
    cursorNode = this.tree.rootNode.descendantForIndex(index);
  }
};

const findScope = async (node) => {
  while (node.type != "method_declaration" && node.parent != null) {
    node = node.parent;
  }
  return node;
};

const printConstructorSuggestions = (className) => {
  const suggestions = this.trieMap.search(
    className + ":constructors",
    className
  );

  console.log("-".repeat(100));
  suggestions.forEach((suggestion) => {
    console.log(suggestion.name);
  });
  console.log("-".repeat(100));
};

const getClassSuggestions = async (toPrint) => {
  let suggestions;
  const classObj = this.trieMap.search("class", toPrint.class)[0];
  if (toPrint.prefix == "") {
    suggestions = classObj.methods; //trie search fails with empty string so grab all methods directly from classobj
  } else {
    suggestions = this.trieMap.search(
      toPrint.class + ":methods",
      toPrint.prefix
    );
  }
  // recursively add inherited methods
  if (classObj.extends != toPrint.class) {
    suggestions = suggestions.concat(
      await getClassSuggestions({
        class: classObj.extends,
        prefix: toPrint.prefix,
      })
    );
  }
  return suggestions;
};

const printClassSuggestions = async (toPrint) => {
  const suggestions = await getClassSuggestions(toPrint);
  console.log("-".repeat(100));
  suggestions.forEach((suggestion) => {
    const offset =
      50 - suggestion.name.length > 0 ? 50 - suggestion.name.length : 0;
    console.log(
      suggestion.name,
      " ".repeat(offset),
      "| return type: ",
      suggestion.returnType
    );
  });
  console.log("-".repeat(100));
};

const handler = async () => {
  const fileName = process.argv[2];
  const index = process.argv[3];
  const usageMessage = "";
  console.log("fileName: ", fileName, "\n");
  console.log("line: ", index, "\n");
  try {
    await fileProcessor.processLibraries();
    await fileProcessor.processFile(fileName);
  } catch (err) {
    console.log(err);
    return;
  }
  this.tree = fileProcessor.tree;
  this.trieMap = fileProcessor.trieMap;
  await processCursorIndex(Number(index.trim()));
};
handler();

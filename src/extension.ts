import * as vscode from "vscode";

// ---------------------------------------------------------------------------
// Builtin function documentation
// ---------------------------------------------------------------------------

interface BuiltinDoc {
  signature: string;
  description: string;
}

const BUILTINS: Record<string, BuiltinDoc> = {
  // I/O
  puts: {
    signature: "puts(value)",
    description: "Prints value to stdout with a newline",
  },
  print: {
    signature: "print(value)",
    description: "Prints value to stdout without a newline",
  },
  input: {
    signature: "input(prompt?)",
    description: "Reads a line of input from stdin",
  },

  // Type conversion
  to_int: {
    signature: "to_int(value)",
    description: "Converts a value to an integer",
  },
  to_float: {
    signature: "to_float(value)",
    description: "Converts a value to a float",
  },
  to_string: {
    signature: "to_string(value)",
    description: "Converts a value to a string",
  },
  type: {
    signature: "type(value)",
    description: 'Returns the type name of a value (e.g., "int", "string")',
  },

  // JSON
  to_json: {
    signature: "to_json(value)",
    description: "Serializes a value to a JSON string",
  },
  from_json: {
    signature: "from_json(str)",
    description: "Parses a JSON string into a Vibe value",
  },

  // Array functions
  len: {
    signature: "len(array_or_string)",
    description: "Returns the length of an array or string",
  },
  push: {
    signature: "push(array, value)",
    description: "Appends a value to the end of an array (mutates)",
  },
  pop: {
    signature: "pop(array)",
    description: "Removes and returns the last element of an array",
  },
  shift: {
    signature: "shift(array)",
    description: "Removes and returns the first element of an array",
  },
  first: {
    signature: "first(array)",
    description: "Returns the first element of an array",
  },
  last: {
    signature: "last(array)",
    description: "Returns the last element of an array",
  },
  flatten: {
    signature: "flatten(array)",
    description: "Flattens a nested array by one level",
  },
  includes: {
    signature: "includes(array, value)",
    description: "Returns true if the array contains the value",
  },
  index_of: {
    signature: "index_of(array, value)",
    description:
      "Returns the index of value in the array, or -1 if not found",
  },
  remove_at: {
    signature: "remove_at(array, index)",
    description:
      "Removes and returns the element at index (supports negative indices)",
  },

  // Higher-order array functions
  map: {
    signature: "map(array, fn)",
    description: "Applies fn to each element, returns a new array",
  },
  filter: {
    signature: "filter(array, fn)",
    description: "Returns elements where fn returns true",
  },
  each: {
    signature: "each(array, fn)",
    description: "Calls fn for each element (for side effects)",
  },
  reduce: {
    signature: "reduce(array, initial, fn)",
    description:
      "Reduces an array to a single value using fn(accumulator, element)",
  },
  find: {
    signature: "find(array, fn)",
    description: "Returns the first element where fn returns true, or nil",
  },
  any: {
    signature: "any(array, fn)",
    description: "Returns true if fn returns true for any element",
  },
  all: {
    signature: "all(array, fn)",
    description: "Returns true if fn returns true for all elements",
  },
  flat_map: {
    signature: "flat_map(array, fn)",
    description: "Maps fn over array and flattens the result by one level",
  },
  zip: {
    signature: "zip(array1, array2)",
    description: "Combines two arrays into an array of pairs",
  },
  take: {
    signature: "take(array, n)",
    description: "Returns the first n elements",
  },
  drop: {
    signature: "drop(array, n)",
    description: "Returns all elements after the first n",
  },
  chunk: {
    signature: "chunk(array, size)",
    description: "Splits the array into chunks of the given size",
  },
  group_by: {
    signature: "group_by(array, fn)",
    description: "Groups elements by the result of fn",
  },
  sort_by: {
    signature: "sort_by(array, fn)",
    description: "Sorts elements by the result of fn",
  },
  min_by: {
    signature: "min_by(array, fn)",
    description: "Returns the element with the minimum value of fn",
  },
  max_by: {
    signature: "max_by(array, fn)",
    description: "Returns the element with the maximum value of fn",
  },
  each_with_index: {
    signature: "each_with_index(array, fn)",
    description: "Calls fn(element, index) for each element",
  },
  map_with_index: {
    signature: "map_with_index(array, fn)",
    description: "Maps fn(element, index) over the array",
  },
  tally: {
    signature: "tally(array)",
    description: "Counts occurrences of each element, returns a hash",
  },
  sort: {
    signature: "sort(array)",
    description: "Returns a sorted copy of the array",
  },
  reverse: {
    signature: "reverse(array)",
    description: "Returns a reversed copy of the array",
  },

  // String functions
  trim: {
    signature: "trim(string)",
    description: "Removes leading and trailing whitespace",
  },
  split: {
    signature: "split(string, delimiter)",
    description: "Splits a string by delimiter into an array",
  },
  join: {
    signature: "join(array, separator)",
    description: "Joins array elements into a string with separator",
  },
  replace: {
    signature: "replace(string, old, new)",
    description: "Replaces all occurrences of old with new",
  },
  upcase: {
    signature: "upcase(string)",
    description: "Converts string to uppercase",
  },
  downcase: {
    signature: "downcase(string)",
    description: "Converts string to lowercase",
  },
  capitalize: {
    signature: "capitalize(string)",
    description: "Capitalizes the first character",
  },
  starts_with: {
    signature: "starts_with(string, prefix)",
    description: "Returns true if string starts with prefix",
  },
  ends_with: {
    signature: "ends_with(string, suffix)",
    description: "Returns true if string ends with suffix",
  },
  repeat: {
    signature: "repeat(string, count)",
    description: "Repeats the string count times",
  },
  chars: {
    signature: "chars(string)",
    description: "Splits string into an array of characters",
  },
  pad_start: {
    signature: "pad_start(string, length, pad_char?)",
    description: "Pads string from the start to the given length",
  },
  pad_end: {
    signature: "pad_end(string, length, pad_char?)",
    description: "Pads string from the end to the given length",
  },
  string_reverse: {
    signature: "string_reverse(string)",
    description: "Reverses a string",
  },
  string_slice: {
    signature: "string_slice(string, start, end)",
    description: "Returns a substring from start to end index",
  },
  string_contains: {
    signature: "string_contains(string, substring)",
    description: "Returns true if string contains substring",
  },
  index_of_string: {
    signature: "index_of_string(string, substring)",
    description:
      "Returns the index of substring in string, or -1 if not found",
  },

  // Hash functions
  keys: {
    signature: "keys(hash)",
    description: "Returns an array of all keys in the hash",
  },
  values: {
    signature: "values(hash)",
    description: "Returns an array of all values in the hash",
  },
  has_key: {
    signature: "has_key(hash, key)",
    description: "Returns true if the hash contains the key",
  },
  merge: {
    signature: "merge(hash1, hash2)",
    description: "Merges two hashes, with hash2 values taking precedence",
  },
  delete: {
    signature: "delete(hash, key)",
    description: "Removes a key from the hash and returns its value",
  },

  // Concurrency
  spawn: {
    signature: "spawn(fn)",
    description: "Runs a function in a new goroutine, returns a Task",
  },
  await: {
    signature: "await(task)",
    description: "Waits for a task to complete and returns its result",
  },
  send: {
    signature: "send(channel, value)",
    description: "Sends a value to a channel",
  },
  receive: {
    signature: "receive(channel)",
    description: "Receives a value from a channel (blocks until available)",
  },
  Channel: {
    signature: "Channel()",
    description: "Creates a new channel for inter-goroutine communication",
  },
  Range: {
    signature: "Range(start, end, exclusive?)",
    description:
      "Creates a range from start to end (exclusive if third arg is true)",
  },
};

// ---------------------------------------------------------------------------
// Keywords for completion
// ---------------------------------------------------------------------------

const KEYWORDS = [
  "def",
  "end",
  "fn",
  "let",
  "const",
  "if",
  "elsif",
  "else",
  "unless",
  "until",
  "while",
  "for",
  "in",
  "case",
  "when",
  "break",
  "continue",
  "return",
  "class",
  "struct",
  "enum",
  "prop",
  "try",
  "catch",
  "throw",
  "finally",
  "import",
  "self",
  "super",
  "true",
  "false",
  "nil",
];

const TYPES = ["int", "float", "string", "boolean", "nil", "any"];

// ---------------------------------------------------------------------------
// Activation
// ---------------------------------------------------------------------------

export function activate(context: vscode.ExtensionContext) {
  // Completion provider for builtins
  const builtinProvider = vscode.languages.registerCompletionItemProvider(
    "vibe",
    {
      provideCompletionItems() {
        const items: vscode.CompletionItem[] = [];

        for (const [name, doc] of Object.entries(BUILTINS)) {
          const item = new vscode.CompletionItem(
            name,
            vscode.CompletionItemKind.Function
          );
          item.detail = doc.signature;
          item.documentation = new vscode.MarkdownString(doc.description);
          items.push(item);
        }

        return items;
      },
    }
  );

  // Completion provider for keywords
  const keywordProvider = vscode.languages.registerCompletionItemProvider(
    "vibe",
    {
      provideCompletionItems() {
        return KEYWORDS.map((kw) => {
          const item = new vscode.CompletionItem(
            kw,
            vscode.CompletionItemKind.Keyword
          );
          item.detail = "keyword";
          return item;
        });
      },
    }
  );

  // Completion provider for types
  const typeProvider = vscode.languages.registerCompletionItemProvider(
    "vibe",
    {
      provideCompletionItems() {
        return TYPES.map((t) => {
          const item = new vscode.CompletionItem(
            t,
            vscode.CompletionItemKind.TypeParameter
          );
          item.detail = "type";
          return item;
        });
      },
    }
  );

  // Hover provider for builtins
  const hoverProvider = vscode.languages.registerHoverProvider("vibe", {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(position);
      if (!range) {
        return undefined;
      }

      const word = document.getText(range);
      const doc = BUILTINS[word];

      if (doc) {
        const md = new vscode.MarkdownString();
        md.appendCodeblock(doc.signature, "vibe");
        md.appendMarkdown(`\n\n${doc.description}`);
        return new vscode.Hover(md, range);
      }

      return undefined;
    },
  });

  context.subscriptions.push(
    builtinProvider,
    keywordProvider,
    typeProvider,
    hoverProvider
  );
}

export function deactivate() {}

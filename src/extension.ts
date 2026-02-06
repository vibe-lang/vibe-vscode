import * as vscode from "vscode";
import * as cp from "child_process";
import * as path from "path";

// ---------------------------------------------------------------------------
// Builtin function documentation
// ---------------------------------------------------------------------------

interface BuiltinDoc {
  signature: string;
  methodStyle?: string;
  description: string;
}

const BUILTINS: Record<string, BuiltinDoc> = {
  // I/O
  puts: {
    signature: "puts(value)",
    description: "Prints value to stdout with a newline.",
  },
  print: {
    signature: "print(value)",
    description: "Prints value to stdout without a newline.",
  },
  input: {
    signature: "input(prompt?)",
    description: "Reads a line of input from stdin.",
  },

  // Type conversion
  to_int: {
    signature: "to_int(value)",
    methodStyle: "value.to_int",
    description: "Converts a value to an integer.",
  },
  to_float: {
    signature: "to_float(value)",
    methodStyle: "value.to_float",
    description: "Converts a value to a float.",
  },
  to_string: {
    signature: "to_string(value)",
    methodStyle: "value.to_string",
    description: "Converts a value to a string.",
  },
  type: {
    signature: "type(value)",
    methodStyle: "value.type",
    description: 'Returns the type name of a value (e.g., "int", "string").',
  },

  // JSON
  to_json: {
    signature: "to_json(value)",
    methodStyle: "value.to_json",
    description: "Serializes a value to a JSON string.",
  },
  from_json: {
    signature: "from_json(str)",
    methodStyle: "str.from_json",
    description: "Parses a JSON string into a Vibe value.",
  },

  // Array functions
  len: {
    signature: "len(array_or_string)",
    methodStyle: "value.len",
    description: "Returns the length of an array or string.",
  },
  push: {
    signature: "push(array, value)",
    methodStyle: "array.push(value)",
    description: "Appends a value to the end of an array (mutates).",
  },
  pop: {
    signature: "pop(array)",
    methodStyle: "array.pop",
    description: "Removes and returns the last element of an array.",
  },
  shift: {
    signature: "shift(array)",
    methodStyle: "array.shift",
    description: "Removes and returns the first element of an array.",
  },
  first: {
    signature: "first(array)",
    methodStyle: "array.first",
    description: "Returns the first element of an array.",
  },
  last: {
    signature: "last(array)",
    methodStyle: "array.last",
    description: "Returns the last element of an array.",
  },
  flatten: {
    signature: "flatten(array)",
    methodStyle: "array.flatten",
    description: "Flattens a nested array by one level.",
  },
  includes: {
    signature: "includes(array, value)",
    methodStyle: "array.includes(value)",
    description: "Returns true if the array contains the value.",
  },
  index_of: {
    signature: "index_of(array, value)",
    methodStyle: "array.index_of(value)",
    description:
      "Returns the index of value in the array, or -1 if not found.",
  },
  remove_at: {
    signature: "remove_at(array, index)",
    description:
      "Removes and returns the element at index (supports negative indices).",
  },

  // Higher-order array functions
  map: {
    signature: "map(array, fn)",
    methodStyle: "array.map(fn)",
    description: "Applies fn to each element, returns a new array.",
  },
  filter: {
    signature: "filter(array, fn)",
    methodStyle: "array.filter(fn)",
    description: "Returns elements where fn returns true.",
  },
  each: {
    signature: "each(array, fn)",
    methodStyle: "array.each(fn)",
    description: "Calls fn for each element (for side effects).",
  },
  reduce: {
    signature: "reduce(array, initial, fn)",
    methodStyle: "array.reduce(initial, fn)",
    description:
      "Reduces an array to a single value using fn(accumulator, element).",
  },
  find: {
    signature: "find(array, fn)",
    methodStyle: "array.find(fn)",
    description: "Returns the first element where fn returns true, or nil.",
  },
  any: {
    signature: "any(array, fn)",
    methodStyle: "array.any(fn)",
    description: "Returns true if fn returns true for any element.",
  },
  all: {
    signature: "all(array, fn)",
    methodStyle: "array.all(fn)",
    description: "Returns true if fn returns true for all elements.",
  },
  flat_map: {
    signature: "flat_map(array, fn)",
    methodStyle: "array.flat_map(fn)",
    description: "Maps fn over array and flattens the result by one level.",
  },
  zip: {
    signature: "zip(array1, array2)",
    methodStyle: "array1.zip(array2)",
    description: "Combines two arrays into an array of pairs.",
  },
  take: {
    signature: "take(array, n)",
    methodStyle: "array.take(n)",
    description: "Returns the first n elements.",
  },
  drop: {
    signature: "drop(array, n)",
    methodStyle: "array.drop(n)",
    description: "Returns all elements after the first n.",
  },
  chunk: {
    signature: "chunk(array, size)",
    methodStyle: "array.chunk(size)",
    description: "Splits the array into chunks of the given size.",
  },
  group_by: {
    signature: "group_by(array, fn)",
    methodStyle: "array.group_by(fn)",
    description: "Groups elements by the result of fn.",
  },
  sort_by: {
    signature: "sort_by(array, fn)",
    methodStyle: "array.sort_by(fn)",
    description: "Sorts elements by the result of fn.",
  },
  min_by: {
    signature: "min_by(array, fn)",
    methodStyle: "array.min_by(fn)",
    description: "Returns the element with the minimum value of fn.",
  },
  max_by: {
    signature: "max_by(array, fn)",
    methodStyle: "array.max_by(fn)",
    description: "Returns the element with the maximum value of fn.",
  },
  each_with_index: {
    signature: "each_with_index(array, fn)",
    methodStyle: "array.each_with_index(fn)",
    description: "Calls fn(element, index) for each element.",
  },
  map_with_index: {
    signature: "map_with_index(array, fn)",
    methodStyle: "array.map_with_index(fn)",
    description: "Maps fn(element, index) over the array.",
  },
  tally: {
    signature: "tally(array)",
    methodStyle: "array.tally",
    description: "Counts occurrences of each element, returns a hash.",
  },
  sort: {
    signature: "sort(array)",
    methodStyle: "array.sort",
    description: "Returns a sorted copy of the array.",
  },
  reverse: {
    signature: "reverse(array)",
    methodStyle: "array.reverse",
    description: "Returns a reversed copy of the array.",
  },

  // String functions
  trim: {
    signature: "trim(string)",
    methodStyle: "string.trim",
    description: "Removes leading and trailing whitespace.",
  },
  split: {
    signature: "split(string, delimiter)",
    methodStyle: 'string.split(",")',
    description: "Splits a string by delimiter into an array.",
  },
  join: {
    signature: "join(array, separator)",
    methodStyle: 'array.join(", ")',
    description: "Joins array elements into a string with separator.",
  },
  replace: {
    signature: "replace(string, old, new)",
    methodStyle: 'string.replace("old", "new")',
    description: "Replaces all occurrences of old with new.",
  },
  upcase: {
    signature: "upcase(string)",
    methodStyle: "string.upcase",
    description: "Converts string to uppercase.",
  },
  downcase: {
    signature: "downcase(string)",
    methodStyle: "string.downcase",
    description: "Converts string to lowercase.",
  },
  capitalize: {
    signature: "capitalize(string)",
    methodStyle: "string.capitalize",
    description: "Capitalizes the first character.",
  },
  starts_with: {
    signature: "starts_with(string, prefix)",
    methodStyle: 'string.starts_with("prefix")',
    description: "Returns true if string starts with prefix.",
  },
  ends_with: {
    signature: "ends_with(string, suffix)",
    methodStyle: 'string.ends_with("suffix")',
    description: "Returns true if string ends with suffix.",
  },
  repeat: {
    signature: "repeat(string, count)",
    methodStyle: "string.repeat(3)",
    description: "Repeats the string count times.",
  },
  chars: {
    signature: "chars(string)",
    methodStyle: "string.chars",
    description: "Splits string into an array of characters.",
  },
  pad_start: {
    signature: "pad_start(string, length, pad_char?)",
    methodStyle: 'string.pad_start(10, "0")',
    description: "Pads string from the start to the given length.",
  },
  pad_end: {
    signature: "pad_end(string, length, pad_char?)",
    methodStyle: 'string.pad_end(10, " ")',
    description: "Pads string from the end to the given length.",
  },
  string_reverse: {
    signature: "string_reverse(string)",
    methodStyle: "string.string_reverse",
    description: "Reverses a string.",
  },
  string_slice: {
    signature: "string_slice(string, start, end)",
    methodStyle: "string.string_slice(0, 5)",
    description: "Returns a substring from start to end index.",
  },
  string_contains: {
    signature: "string_contains(string, substring)",
    methodStyle: 'string.string_contains("sub")',
    description: "Returns true if string contains substring.",
  },
  index_of_string: {
    signature: "index_of_string(string, substring)",
    methodStyle: 'string.index_of_string("sub")',
    description:
      "Returns the index of substring in string, or -1 if not found.",
  },

  // Hash functions
  keys: {
    signature: "keys(hash)",
    methodStyle: "hash.keys",
    description: "Returns an array of all keys in the hash.",
  },
  values: {
    signature: "values(hash)",
    methodStyle: "hash.values",
    description: "Returns an array of all values in the hash.",
  },
  has_key: {
    signature: "has_key(hash, key)",
    methodStyle: 'hash.has_key("key")',
    description: "Returns true if the hash contains the key.",
  },
  merge: {
    signature: "merge(hash1, hash2)",
    methodStyle: "hash1.merge(hash2)",
    description: "Merges two hashes, with hash2 values taking precedence.",
  },
  delete: {
    signature: "delete(hash, key)",
    description: "Removes a key from the hash and returns its value.",
  },

  // Concurrency
  spawn: {
    signature: "spawn(fn)",
    description: "Runs a function in a new goroutine, returns a Task.",
  },
  await: {
    signature: "await(task)",
    description: "Waits for a task to complete and returns its result.",
  },
  send: {
    signature: "send(channel, value)",
    description: "Sends a value to a channel.",
  },
  receive: {
    signature: "receive(channel)",
    description: "Receives a value from a channel (blocks until available).",
  },
  Channel: {
    signature: "Channel()",
    description: "Creates a new channel for inter-goroutine communication.",
  },
  Range: {
    signature: "Range(start, end, exclusive?)",
    description:
      "Creates a range from start to end (exclusive if third arg is true).",
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
// Document Symbol Provider (Outline view)
// ---------------------------------------------------------------------------

class VibeDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
  provideDocumentSymbols(
    document: vscode.TextDocument
  ): vscode.DocumentSymbol[] {
    const symbols: vscode.DocumentSymbol[] = [];
    const text = document.getText();
    const lines = text.split("\n");

    const patterns: {
      regex: RegExp;
      kind: vscode.SymbolKind;
      nameGroup: number;
    }[] = [
      {
        regex: /^\s*def\s+([a-zA-Z_]\w*)/,
        kind: vscode.SymbolKind.Function,
        nameGroup: 1,
      },
      {
        regex: /^\s*class\s+([A-Z]\w*)/,
        kind: vscode.SymbolKind.Class,
        nameGroup: 1,
      },
      {
        regex: /^\s*struct\s+([A-Z]\w*)/,
        kind: vscode.SymbolKind.Struct,
        nameGroup: 1,
      },
      {
        regex: /^\s*enum\s+([A-Z]\w*)/,
        kind: vscode.SymbolKind.Enum,
        nameGroup: 1,
      },
      {
        regex: /^\s*const\s+([A-Z_]\w*)\s*=/,
        kind: vscode.SymbolKind.Constant,
        nameGroup: 1,
      },
    ];

    // Track block nesting to find end lines
    const blockStack: { symbol: vscode.DocumentSymbol; depth: number }[] = [];
    let depth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check for symbol definitions
      for (const pat of patterns) {
        const match = line.match(pat.regex);
        if (match) {
          const name = match[pat.nameGroup];
          const startPos = new vscode.Position(i, line.indexOf(name));
          const range = new vscode.Range(startPos, new vscode.Position(i, line.length));
          const symbol = new vscode.DocumentSymbol(
            name,
            "",
            pat.kind,
            range,
            range
          );

          // If we're inside a class/struct, add as child
          if (
            blockStack.length > 0 &&
            (pat.kind === vscode.SymbolKind.Function ||
              pat.kind === vscode.SymbolKind.Enum)
          ) {
            const parent = blockStack[blockStack.length - 1];
            parent.symbol.children.push(symbol);
          } else {
            symbols.push(symbol);
          }

          // Block-opening keywords push onto the stack
          if (
            pat.kind === vscode.SymbolKind.Class ||
            pat.kind === vscode.SymbolKind.Struct ||
            pat.kind === vscode.SymbolKind.Enum ||
            pat.kind === vscode.SymbolKind.Function
          ) {
            blockStack.push({ symbol, depth });
          }
          break;
        }
      }

      // Track depth via block-opening keywords
      if (
        /^\s*(def|class|struct|enum|if|unless|until|while|for|case|try)\b/.test(
          trimmed
        )
      ) {
        depth++;
      }

      // end keyword closes a block
      if (/^\s*end\b/.test(trimmed)) {
        depth--;
        if (blockStack.length > 0) {
          const top = blockStack[blockStack.length - 1];
          if (depth <= top.depth) {
            // Update the range to include the end line
            top.symbol.range = new vscode.Range(
              top.symbol.range.start,
              new vscode.Position(i, line.length)
            );
            blockStack.pop();
          }
        }
      }
    }

    return symbols;
  }
}

// ---------------------------------------------------------------------------
// Diagnostics Provider (run interpreter on save)
// ---------------------------------------------------------------------------

let diagnosticCollection: vscode.DiagnosticCollection;

function runDiagnostics(document: vscode.TextDocument) {
  if (document.languageId !== "vibe") {
    return;
  }

  const config = vscode.workspace.getConfiguration("vibe");
  if (!config.get<boolean>("enableDiagnostics", true)) {
    diagnosticCollection.delete(document.uri);
    return;
  }

  const vibePath = config.get<string>("executablePath", "vibe");
  const filePath = document.fileName;

  // Run the interpreter to check for errors
  cp.execFile(
    vibePath,
    [filePath],
    { timeout: 5000, maxBuffer: 1024 * 256 },
    (error, _stdout, stderr) => {
      const diagnostics: vscode.Diagnostic[] = [];

      if (error && stderr) {
        // Parse error output -- Vibe errors look like: [line:col] message
        // or: Error: message at line X
        const errorLines = stderr.split("\n");
        for (const errLine of errorLines) {
          if (!errLine.trim()) {
            continue;
          }

          let line = 0;
          let col = 0;
          let message = errLine.trim();

          // Try to match [line:col] format
          const bracketMatch = errLine.match(/\[(\d+):(\d+)\]\s*(.*)/);
          if (bracketMatch) {
            line = Math.max(0, parseInt(bracketMatch[1], 10) - 1);
            col = Math.max(0, parseInt(bracketMatch[2], 10) - 1);
            message = bracketMatch[3];
          } else {
            // Try to match "line N" format
            const lineMatch = errLine.match(/line\s+(\d+)/i);
            if (lineMatch) {
              line = Math.max(0, parseInt(lineMatch[1], 10) - 1);
            }
          }

          const range = new vscode.Range(
            new vscode.Position(line, col),
            new vscode.Position(line, Number.MAX_SAFE_INTEGER)
          );

          diagnostics.push(
            new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error)
          );
        }
      }

      diagnosticCollection.set(document.uri, diagnostics);
    }
  );
}

// ---------------------------------------------------------------------------
// Run Command
// ---------------------------------------------------------------------------

function runVibeFile() {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "vibe") {
    vscode.window.showErrorMessage("No Vibe file is currently open.");
    return;
  }

  // Save the file first
  editor.document.save().then(() => {
    const config = vscode.workspace.getConfiguration("vibe");
    const vibePath = config.get<string>("executablePath", "vibe");
    const filePath = editor.document.fileName;
    const fileName = path.basename(filePath);

    // Get or create a terminal
    let terminal = vscode.window.terminals.find(
      (t) => t.name === "Vibe"
    );
    if (!terminal) {
      terminal = vscode.window.createTerminal("Vibe");
    }

    terminal.show();
    terminal.sendText(`${vibePath} ${filePath}`);
  });
}

// ---------------------------------------------------------------------------
// Activation
// ---------------------------------------------------------------------------

export function activate(context: vscode.ExtensionContext) {
  // --- Completions ---

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

  // --- Hover ---

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
        if (doc.methodStyle) {
          md.appendMarkdown(`*Also:* \`${doc.methodStyle}\`\n\n`);
        }
        md.appendMarkdown(doc.description);
        return new vscode.Hover(md, range);
      }

      return undefined;
    },
  });

  // --- Document Symbols (Outline) ---

  const symbolProvider = vscode.languages.registerDocumentSymbolProvider(
    "vibe",
    new VibeDocumentSymbolProvider()
  );

  // --- Diagnostics ---

  diagnosticCollection =
    vscode.languages.createDiagnosticCollection("vibe");

  // Run diagnostics on save
  const onSave = vscode.workspace.onDidSaveTextDocument((document) => {
    if (document.languageId === "vibe") {
      runDiagnostics(document);
    }
  });

  // Run diagnostics on open
  const onOpen = vscode.workspace.onDidOpenTextDocument((document) => {
    if (document.languageId === "vibe") {
      runDiagnostics(document);
    }
  });

  // Clear diagnostics when file is closed
  const onClose = vscode.workspace.onDidCloseTextDocument((document) => {
    diagnosticCollection.delete(document.uri);
  });

  // Run diagnostics for already-open files
  if (vscode.window.activeTextEditor) {
    runDiagnostics(vscode.window.activeTextEditor.document);
  }

  // --- Run Command ---

  const runCommand = vscode.commands.registerCommand(
    "vibe.run",
    runVibeFile
  );

  // --- Register all ---

  context.subscriptions.push(
    builtinProvider,
    keywordProvider,
    typeProvider,
    hoverProvider,
    symbolProvider,
    diagnosticCollection,
    onSave,
    onOpen,
    onClose,
    runCommand
  );
}

export function deactivate() {
  if (diagnosticCollection) {
    diagnosticCollection.dispose();
  }
}

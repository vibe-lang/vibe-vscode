import * as vscode from "vscode";
import * as path from "path";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";

let client: LanguageClient | undefined;

// ---------------------------------------------------------------------------
// Run Command
// ---------------------------------------------------------------------------

function runVibeFile() {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "vibe") {
    vscode.window.showErrorMessage("No Vibe file is currently open.");
    return;
  }

  editor.document.save().then(() => {
    const config = vscode.workspace.getConfiguration("vibe");
    const vibePath = config.get<string>("executablePath", "vibe");
    const filePath = editor.document.fileName;

    let terminal = vscode.window.terminals.find((t) => t.name === "Vibe");
    if (!terminal) {
      terminal = vscode.window.createTerminal("Vibe");
    }

    terminal.show();
    terminal.sendText(`${vibePath} run ${filePath}`);
  });
}

// ---------------------------------------------------------------------------
// LSP Client
// ---------------------------------------------------------------------------

async function startLanguageClient(
  context: vscode.ExtensionContext
): Promise<boolean> {
  const config = vscode.workspace.getConfiguration("vibe");
  const lspPath = config.get<string>("lspPath", "vibe-lsp");

  // Check if the LSP binary exists
  try {
    const { execFileSync } = require("child_process");
    execFileSync("which", [lspPath], { stdio: "pipe" });
  } catch {
    // Try common installation paths
    const homeLsp = path.join(
      process.env.HOME || "",
      ".vibe",
      "bin",
      "vibe-lsp"
    );
    try {
      const fs = require("fs");
      if (fs.existsSync(homeLsp)) {
        return startLSPWithPath(context, homeLsp);
      }
    } catch {
      // Ignore
    }

    // LSP binary not found
    return false;
  }

  return startLSPWithPath(context, lspPath);
}

function startLSPWithPath(
  context: vscode.ExtensionContext,
  lspPath: string
): boolean {
  const serverOptions: ServerOptions = {
    command: lspPath,
    args: [],
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "vibe" }],
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher("**/*.vb"),
    },
  };

  client = new LanguageClient(
    "vibe-lsp",
    "Vibe Language Server",
    serverOptions,
    clientOptions
  );

  client.start();
  return true;
}

// ---------------------------------------------------------------------------
// Activation
// ---------------------------------------------------------------------------

export async function activate(context: vscode.ExtensionContext) {
  // Register the run command (always available)
  const runCommand = vscode.commands.registerCommand("vibe.run", runVibeFile);
  context.subscriptions.push(runCommand);

  // Try to start the LSP client
  const lspStarted = await startLanguageClient(context);

  if (lspStarted) {
    // LSP handles diagnostics, completions, hover, symbols, and definition
    vscode.window.setStatusBarMessage("Vibe LSP: active", 3000);
  } else {
    // No LSP available -- fall back to built-in providers
    vscode.window.setStatusBarMessage(
      "Vibe: LSP not found, using basic mode",
      5000
    );
    registerFallbackProviders(context);
  }
}

export async function deactivate(): Promise<void> {
  if (client) {
    await client.stop();
  }
}

// ---------------------------------------------------------------------------
// Fallback providers (used when LSP binary is not installed)
// ---------------------------------------------------------------------------

interface BuiltinDoc {
  signature: string;
  methodStyle?: string;
  description: string;
}

const BUILTINS: Record<string, BuiltinDoc> = {
  puts: { signature: "puts(value)", description: "Prints value to stdout with a newline." },
  print: { signature: "print(value)", description: "Prints value to stdout without a newline." },
  input: { signature: "input(prompt?)", description: "Reads a line of input from stdin." },
  len: { signature: "len(array_or_string)", methodStyle: "value.len", description: "Returns the length." },
  push: { signature: "push(array, value)", methodStyle: "array.push(value)", description: "Appends to array." },
  pop: { signature: "pop(array)", methodStyle: "array.pop", description: "Removes and returns last element." },
  map: { signature: "map(array, fn)", methodStyle: "array.map(fn)", description: "Applies fn to each element." },
  filter: { signature: "filter(array, fn)", methodStyle: "array.filter(fn)", description: "Filters elements." },
  each: { signature: "each(array, fn)", methodStyle: "array.each(fn)", description: "Iterates for side effects." },
  reduce: { signature: "reduce(array, initial, fn)", methodStyle: "array.reduce(init, fn)", description: "Reduces to single value." },
  sort: { signature: "sort(array)", methodStyle: "array.sort", description: "Returns sorted copy." },
  reverse: { signature: "reverse(array)", methodStyle: "array.reverse", description: "Returns reversed copy." },
  trim: { signature: "trim(string)", methodStyle: "string.trim", description: "Removes whitespace." },
  split: { signature: "split(string, delim)", methodStyle: "string.split(delim)", description: "Splits string." },
  join: { signature: "join(array, sep)", methodStyle: "array.join(sep)", description: "Joins array." },
  replace: { signature: "replace(string, old, new)", methodStyle: "string.replace(old, new)", description: "Replaces occurrences." },
  upcase: { signature: "upcase(string)", methodStyle: "string.upcase", description: "Converts to uppercase." },
  downcase: { signature: "downcase(string)", methodStyle: "string.downcase", description: "Converts to lowercase." },
  keys: { signature: "keys(hash)", methodStyle: "hash.keys", description: "Returns array of keys." },
  values: { signature: "values(hash)", methodStyle: "hash.values", description: "Returns array of values." },
  type: { signature: "type(value)", methodStyle: "value.type", description: "Returns type name." },
  format: { signature: "format(template, args...)", description: "Sprintf-style formatting." },
  Error: { signature: "Error(message, data?)", description: "Creates structured error." },
};

const KEYWORDS = [
  "def", "end", "fn", "let", "const", "if", "elsif", "else",
  "unless", "until", "while", "for", "in", "case", "when",
  "break", "continue", "return", "class", "struct", "enum",
  "prop", "try", "catch", "throw", "finally", "import",
  "self", "super", "true", "false", "nil",
];

const TYPES = ["int", "float", "string", "boolean", "nil", "any"];

function registerFallbackProviders(context: vscode.ExtensionContext) {
  // Completion
  const builtinProvider = vscode.languages.registerCompletionItemProvider("vibe", {
    provideCompletionItems() {
      const items: vscode.CompletionItem[] = [];
      for (const [name, doc] of Object.entries(BUILTINS)) {
        const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Function);
        item.detail = doc.signature;
        item.documentation = new vscode.MarkdownString(doc.description);
        items.push(item);
      }
      for (const kw of KEYWORDS) {
        const item = new vscode.CompletionItem(kw, vscode.CompletionItemKind.Keyword);
        item.detail = "keyword";
        items.push(item);
      }
      for (const t of TYPES) {
        const item = new vscode.CompletionItem(t, vscode.CompletionItemKind.TypeParameter);
        item.detail = "type";
        items.push(item);
      }
      return items;
    },
  });

  // Hover
  const hoverProvider = vscode.languages.registerHoverProvider("vibe", {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(position);
      if (!range) return undefined;
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

  // Document symbols
  const symbolProvider = vscode.languages.registerDocumentSymbolProvider("vibe", {
    provideDocumentSymbols(document) {
      const symbols: vscode.DocumentSymbol[] = [];
      const text = document.getText();
      const lines = text.split("\n");
      const patterns: { regex: RegExp; kind: vscode.SymbolKind }[] = [
        { regex: /^\s*def\s+([a-zA-Z_]\w*)/, kind: vscode.SymbolKind.Function },
        { regex: /^\s*class\s+([A-Z]\w*)/, kind: vscode.SymbolKind.Class },
        { regex: /^\s*struct\s+([A-Z]\w*)/, kind: vscode.SymbolKind.Struct },
        { regex: /^\s*enum\s+([A-Z]\w*)/, kind: vscode.SymbolKind.Enum },
        { regex: /^\s*const\s+([A-Z_]\w*)\s*=/, kind: vscode.SymbolKind.Constant },
      ];
      for (let i = 0; i < lines.length; i++) {
        for (const pat of patterns) {
          const match = lines[i].match(pat.regex);
          if (match) {
            const name = match[1];
            const range = new vscode.Range(i, 0, i, lines[i].length);
            symbols.push(new vscode.DocumentSymbol(name, "", pat.kind, range, range));
            break;
          }
        }
      }
      return symbols;
    },
  });

  // Diagnostics (run interpreter on save)
  const diagnosticCollection = vscode.languages.createDiagnosticCollection("vibe");
  const onSave = vscode.workspace.onDidSaveTextDocument((document) => {
    if (document.languageId !== "vibe") return;
    const config = vscode.workspace.getConfiguration("vibe");
    if (!config.get<boolean>("enableDiagnostics", true)) return;
    const vibePath = config.get<string>("executablePath", "vibe");
    const { execFile } = require("child_process");
    execFile(vibePath, ["run", document.fileName], { timeout: 5000 }, (error: any, _stdout: string, stderr: string) => {
      const diagnostics: vscode.Diagnostic[] = [];
      if (error && stderr) {
        for (const line of stderr.split("\n")) {
          if (!line.trim()) continue;
          let ln = 0, col = 0, msg = line.trim();
          const m = line.match(/\[(\d+):(\d+)\]\s*(.*)/);
          if (m) { ln = Math.max(0, parseInt(m[1]) - 1); col = Math.max(0, parseInt(m[2]) - 1); msg = m[3]; }
          diagnostics.push(new vscode.Diagnostic(
            new vscode.Range(ln, col, ln, Number.MAX_SAFE_INTEGER),
            msg, vscode.DiagnosticSeverity.Error
          ));
        }
      }
      diagnosticCollection.set(document.uri, diagnostics);
    });
  });

  context.subscriptions.push(builtinProvider, hoverProvider, symbolProvider, diagnosticCollection, onSave);
}

# Vibe Language for Visual Studio Code

Syntax highlighting, IntelliSense, and snippets for the [Vibe programming language](https://github.com/vibe-lang/vibe).

## Features

### Syntax Highlighting

Full TextMate grammar covering all Vibe syntax:

- Keywords, operators, and control flow
- Function, class, struct, and enum definitions
- String interpolation (`${expression}`)
- Triple-quoted multi-line strings
- Type annotations (`x: int`, `name: string?`, `items: int[]`)
- Comments (`#` and `//`)
- Numeric literals (integers and floats)
- Built-in function recognition

### IntelliSense

- **Completions** for 60+ built-in functions, all keywords, and type names
- **Hover documentation** showing signatures and descriptions for every built-in

### Snippets

Quickly scaffold common patterns:

| Prefix | Description |
|--------|-------------|
| `def` | Function definition |
| `deft` | Function with return type |
| `fn` | Anonymous function |
| `arr` | Arrow function |
| `if` | If block |
| `ife` | If/else block |
| `unless` | Unless block |
| `for` | For-in loop |
| `forkv` | For loop with key-value |
| `while` | While loop |
| `until` | Until loop |
| `class` | Class definition |
| `classi` | Class with inheritance |
| `struct` | Struct definition |
| `enum` | Enum definition |
| `try` | Try-catch block |
| `tryf` | Try-catch-finally block |
| `case` | Case-when expression |
| `import` | Import statement |

### Editor Features

- **Comment toggling**: `Cmd+/` (`Ctrl+/`) toggles `#` line comments
- **Auto-indentation**: Smart indent after `def`, `if`, `class`, `for`, etc.
- **Bracket matching**: Highlights matching `()`, `[]`, `{}`
- **Auto-closing pairs**: Automatically closes brackets, quotes, and parentheses
- **Code folding**: Fold/unfold `def`...`end`, `class`...`end`, `if`...`end` blocks

## Installation

Search for **"Vibe Language"** in the VS Code Extensions panel, or install from the command line:

```bash
code --install-extension vibe-lang.vibe-language
```

## Install the Vibe Interpreter

```bash
curl -fsSL https://raw.githubusercontent.com/vibe-lang/vibe/main/install.sh | sh
```

## Example

```vibe
# Define a struct
struct Person
  name: string
  age: int
end

# Define a function
def greet(person: Person): string
  "Hello, ${person.name}! You are ${person.age} years old."
end

# Create and use
alice = Person(name: "Alice", age: 30)
puts(greet(alice))

# Higher-order functions
numbers = [1, 2, 3, 4, 5]
squares = numbers |> map(fn(n) { n ** 2 }) |> filter(fn(n) { n > 5 })
puts(squares)
```

## Links

- [Vibe Language](https://github.com/vibe-lang/vibe)
- [Extension Source](https://github.com/vibe-lang/vibe-vscode)
- [Report Issues](https://github.com/vibe-lang/vibe-vscode/issues)

## License

MIT

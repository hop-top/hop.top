# Configuration Reference: hop.top

## Config File

Default location: `~/.config/hop.top/config.yaml`

```yaml
# Example configuration
verbose: false
output: text       # text | json | table
```

## Environment Variables

All config keys can be set via environment variables.
Prefix with `hop.top_` and uppercase:

```sh
export hop.top_VERBOSE=true
export hop.top_OUTPUT=json
```

## Precedence

Configuration is resolved in this order (highest wins):

1. Command-line flags
2. Environment variables
3. Project-local config file
4. User config file
5. Built-in defaults

## Available Options

| Key       | Type    | Default | Description       |
|-----------|---------|---------|-------------------|
| `verbose` | bool    | false   | Enable verbose    |
| `output`  | string  | text    | Output format     |

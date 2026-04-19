# Getting Started with hop.top

## Quick Start

1. Install hop.top (see [install](install.md))

2. Initialize a new project:
   ```sh
   hop.top init
   ```

3. Run your first command:
   ```sh
   hop.top help
   ```

## Basic Usage

```sh
# Show help
hop.top --help

# Show version
hop.top --version

# Run with verbose output
hop.top --verbose <command>
```

## Configuration

hop.top looks for configuration in:

1. `./hop.top.yaml` (project-local)
2. `~/.config/hop.top/config.yaml` (user)
3. Environment variables prefixed with
   `hop.top_` (uppercase)

See [configuration](configuration.md) for details.

## Next Steps

- [Configuration Reference](configuration.md)
- [Commands Reference](commands.md)
- [Troubleshooting](troubleshooting.md)

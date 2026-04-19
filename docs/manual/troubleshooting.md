# Troubleshooting hop.top

## Common Issues

### Command not found

Ensure hop.top is installed and on your PATH:

```sh
which hop.top
```

If missing, reinstall (see [install](install.md)).

### Permission denied

Check file permissions. On Unix systems:

```sh
chmod +x $(which hop.top)
```

### Config not loading

Verify config file location and syntax:

```sh
hop.top --verbose <command>
```

This prints which config files were loaded.

### Unexpected output format

Set the output format explicitly:

```sh
hop.top --output json <command>
```

## Debug Mode

Run with verbose output for detailed diagnostics:

```sh
hop.top --verbose <command>
```

## Getting Help

1. Check this troubleshooting guide
2. Search existing issues on GitHub
3. Open a new issue with:
   - hop.top version (`hop.top --version`)
   - OS and architecture
   - Steps to reproduce
   - Expected vs actual behavior

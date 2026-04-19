# Upgrading hop.top

## Check Current Version

```sh
hop.top --version
```

## Upgrade Methods

### Go

```sh
go install github.com/hop-top/hop.top@latest
```

### npm

```sh
npm update -g hop.top
```

### pip

```sh
pip install --upgrade hop.top
```

### Homebrew

```sh
brew upgrade hop.top
```

## Breaking Changes

Check the CHANGELOG for breaking changes between
versions before upgrading.

## Rollback

If an upgrade causes issues, install the previous
version explicitly:

```sh
# Go
go install github.com/hop-top/hop.top@v<PREVIOUS_VERSION>

# npm
npm install -g hop.top@<PREVIOUS_VERSION>

# pip
pip install hop.top==<PREVIOUS_VERSION>
```

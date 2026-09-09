FROM mcr.microsoft.com/devcontainers/base:bookworm

ARG DEVBOX_VERSION=0.18.0
ENV DEVBOX_USE_VERSION=${DEVBOX_VERSION}

# Install devbox (https://github.com/jetify-com/devbox)
# DEVBOX_USE_VERSION keeps the installer wrapper on the reviewed CLI release.
RUN curl -fsSL https://get.jetify.com/devbox | bash -s -- -f \
    && chmod 0755 /usr/local/bin/devbox

USER vscode

# Devbox needs Nix. A daemonless install works in the container without
# requiring systemd or a separately managed nix-daemon service.
RUN curl -fsSL https://nixos.org/nix/install | sh -s -- --no-daemon

ENV PATH="/home/vscode/.nix-profile/bin:/home/vscode/.devbox/nix/profile/default/bin:${PATH}"

# Resolve the pinned toolchain during the image build. The mounted workspace
# uses the same lockfile, so its first post-create run reuses these store paths.
COPY --chown=vscode:vscode devbox.json devbox.lock /tmp/hop-top-devbox/
RUN devbox install --config /tmp/hop-top-devbox

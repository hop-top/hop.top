import { Command } from "commander";

export function createProgram(): Command {
  const program = new Command()
    .name("hop.top")
    .description("Ecosystem hub — marketing site, edge router, Go vanity imports")
    .version("0.0.0")
    .option("-f, --format <type>", "output format", "text")
    .option("-v, --verbose", "verbose output");

  return program;
}

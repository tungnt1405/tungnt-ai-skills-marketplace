#!/usr/bin/env node
import { runCli } from '../installer/cli.js';

process.exitCode = runCli(process.argv.slice(2), process.env);

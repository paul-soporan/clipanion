import {Command} from './Command'
import {CompletionServiceCommand} from './entries/completion-service';
import {CompletionSetupCommand} from './entries/completion-setup';
import {HelpCommand} from "./entries/help";
import {VersionCommand} from "./entries/version";

Command.Entries.CompletionService = CompletionServiceCommand;
Command.Entries.CompletionSetup = CompletionSetupCommand;
Command.Entries.Help = HelpCommand
Command.Entries.Version = VersionCommand

export {Command}

export {CompletionTree}                                   from '../core';
export {BaseContext, Cli, CliOptions}                     from './Cli';
export {CommandClass, Usage, Definition, Schema}          from './Command';

export {UsageError}                                       from '../errors';

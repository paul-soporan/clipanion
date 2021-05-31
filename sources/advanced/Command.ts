import {Coercion, LooseTest}                             from 'typanion';

import {BaseContext, MiniCli}                            from './Cli';
import {formatError, isOptionSymbol, CompletionFunction} from './options/utils';

/**
 * The usage of a Command.
 */
export type Usage = {
  /**
   * The category of the command.
   *
   * Included in the detailed usage.
   */
  category?: string;

  /**
   * The short description of the command, formatted as Markdown.
   *
   * Included in the detailed usage.
   */
  description?: string;

  /**
   * The extended details of the command, formatted as Markdown.
   *
   * Included in the detailed usage.
   */
  details?: string;

  /**
   * Examples of the command represented as an Array of tuples.
   *
   * The first element of the tuple represents the description of the example.
   *
   * The second element of the tuple represents the command of the example.
   * If present, the leading `$0` is replaced with `cli.binaryName`.
   */
  examples?: Array<[string, string]>;
};

/**
 * The definition of a Command.
 */
export type Definition = Usage & {
  /**
   * The path of the command, starting with `cli.binaryName`.
   */
  path: string;

  /**
   * The detailed usage of the command.
   */
  usage: string;

  /**
   * The various options registered on the command.
   */
  options: Array<{
    definition: string;
    description?: string;
    required: boolean;
  }>;
};

export type CommandClass<Context extends BaseContext = BaseContext> = {
  new(): Command<Context>;
  paths?: Array<Array<string>>;
  schema?: Array<LooseTest<{[key: string]: unknown}>>;
  usage?: Usage;
};

export abstract class Command<Context extends BaseContext = BaseContext> {
  /**
   * @deprecated Do not use this; prefer the static `paths` property instead.
   */
  paths?: undefined;

  /**
   * Paths under which the command should be exposed.
   */
  static paths?: Array<Array<string>>;

  /**
   * Defines the usage information for the given command.
   */
  static Usage(usage: Usage) {
    return usage;
  }

  /**
   * Contains the usage information for the command. If undefined, the
   * command will be hidden from the general listing.
   */
  static usage?: Usage;

  /**
   * Defines a schema to apply before running the `execute` method. The
   * schema is expected to be generated by Typanion.
   *
   * @see https://github.com/arcanis/typanion
   */
  static schema?: Array<LooseTest<{[key: string]: unknown}>>;

  /**
   * Standard function that'll get executed by `Cli#run` and `Cli#runExit`.
   *
   * Expected to return an exit code or nothing (which Clipanion will treat
   * as if 0 had been returned).
   */
  abstract execute(): Promise<number | void>;

  /**
   * Standard error handler which will simply rethrow the error. Can be used
   * to add custom logic to handle errors from the command or simply return
   * the parent class error handling.
   */
  async catch(error: any): Promise<void> {
    throw error;
  }

  /**
   * Predefined that will be set to true if `-h,--help` has been used, in
   * which case `Command#execute` won't be called.
   */
  help: boolean = false;

  /**
   * Predefined variable that will be populated with a miniature API that can
   * be used to query Clipanion and forward commands.
   */
  cli!: MiniCli<Context>;

  /**
   * Predefined variable that will be populated with the context of the
   * application.
   */
  context!: Context;

  /**
   * Predefined variable that will be populated with the path that got used
   * to access the command currently being executed.
   */
  path!: Array<string>;

  async validateAndExecute(): Promise<number> {
    const commandClass = this.constructor as CommandClass<Context>;
    const cascade = commandClass.schema;

    if (typeof cascade !== `undefined`) {
      const {isDict, isUnknown, applyCascade} = await import(`typanion`);
      const schema = applyCascade(isDict(isUnknown()), cascade);

      const errors: Array<string> = [];
      const coercions: Array<Coercion> = [];

      const check = schema(this, {errors, coercions});
      if (!check)
        throw formatError(`Invalid option schema`, errors);

      for (const [, op] of coercions) {
        op();
      }
    }

    const exitCode = await this.execute();
    if (typeof exitCode !== `undefined`) {
      return exitCode;
    } else {
      return 0;
    }
  }

  /**
   * Used to detect option definitions.
   */
  static isOption: typeof isOptionSymbol = isOptionSymbol;

  /**
   * Just an helper to use along with the `paths` fields, to make it
   * clearer that a command is the default one.
   *
   * @example
   * class MyCommand extends Command {
   *   static paths = [Command.Default];
   * }
   */
  static Default = [];
}

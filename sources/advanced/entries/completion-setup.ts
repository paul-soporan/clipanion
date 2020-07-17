import {Command} from '../Command';
import {UsageError} from '../../errors';

export class CompletionSetupCommand extends Command {
  @Command.String(`--setup`, {tolerateBoolean: true})
  setup: boolean | string = false;

  @Command.String(`--cleanup`, {tolerateBoolean: true})
  cleanup: boolean | string = false;

  @Command.Path(`completion`)
  async execute() {
    let omelette: typeof import('omelette');
    try {
      ({default: omelette} = await import(`omelette`));
    } catch {
      throw new UsageError(`omelette must be installed when using autocompletion`);
    }

    const completion = omelette(this.cli.binaryName);

    if (this.setup) {
      this.context.stdout.write(`Setting up the completion file...\n`);
      completion.setupShellInitFile(typeof this.setup === `string` ? this.setup : undefined);
    }

    if (this.cleanup) {
      this.context.stdout.write(`Cleaning up the completion file...\n`);
      // @ts-ignore: initFile argument is missing
      completion.cleanupShellInitFile(typeof this.cleanup === `string` ? this.cleanup : undefined);
    }
  }
}
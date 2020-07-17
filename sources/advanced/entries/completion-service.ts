import {Command} from '../Command';
import {UsageError} from '../../errors';

export class CompletionServiceCommand extends Command {
  @Command.Boolean(`--completion`)
  completion: boolean = false;

  @Command.Boolean(`--completion-fish`)
  completionFish: boolean = false;

  @Command.Boolean(`--compbash`)
  compbash: boolean = false;

  @Command.Boolean(`--compfish`)
  compfish: boolean = false;

  @Command.Boolean(`--compzsh`)
  compzsh: boolean = false;

  @Command.String(`--compgen`)
  compgen?: string;

  @Command.String({required: false})
  compgenSecond?: string;

  @Command.String({required: false})
  compgenThird?: string;

  async execute() {
    let omelette: typeof import('omelette');
    try {
      ({default: omelette} = await import(`omelette`));
    } catch {
      throw new UsageError(`omelette must be installed when using autocompletion`);
    }

    // @ts-ignore
    omelette(this.cli.binaryName).tree(this.cli.completionTree()).init();
  }
}
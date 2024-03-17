import {ConfigService} from "@nestjs/config";
import {exec} from "child_process";
import {Command, CommandRunner, SubCommand} from "nest-commander";
import * as Path from "path";

type GenerateParams = [string];

export const useExecCommand = async (command: string) => {
    console.log(`Execution of '${command}'`);
    return new Promise<void>((resolve) => {
        exec(command, (error, stdout, stderr) => {
            if (stdout) console.log(stdout);
            if (stderr) console.error(stderr);

            if (error && error?.code != 0) {
                console.error(`Process has finished with ${error.code} code`);
            } else {
                console.error(`Process has finished with zero exit code`);
            }
            resolve();
        });
    });
};

@SubCommand({name: "show", options: {isDefault: true}})
export class ShowMigrationsCommand extends CommandRunner {
    public async run(_ignoredParams: string[], _?: never): Promise<void> {
        await useExecCommand("typeorm-ts-node-commonjs -d ./ormconfig.ts migration:show");
    }
}

@SubCommand({name: "run"})
export class RunMigrationsCommand extends CommandRunner {
    public async run(_ignoredParams: string[], _?: never): Promise<void> {
        await useExecCommand("typeorm-ts-node-commonjs -d ./ormconfig.ts migration:run");
    }
}

@SubCommand({name: "revert"})
export class RevertMigrationsCommand extends CommandRunner {
    public async run(_ignoredParams: string[], _?: never): Promise<void> {
        await useExecCommand("typeorm-ts-node-commonjs -d ./ormconfig.ts migration:revert");
    }
}

@SubCommand({
    name: "generate",
    arguments: "<name>",
})
export class GenerateMigrationCommand extends CommandRunner {
    private readonly baseMigrationsDir: string;

    public constructor(private readonly configService: ConfigService) {
        super();
        this.baseMigrationsDir = configService.getOrThrow("TYPEORM_MIGRATIONS_PATHS").split("|")[0].replace("/*.ts", "");
    }

    public async run(passedParams: GenerateParams, _?: never): Promise<void> {
        const [name] = passedParams;
        const totalName = Path.join(this.baseMigrationsDir, name);
        await useExecCommand(`typeorm-ts-node-commonjs -d ./ormconfig.ts migration:generate ${totalName}`);
    }
}

@Command({
    name: "migration",
    subCommands: [ShowMigrationsCommand, GenerateMigrationCommand, RunMigrationsCommand, RevertMigrationsCommand],
})
export class MigrationsRunnerCommand extends CommandRunner {
    public run(_ignoredParams: string[], _?: never): Promise<void> {
        this.command.help();
    }
}

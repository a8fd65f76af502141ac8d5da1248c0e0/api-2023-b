import {Type} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {Test} from "@nestjs/testing";
import {useExecCommand} from "cli/migrations";
import * as fs from "fs";
import {Command, CommandRunner, SubCommand} from "nest-commander";
import {AppModule} from "src/app.module";
import {SWAGGER_API_AUTH_SCHEMA} from "src/config/constants";
import {REGISTER_SWAGGER_TOKEN, SwaggerConfigSchemaType} from "src/config/swagger.config";
import {Mock} from "typemoq";

class GetAllControllersService {
    public constructor(private readonly baseModule: typeof AppModule, private controllers: Type[] = []) {}

    public getAllControllers(): Type[] {
        this.getAllControllersFromRoot(this.baseModule);
        return this.controllers;
    }

    private getAllControllersFromRoot(module: typeof AppModule): void {
        try {
            const childModules = Reflect.getMetadata("imports", module)?.filter((v: unknown) => typeof v == "function");
            const controllers = Reflect.getMetadata("controllers", module);
            if (controllers) this.controllers = this.controllers.concat(controllers);

            if (childModules && Array.isArray(childModules)) {
                for (const child of childModules) {
                    this.getAllControllersFromRoot(child);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
}

@SubCommand({name: "openapi"})
export class GenerateOpenapiCommand extends CommandRunner {
    public constructor(private readonly config: ConfigService) {
        super();
    }

    public async run(_ignoredParams: string[], _?: never): Promise<void> {
        try {
            const controllers = new GetAllControllersService(AppModule).getAllControllers();

            const targetModule = await Test.createTestingModule({
                controllers: controllers,
            })
                .useMocker(() => {
                    return new Mock();
                })
                .compile({preview: true});

            const swaggerConfig = this.config.get<SwaggerConfigSchemaType>(REGISTER_SWAGGER_TOKEN) as SwaggerConfigSchemaType;
            const swaggerDocument = new DocumentBuilder()
                .setTitle(swaggerConfig.apiTitle)
                .setDescription(swaggerConfig.apiDescription)
                .setVersion(swaggerConfig.apiVersion)
                .addApiKey(
                    {
                        description: "Master Token для аутентификации и авторизации в приложении",
                        in: "header",
                        type: "apiKey",
                        name: "Authorization",
                    },
                    SWAGGER_API_AUTH_SCHEMA
                )
                .build();

            const swaggerPayload = SwaggerModule.createDocument(targetModule.createNestApplication(), swaggerDocument);

            await useExecCommand("mkdir -p ./public/openapi");
            fs.writeFileSync("./public/openapi/swagger.json", JSON.stringify(swaggerPayload), {});
            await useExecCommand("npx @redocly/cli build-docs ./public/openapi/swagger.json -o ./public/openapi/index.html");
        } catch (e) {
            console.error(e);
        }
    }
}

@Command({name: "generate-docs", subCommands: [GenerateOpenapiCommand]})
export class DocsGenerationRunnerCommand extends CommandRunner {
    public run(_ignoredParams: string[], _?: never): Promise<void> {
        this.command.help();
    }
}

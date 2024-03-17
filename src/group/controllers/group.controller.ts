import {Body, ConflictException, Controller, Delete, Get, NotFoundException, Param, Post, Put} from "@nestjs/common";
import {GroupNotFoundException, GroupService, ParticipantNotFoundException} from "../services/group.service";
import {Optional} from "../../core/common/types/optional";
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiProperty,
    ApiTags,
} from "@nestjs/swagger";
import {IsInt, IsOptional, IsString} from "class-validator";
import {Type} from "class-transformer";
import {BaseOkResponseDto} from "../../core/common/dto/base-ok-response.dto";
import {UnableTossException} from "../services/toss.service";

class CreateGroupDto {
    @ApiProperty({type: String})
    @IsString()
    name: string;
    @ApiProperty({required: false, type: String})
    @IsString()
    @IsOptional()
    description: Optional<string>;
}

class GroupIdDto {
    @ApiProperty({type: "integer"})
    @IsInt()
    @Type(() => Number)
    id: number;
}

class UpdateGroupDto {
    @ApiProperty({required: true, type: String, description: "API Property"})
    @IsOptional()
    @IsString()
    name: Optional<string>;
    @ApiProperty({required: false, type: String, description: "API Property"})
    @IsString()
    @IsOptional()
    description: Optional<string>;
}

class GetAllGroupsResponseDto {
    @ApiProperty({type: Number})
    id: number;
    @ApiProperty({type: String})
    name: string;
    @ApiProperty({type: String, nullable: true})
    description: Optional<string>;
}

class CreateParticipantRequestDto {
    @ApiProperty({type: String})
    @IsString()
    name: string;
    @ApiProperty({type: String, required: false})
    @IsString()
    @IsOptional()
    wish: Optional<string>;
}

class ParticipantIdDto {
    @ApiProperty({type: "integer"})
    @IsInt()
    @Type(() => Number)
    id: number;
}

class GroupParticipantIdDto {
    @ApiProperty({type: "integer"})
    @IsInt()
    @Type(() => Number)
    groupId: number;
    @ApiProperty({type: "integer"})
    @Type(() => Number)
    @IsInt()
    participantId: number;
}

class RecipientDto {
    @ApiProperty({type: Number})
    id: number;
    @ApiProperty({type: String})
    name: string;
}

class GetParticipantResponseDto {
    @ApiProperty({
        type: "integer",
        required: true,
        description: "Integer field",
    })
    @Type(() => Number)
    @IsInt()
    id: number;
    @ApiProperty({
        type: String,
        required: true,
        description: "String field",
    })
    @IsString()
    name: string;
    @ApiProperty({
        type: String,
        nullable: true,
        description: "String nullable field",
    })
    @IsOptional()
    @IsString()
    wish: string | null;
    @ApiProperty({
        type: RecipientDto,
        nullable: true,
        description: "Recipient dto nullable field",
    })
    @IsOptional()
    @IsString()
    recipient: RecipientDto | null;
}

class GroupParticipantResponseDto {
    @ApiProperty({type: Number})
    id: number;
    @ApiProperty({type: String})
    name: string;
    @ApiProperty({type: String, nullable: true})
    wish: string | null;
}

class SingleGroupResponseDto {
    @ApiProperty({type: Number})
    id: number;
    @ApiProperty({type: String})
    name: string;
    @ApiProperty({type: String, nullable: true})
    description: Optional<string>;
    @ApiProperty({type: GroupParticipantResponseDto, isArray: true})
    participants: GroupParticipantResponseDto[];
}

@ApiBadRequestResponse({description: "Некорректные параметры запроса"})
@Controller("group")
export class GroupController {
    constructor(private readonly groupService: GroupService) {}

    @ApiTags("group")
    @ApiBody({type: CreateGroupDto})
    @ApiOperation({})
    @ApiCreatedResponse({type: GroupIdDto})
    @Post()
    async create(@Body() createGroupDto: CreateGroupDto): Promise<GroupIdDto> {
        const res = await this.groupService.create({name: createGroupDto.name, description: createGroupDto.description ?? null});
        return {id: res.id};
    }

    @ApiTags("group")
    @ApiOperation({summary: "Summary"})
    @ApiOkResponse({type: GetAllGroupsResponseDto, isArray: true})
    @Get()
    async findAll(): Promise<GetAllGroupsResponseDto[]> {
        const res = await this.groupService.findAll();
        return res.map((v) => ({id: v.id, name: v.name, description: v.description}));
    }

    @ApiTags("group")
    @ApiNotFoundResponse({description: "Группы не существует"})
    @ApiOkResponse({})
    @ApiOperation({summary: "Summary"})
    @Get(":id")
    async findOne(@Param() {id}: GroupIdDto): Promise<SingleGroupResponseDto> {
        try {
            const res = await this.groupService.findOne(id);
            return {
                id: res.id,
                name: res.name,
                description: res.description ?? null,
                participants: res.members.map((v) => ({id: v.id, name: v.name, wish: v.wish ?? null})),
            };
        } catch (e) {
            if (e instanceof GroupNotFoundException) {
                throw new NotFoundException();
            }
            throw e;
        }
    }

    @ApiTags("group")
    @ApiOperation({})
    @ApiNotFoundResponse({description: "Группы не существует"})
    @ApiOkResponse({type: BaseOkResponseDto})
    @Put(":id")
    async update(@Param() {id}: GroupIdDto, @Body() updateGroupDto: UpdateGroupDto) {
        try {
            await this.groupService.update(id, {name: updateGroupDto.name ?? null, description: updateGroupDto.description ?? null});
            return {ok: true};
        } catch (e) {
            if (e instanceof GroupNotFoundException) {
                throw new NotFoundException();
            }
            throw e;
        }
    }

    @ApiTags("group")
    @ApiOperation({})
    @ApiNotFoundResponse({description: "Группы не существует"})
    @ApiOkResponse({type: BaseOkResponseDto})
    @Delete(":id")
    async remove(@Param() {id}: GroupIdDto) {
        try {
            await this.groupService.remove(id);
            return {ok: true};
        } catch (e) {
            if (e instanceof GroupNotFoundException) {
                throw new NotFoundException();
            }
            throw e;
        }
    }

    @ApiTags("participant")
    @ApiOperation({})
    @ApiNotFoundResponse({description: "Группы не существует"})
    @ApiCreatedResponse({type: ParticipantIdDto})
    @Post(":id/participant")
    async createParticipant(@Param() {id}: GroupIdDto, @Body() participant: CreateParticipantRequestDto): Promise<ParticipantIdDto> {
        try {
            const res = await this.groupService.addParticipant({groupId: id, name: participant.name, wish: participant.wish ?? null});
            return {id: res.id};
        } catch (e) {
            if (e instanceof GroupNotFoundException) {
                throw new NotFoundException();
            }
            throw e;
        }
    }

    @ApiTags("participant")
    @ApiOperation({})
    @ApiNotFoundResponse({description: "Группы не существует или участника не существует"})
    @ApiOkResponse({type: BaseOkResponseDto})
    @Delete(":groupId/participant/:participantId")
    async deleteParticipant(@Param() {groupId, participantId}: GroupParticipantIdDto): Promise<BaseOkResponseDto> {
        try {
            await this.groupService.deleteParticipant(groupId, participantId);
            return {ok: true};
        } catch (e) {
            if (e instanceof GroupNotFoundException) {
                throw new NotFoundException();
            }
            if (e instanceof ParticipantNotFoundException) {
                throw new NotFoundException();
            }
            throw e;
        }
    }

    @ApiTags("participant")
    @ApiOperation({})
    @ApiNotFoundResponse({description: "Группы не существует или участника не существует"})
    @ApiOkResponse({type: GetParticipantResponseDto})
    @Get(":groupId/participant/:participantId/recipient")
    async getRecipient(@Param() {groupId, participantId}: GroupParticipantIdDto): Promise<GetParticipantResponseDto> {
        try {
            const res = await this.groupService.getRecipient(groupId, participantId);
            return {
                id: res.id,
                name: res.name,
                wish: res.wish ?? null,
                recipient: res.recipient
                    ? {
                          name: res.recipient.name,
                          id: res.recipient.id,
                      }
                    : null,
            };
        } catch (e) {
            if (e instanceof GroupNotFoundException) {
                throw new NotFoundException();
            }
            if (e instanceof ParticipantNotFoundException) {
                throw new NotFoundException();
            }
            throw e;
        }
    }

    @ApiTags("toss")
    @ApiOperation({})
    @ApiCreatedResponse({type: GetParticipantResponseDto, isArray: true})
    @ApiNotFoundResponse({description: "Группы не существует"})
    @ApiConflictResponse({description: "Невозможно провести жеребьёвку"})
    @Post(":id/toss")
    async toss(@Param() {id}: GroupIdDto): Promise<GetParticipantResponseDto[]> {
        try {
            const res = await this.groupService.toss(id);
            return res.map((v) => {
                return {
                    id: v.id,
                    name: v.name,
                    wish: v.wish ?? null,
                    recipient: v.recipient
                        ? {
                              name: v.recipient.name,
                              id: v.recipient.id,
                          }
                        : null,
                };
            });
        } catch (e) {
            if (e instanceof GroupNotFoundException) {
                throw new NotFoundException();
            }
            if (e instanceof ParticipantNotFoundException) {
                throw new NotFoundException();
            }
            if (e instanceof UnableTossException) {
                throw new ConflictException();
            }
            throw e;
        }
    }
}

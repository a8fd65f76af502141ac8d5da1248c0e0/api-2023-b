import {Module} from "@nestjs/common";
import {GroupService} from "./services/group.service";
import {GroupController} from "./controllers/group.controller";
import {TypeOrmModule} from "@nestjs/typeorm";
import {GroupEntity} from "./entities/group.entity";
import {TossService} from "./services/toss.service";
import {MemberEntity} from "./entities/member.entity";

@Module({
    imports: [TypeOrmModule.forFeature([GroupEntity, MemberEntity])],
    controllers: [GroupController],
    providers: [GroupService, TossService],
})
export class GroupModule {}

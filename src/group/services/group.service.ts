import {Injectable} from "@nestjs/common";
import {Repository} from "typeorm";
import {GroupEntity} from "../entities/group.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {TossService} from "./toss.service";
import {MemberEntity} from "../entities/member.entity";

export class GroupNotFoundException extends Error {
    constructor(id: number) {
        super(`Group with id: ${id} nor found`);
    }
}

export class ParticipantNotFoundException extends Error {
    constructor(id: number) {
        super(`Group with id: ${id} nor found`);
    }
}

@Injectable()
export class GroupService {
    constructor(
        @InjectRepository(GroupEntity)
        private readonly repo: Repository<GroupEntity>,
        @InjectRepository(MemberEntity)
        private readonly memberRepo: Repository<MemberEntity>,
        private readonly tossService: TossService
    ) {}

    async create(createGroupDto: {name: string; description: string | null}) {
        return await this.repo.save({name: createGroupDto.name, description: createGroupDto.description});
    }

    findAll() {
        return this.repo.find({select: ["id", "name", "description"]});
    }

    async findOne(id: number) {
        const res = await this.repo.findOneBy({id: id});
        if (!res) {
            throw new GroupNotFoundException(id);
        }
        return res;
    }

    async update(id: number, updateGroupDto: {name: string | null; description: string | null}) {
        const res = await this.repo.findOneBy({id: id});
        if (!res) {
            throw new GroupNotFoundException(id);
        }

        res.description = updateGroupDto.description;
        res.name = updateGroupDto.name ?? res.name;

        return await this.repo.save(res);
    }

    async remove(id: number) {
        const res = await this.repo.findOneBy({id: id});
        if (!res) {
            throw new GroupNotFoundException(id);
        }

        await this.repo.delete({id: id});
    }

    async addParticipant(dto: {groupId: number; name: string; wish: string | null}) {
        const res = await this.repo.findOneBy({id: dto.groupId});
        if (!res) {
            throw new GroupNotFoundException(dto.groupId);
        }

        return await this.memberRepo.save({group: {id: dto.groupId}, name: dto.name, wish: dto.wish});
    }

    async deleteParticipant(groupId: number, id: number) {
        const res = await this.repo.findOneBy({id: groupId});
        if (!res) {
            throw new GroupNotFoundException(id);
        }

        const mRes = await this.memberRepo.findOneBy({id: id});
        if (!mRes) {
            throw new ParticipantNotFoundException(id);
        }

        await this.memberRepo.delete({id: id});
    }

    async getRecipient(groupId: number, id: number) {
        const res = await this.repo.findOneBy({id: groupId});
        if (!res) {
            throw new GroupNotFoundException(id);
        }

        const mRes = await this.memberRepo.findOne({where: {id: id}, relations: ["recipient"]});
        if (!mRes) {
            throw new ParticipantNotFoundException(id);
        }

        return mRes;
    }

    async toss(groupId: number) {
        const res = await this.repo.findOneBy({id: groupId});
        if (!res) {
            throw new GroupNotFoundException(groupId);
        }

        const memberIds = await this.memberRepo.find({
            where: {group: {id: groupId}},
            select: {group: {id: true}},
            relations: {group: true},
        });

        const mappedMemberIds = memberIds.map((v) => v.id);

        const tossResult = this.tossService.toss(mappedMemberIds);

        for (const item of tossResult) {
            await this.memberRepo.update({id: item.from}, {recipient: {id: item.to}});
        }

        return await this.memberRepo.find({where: {group: {id: groupId}}, relations: {recipient: true}});
    }
}

import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Optional} from "../../core/common/types/optional";
import {MemberEntity} from "./member.entity";

@Entity()
export class GroupEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;
    @Column({type: "varchar"})
    name: string;
    @Column({type: "varchar", nullable: true})
    description: Optional<string>;
    @OneToMany(() => MemberEntity, (m) => m.group, {eager: true})
    members: MemberEntity[];
}

import {Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Optional} from "../../core/common/types/optional";
import {GroupEntity} from "./group.entity";

@Entity()
export class MemberEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;
    @Column({type: "varchar"})
    name: string;
    @ManyToOne(() => GroupEntity, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    group: GroupEntity;
    @Column({type: "varchar", nullable: true})
    wish: Optional<string>;
    @OneToOne(() => MemberEntity, {onDelete: "SET NULL", nullable: true})
    @JoinColumn()
    recipient: Optional<MemberEntity>;
}

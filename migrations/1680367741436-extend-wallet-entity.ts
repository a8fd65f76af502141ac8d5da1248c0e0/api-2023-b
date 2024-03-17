import { MigrationInterface, QueryRunner } from "typeorm";

export class extendWalletEntity1680367741436 implements MigrationInterface {
    name = 'extendWalletEntity1680367741436'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallets" ADD "amount" numeric(10,4) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD "holdingAmount" numeric(10,4) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD "consolidational" boolean NOT NULL`);
        await queryRunner.query(`CREATE INDEX "consolidational_index" ON "wallets" ("consolidational") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."consolidational_index"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "consolidational"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "holdingAmount"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "amount"`);
    }

}

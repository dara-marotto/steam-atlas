import { MigrationInterface, QueryRunner } from "typeorm";

export class UserTable1774896652929 implements MigrationInterface {
    name = 'UserTable1774896652929'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "city_id"`);
        await queryRunner.query(`ALTER TABLE "player" ADD "city_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "city_id"`);
        await queryRunner.query(`ALTER TABLE "player" ADD "city_id" integer`);
    }

}

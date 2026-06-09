import { MigrationInterface, QueryRunner } from "typeorm";

export class PlayerTable1781039365095 implements MigrationInterface {
    name = 'PlayerTable1781039365095'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "player" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "steam_id " character varying NOT NULL, "player_name" character varying NOT NULL, "real_name" character varying, "user_status" character varying, "last-log-off" character varying NOT NULL, "account_age" character varying NOT NULL, "total_playtime" character varying, CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "player"`);
    }

}

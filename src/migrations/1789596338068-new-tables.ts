import { MigrationInterface, QueryRunner } from "typeorm";

export class NewTables1789596338068 implements MigrationInterface {
    name = 'NewTables1789596338068'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "steam_id" character varying, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "player" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "steam_id" character varying NOT NULL, "player_name" character varying NOT NULL, "real_name" character varying, "user_status" character varying, "avatar_url" character varying, "last_log_off" character varying NOT NULL, "account_age" character varying NOT NULL, "total_playtime" character varying, "location" character varying, CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "player"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}

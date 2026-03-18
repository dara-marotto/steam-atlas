import { MigrationInterface, QueryRunner } from "typeorm";

export class PlayerTable1773863490029 implements MigrationInterface {
    name = 'PlayerTable1773863490029'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "player" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "player_name" character varying NOT NULL, "avatar_url" character varying NOT NULL, "country_code" character varying NOT NULL, "state_code" character varying NOT NULL, "city_id" integer NOT NULL, "time_created" character varying NOT NULL, "last_logoff" character varying NOT NULL, "player_url" character varying NOT NULL, CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "player"`);
    }

}

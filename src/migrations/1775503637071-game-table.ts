import { MigrationInterface, QueryRunner } from "typeorm";

export class GameTable1775503637071 implements MigrationInterface {
    name = 'GameTable1775503637071'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "game" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "app_id" character varying NOT NULL, "game_name" character varying NOT NULL, "played_time" character varying, "played_time_two_weeks" character varying, "last_played_date" character varying, "img_icon_url" character varying, "img_logo_url" character varying, CONSTRAINT "UQ_f19ef580756e91c94bc9cf9220f" UNIQUE ("app_id"), CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "game"`);
    }

}

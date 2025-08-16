import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGoogleIdToUser1755264248344 implements MigrationInterface {
    name = 'AddGoogleIdToUser1755264248344'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`googleId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_f382af58ab36057334fb262efd\` (\`googleId\`)`);
        await queryRunner.query(`ALTER TABLE \`designs\` DROP FOREIGN KEY \`FK_452724f63c3299ac729f24c0d5a\``);
        await queryRunner.query(`ALTER TABLE \`designs\` CHANGE \`data\` \`data\` longtext NULL`);
        await queryRunner.query(`ALTER TABLE \`designs\` CHANGE \`imageUrl\` \`imageUrl\` longtext NULL`);
        await queryRunner.query(`ALTER TABLE \`designs\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`password\` \`password\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`photoProfil\` \`photoProfil\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`phone\` \`phone\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`gender\` \`gender\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`templates\` DROP FOREIGN KEY \`FK_7193babbf16087eb6107606dfe3\``);
        await queryRunner.query(`ALTER TABLE \`templates\` CHANGE \`description\` \`description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`templates\` DROP COLUMN \`content\``);
        await queryRunner.query(`ALTER TABLE \`templates\` ADD \`content\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`templates\` CHANGE \`category\` \`category\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`templates\` CHANGE \`type\` \`type\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`templates\` CHANGE \`theme\` \`theme\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`templates\` CHANGE \`preview\` \`preview\` longtext NULL`);
        await queryRunner.query(`ALTER TABLE \`templates\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`testimonials\` DROP FOREIGN KEY \`FK_e4e5bb62ec2874c440b6cc3362f\``);
        await queryRunner.query(`ALTER TABLE \`testimonials\` CHANGE \`email\` \`email\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`testimonials\` CHANGE \`jobTitle\` \`jobTitle\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`testimonials\` CHANGE \`company\` \`company\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`testimonials\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`designs\` ADD CONSTRAINT \`FK_452724f63c3299ac729f24c0d5a\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`templates\` ADD CONSTRAINT \`FK_7193babbf16087eb6107606dfe3\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`testimonials\` ADD CONSTRAINT \`FK_e4e5bb62ec2874c440b6cc3362f\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`testimonials\` DROP FOREIGN KEY \`FK_e4e5bb62ec2874c440b6cc3362f\``);
        await queryRunner.query(`ALTER TABLE \`templates\` DROP FOREIGN KEY \`FK_7193babbf16087eb6107606dfe3\``);
        await queryRunner.query(`ALTER TABLE \`designs\` DROP FOREIGN KEY \`FK_452724f63c3299ac729f24c0d5a\``);
        await queryRunner.query(`ALTER TABLE \`testimonials\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`testimonials\` CHANGE \`company\` \`company\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`testimonials\` CHANGE \`jobTitle\` \`jobTitle\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`testimonials\` CHANGE \`email\` \`email\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`testimonials\` ADD CONSTRAINT \`FK_e4e5bb62ec2874c440b6cc3362f\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`templates\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`templates\` CHANGE \`preview\` \`preview\` longtext NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`templates\` CHANGE \`theme\` \`theme\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`templates\` CHANGE \`type\` \`type\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`templates\` CHANGE \`category\` \`category\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`templates\` DROP COLUMN \`content\``);
        await queryRunner.query(`ALTER TABLE \`templates\` ADD \`content\` longtext COLLATE "utf8mb4_bin" NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`templates\` CHANGE \`description\` \`description\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`templates\` ADD CONSTRAINT \`FK_7193babbf16087eb6107606dfe3\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`gender\` \`gender\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`phone\` \`phone\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`photoProfil\` \`photoProfil\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`password\` \`password\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`designs\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`designs\` CHANGE \`imageUrl\` \`imageUrl\` longtext NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`designs\` CHANGE \`data\` \`data\` longtext NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`designs\` ADD CONSTRAINT \`FK_452724f63c3299ac729f24c0d5a\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_f382af58ab36057334fb262efd\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`googleId\``);
    }

}

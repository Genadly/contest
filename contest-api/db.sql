-- Active: 1789636413852@@127.0.0.1@8888@contest_db
CREATE DATABASE contest_db;

GRANT ALL PRIVILEGES ON DATABASE contest_db TO admin;

SELECT * FROM "Contests";

UPDATE "Users" SET role = 'admin' WHERE email = 'admin@example.com';

SELECT id, email, role FROM "Users" WHERE email = 'admin@example.com';
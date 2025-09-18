/*
  Warnings:

  - You are about to drop the `oauthaccount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "oauthaccount" DROP CONSTRAINT "oauthaccount_userId_fkey";

-- DropTable
DROP TABLE "oauthaccount";

-- DropEnum
DROP TYPE "OAuthProvider";

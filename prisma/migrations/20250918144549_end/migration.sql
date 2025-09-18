-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('Google', 'FACEBOOK', 'GITHUB', 'APPLE');

-- CreateTable
CREATE TABLE "oauthaccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "tokenType" TEXT,
    "scope" TEXT,
    "idToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauthaccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "oauthaccount_provider_providerId_key" ON "oauthaccount"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "oauthaccount_userId_provider_key" ON "oauthaccount"("userId", "provider");

-- AddForeignKey
ALTER TABLE "oauthaccount" ADD CONSTRAINT "oauthaccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

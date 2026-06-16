-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('Trend', 'Plattform', 'Mention');

-- CreateTable
CREATE TABLE "news" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "category" "NewsCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "teaser" TEXT,
    "source" TEXT NOT NULL,
    "tag" TEXT,
    "highlight" BOOLEAN NOT NULL DEFAULT false,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "news_workspace_id_published_at_idx" ON "news"("workspace_id", "published_at");

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;


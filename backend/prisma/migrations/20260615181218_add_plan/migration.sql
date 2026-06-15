-- CreateEnum
CREATE TYPE "PlanCategory" AS ENUM ('verkauf', 'service', 'vermietung', 'saison', 'frist');

-- CreateEnum
CREATE TYPE "PlanLinkDirection" AS ENUM ('back', 'fwd');

-- CreateTable
CREATE TABLE "plan_months" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "quarter" INTEGER NOT NULL,
    "focus" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_months_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_themes" (
    "id" TEXT NOT NULL,
    "plan_month_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "PlanCategory" NOT NULL DEFAULT 'verkauf',
    "channels" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_links" (
    "id" TEXT NOT NULL,
    "plan_month_id" TEXT NOT NULL,
    "direction" "PlanLinkDirection" NOT NULL,
    "target_month" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plan_months_workspace_id_year_idx" ON "plan_months"("workspace_id", "year");

-- CreateIndex
CREATE UNIQUE INDEX "plan_months_workspace_id_year_month_key" ON "plan_months"("workspace_id", "year", "month");

-- CreateIndex
CREATE INDEX "plan_themes_plan_month_id_idx" ON "plan_themes"("plan_month_id");

-- CreateIndex
CREATE INDEX "plan_links_plan_month_id_idx" ON "plan_links"("plan_month_id");

-- AddForeignKey
ALTER TABLE "plan_months" ADD CONSTRAINT "plan_months_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_themes" ADD CONSTRAINT "plan_themes_plan_month_id_fkey" FOREIGN KEY ("plan_month_id") REFERENCES "plan_months"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_links" ADD CONSTRAINT "plan_links_plan_month_id_fkey" FOREIGN KEY ("plan_month_id") REFERENCES "plan_months"("id") ON DELETE CASCADE ON UPDATE CASCADE;

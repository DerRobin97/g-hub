-- CreateEnum
CREATE TYPE "TimeStatus" AS ENUM ('in', 'break', 'out');

-- CreateTable
CREATE TABLE "time_entries" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "clock_in" TIMESTAMP(3) NOT NULL,
    "clock_out" TIMESTAMP(3),
    "work_seconds" INTEGER NOT NULL DEFAULT 0,
    "break_seconds" INTEGER NOT NULL DEFAULT 0,
    "segment_start" TIMESTAMP(3),
    "status" "TimeStatus" NOT NULL DEFAULT 'in',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absence_balances" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "vacation_total" INTEGER NOT NULL DEFAULT 30,
    "vacation_used" INTEGER NOT NULL DEFAULT 0,
    "sick_days" INTEGER NOT NULL DEFAULT 0,
    "holidays" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "absence_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "weekly_target" INTEGER NOT NULL DEFAULT 40,
    "monthly_target" INTEGER NOT NULL DEFAULT 160,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "time_entries_user_id_date_idx" ON "time_entries"("user_id", "date");

-- CreateIndex
CREATE INDEX "time_entries_workspace_id_idx" ON "time_entries"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "absence_balances_user_id_year_key" ON "absence_balances"("user_id", "year");

-- CreateIndex
CREATE UNIQUE INDEX "work_settings_user_id_key" ON "work_settings"("user_id");

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absence_balances" ADD CONSTRAINT "absence_balances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_settings" ADD CONSTRAINT "work_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

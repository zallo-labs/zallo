-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Safe" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "deploySalt" TEXT,

    CONSTRAINT "Safe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "safeId" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("safeId","hash")
);

-- CreateTable
CREATE TABLE "Approver" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Approver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupApprover" (
    "safeId" TEXT NOT NULL,
    "groupHash" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "weight" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "GroupApprover_pkey" PRIMARY KEY ("safeId","groupHash","approverId")
);

-- CreateTable
CREATE TABLE "Contact" (
    "approverId" TEXT NOT NULL,
    "addr" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("approverId","addr")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_sid_key" ON "Session"("sid");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_approverId_name_key" ON "Contact"("approverId", "name");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupApprover" ADD CONSTRAINT "GroupApprover_safeId_groupHash_fkey" FOREIGN KEY ("safeId", "groupHash") REFERENCES "Group"("safeId", "hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupApprover" ADD CONSTRAINT "GroupApprover_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Approver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Approver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

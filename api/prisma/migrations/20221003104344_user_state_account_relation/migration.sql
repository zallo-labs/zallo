-- AddForeignKey
ALTER TABLE "UserState" ADD CONSTRAINT "UserState_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

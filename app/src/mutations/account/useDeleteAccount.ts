import { useCallback } from "react"
import { CombinedAccount } from "~/queries/account"

export const useDeleteAccount = () => {
  return useCallback((account: CombinedAccount) => {
    // TODO: propose deletion
  }, []);
}
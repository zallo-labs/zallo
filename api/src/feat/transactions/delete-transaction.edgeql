with t := (select Transaction filter .id = <uuid>$transaction)
select {
  transaction := (
    select t {
      id,
      account: { address }
    }
  ),
  # Delete policies the proposal was going to activate
  deletedPolicies := (delete t.<proposal[is PolicyState]),
  deletedTransaction := (delete t)
};
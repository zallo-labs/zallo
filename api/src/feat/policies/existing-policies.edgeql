with account := (select Account filter .address = <UAddress>$account),
     keys := array_unpack(<array<uint16>>$policyKeys)
select account.<account[is Policy] {
  key,
  name,
  approvers: { address },
  threshold,
  actions: {
    label,
    functions: {
      contract,
      selector,
      abi,
    },
    allow,
    description,
  },
  transfers: {
    limits: {
      token,
      amount,
      duration
    },
    defaultAllow,
    budget
  },
  allowMessages,
  delay,
} filter .key in keys and (.isDraft if exists .draft else .isLatest) 
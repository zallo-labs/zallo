with account := (select Account filter .address = <UAddress>$account),
     keys := array_unpack(<array<uint16>>$policyKeys)
select Policy {
  key,
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
} filter .account = account and .key in keys and 
  (.isDraft if exists .draft else .isLatest) 
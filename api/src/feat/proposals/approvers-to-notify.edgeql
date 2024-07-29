with p := (select Proposal filter .id = <uuid>$proposal),
     approvers := p.policy.approvers,
     responses := count((select p.<proposal[is ProposalResponse] limit 2)),
     shouldNotify := ((responses = 1) if p.proposedBy in approvers else (responses = 0)),
     approversToNotify := (approvers if shouldNotify else {})
select {
  isTransaction := exists [p is Transaction],
  approvers := (
    select approversToNotify {
      pushToken := .details.pushToken
    } filter exists .pushToken
  ) 
};
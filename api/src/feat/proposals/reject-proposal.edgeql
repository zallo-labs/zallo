with proposal := (select Proposal filter .id = <uuid>$proposal),
     deletedResponse := (delete ProposalResponse filter .proposal = proposal and .approver = global current_approver)
insert Rejection {
  proposal := proposal
}
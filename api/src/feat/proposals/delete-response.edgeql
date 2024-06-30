with proposal := (select Proposal filter .id = <uuid>$proposal),
     approver := (select Approver filter .address = <Address>$approver)
delete ProposalResponse filter .proposal = proposal and .approver = approver
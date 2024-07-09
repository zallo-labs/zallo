with address := <Address>$address,
     name := <optional str>$name,
     pushToken := <optional str>$pushToken,
     bluetoothDevices := <optional array<MAC>>$bluetoothDevices,
     cloud := <optional tuple<provider: CloudProvider, subject: str>>$cloud,
     approver := (insert Approver { address := address } unless conflict on .address else Approver)
insert ApproverDetails {
  approver := approver,
  name := name,
  pushToken := pushToken,
  bluetoothDevices := bluetoothDevices,
  cloud := cloud
} unless conflict on .approver else (
  update ApproverDetails set {
    name := name,
    pushToken := pushToken,
    bluetoothDevices := bluetoothDevices,
    cloud := cloud
  }
)
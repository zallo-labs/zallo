insert Account {
  id := <uuid>$id,
  address := <UAddress>$address,
  name := <str>$name,
  implementation := <Address>$implementation,
  initialization := <tuple<salt: Bytes32, bytecodeHash: Bytes32, aaVersion: uint16>>$initialization
}
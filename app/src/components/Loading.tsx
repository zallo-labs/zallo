import { ActivityIndicator } from "react-native-paper";
import { Box } from "./Box";

export const Loading = () => (
  <Box flex={1} center>
    <ActivityIndicator />
  </Box>
)
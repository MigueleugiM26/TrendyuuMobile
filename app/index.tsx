import MainPage from "@/src/components/main_page/main-page";
import Navbar from "@/src/components/main_page/Navbar";
import { StyleSheet, View } from "react-native";

export default function HomeRoute() {
  return (
    <View style={styles.root}>
      <MainPage />
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

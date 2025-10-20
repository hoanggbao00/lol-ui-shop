import { colors } from "@/libs/colors";
import { Image } from "expo-image";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const icons = {
  Frame: require("../../assets/icons/settings/frame.png"),
  Profile: require("../../assets/icons/settings/profile.png"),
  Password: require("../../assets/icons/settings/password.png"),
  History: require("../../assets/icons/settings/history.png"),
  Export: require("../../assets/icons/settings/export.png"),
  Wallet: require("../../assets/icons/settings/wallet.png"),
  Language: require("../../assets/icons/settings/language.png"),
  Logout: require("../../assets/icons/settings/logout.png"),
};

export default function User() {
  const menus = [
    {
      icon: icons.Profile,
      text: "Thông tin cá nhân",
    },
    {
      icon: icons.Password,
      text: "Đổi mật khẩu",
    },
    {
      icon: icons.History,
      text: "Lịch sử giao dịch",
    },
    {
      icon: icons.Export,
      text: "Đăng, bán tài khoản",
    },
    {
      icon: icons.Wallet,
      text: "Liên kết ngân hàng",
    },
    {
      icon: icons.Language,
      text: "Đổi ngôn ngữ",
    },
    {
      icon: icons.Logout,
      text: "Đăng xuất",
    },
  ];

  return (
    <ScrollView
    style={{
      flex: 1,
      backgroundColor: colors["lol-black"],
      padding: 24,
    }}
    >
      <View style={{
        gap: 24,
      }}>
        <Image source={icons.Frame} style={styles.frame} />
        <Text style={styles.name}>Tên: Nam Nguyen</Text>
        <Text style={styles.name}>ID: 12</Text>
        <View style={styles.cardContainer}>
          {menus.map((item, index) => (
            <View style={styles.cardItem} key={item.text}>
              <Image source={item.icon} style={styles.icon} />
              <Text style={styles.cardText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: 180,
    height: 180,
    marginHorizontal: "auto",
    marginTop: 40,
  },
  name: {
    color: colors["lol-gold"],
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  cardContainer: {
    backgroundColor: "#ffffff30",
    borderWidth: 1,
    borderColor: colors["lol-gold"],
    padding: 20,
    gap: 20,
    borderRadius: 20,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    width: 36,
    height: 36,
  },
  cardText: {
    color: colors["lol-gold"],
    fontSize: 20,
    textAlign: "center",
  },
});

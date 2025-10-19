import { Link, router } from "expo-router";
import { Button } from "heroui-native";
import React, { useState } from "react";
import {
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onPress = () => {
    router.push("/(tabs)");
  };

  const onBackSignin = () => {
    router.push("/signin");
  };

  return (
    <ImageBackground
      source={require("../assets/images/splash-icon.png")}
      className="flex-1"
      imageStyle={{ opacity: 0.6 }}
    >
      <View className="flex-1 bg-black/70 items-center justify-center px-6 gap-4">
        {/* Username/Email field */}
        <View className="w-full bg-white/20 rounded-md p-2 border-lol-gold border">
          <Text className="text-[#A0ADB5]">
            Tên người dùng, email/số di động
          </Text>
          <TextInput
            className="w-full h-10"
            value={username}
            onChangeText={setUsername}
            placeholder="Tên người dùng, email/số di động"
          />
        </View>

        <View className="w-full bg-white/20 rounded-md p-2 border-lol-gold border">
          <Text className="text-[#A0ADB5]">Mật khẩu</Text>
          <TextInput
            className="w-full h-10"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Mật khẩu"
          />
        </View>

        <View className="w-full bg-white/20 rounded-md p-2 border-lol-gold border">
          <Text className="text-[#A0ADB5]">Nhập lại mật khẩu</Text>
          <TextInput
            className="w-full h-10"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Nhập lại mật khẩu"
          />
        </View>

        {/* Login button */}

        <Button
          onPress={onBackSignin}
          className="h-14 rounded-full w-full bg-lol-gold/50 border border-lol-gold"
        >
          <Text className="text-black text-lg font-bold">Đăng ký</Text>
        </Button>

        {/* Forgot password link */}
        <TouchableOpacity className="mb-8">
          <Text className="text-[#FFF3E5] text-lg font-bold">
            Quên mật khẩu?
          </Text>
        </TouchableOpacity>

        {/* Social login options */}
        <View className="flex-row justify-center mb-8 gap-4">
          <TouchableOpacity
            className="w-14 h-14 items-center justify-center"
            onPress={onPress}
          >
            <Text className="text-lol-gold text-4xl font-bold">f</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-14 h-14 items-center justify-center"
            onPress={onPress}
          >
            <Text className="text-lol-gold text-4xl font-bold">G</Text>
          </TouchableOpacity>
        </View>

        {/* Create new account link */}
        <Link href="/signin" asChild>
          <Button className="h-14 rounded-xl w-full !bg-transparent border-lol-gold border-2">
            <Text className="text-lol-gold text-lg font-bold">
              Đã có tài khoản
            </Text>
          </Button>
        </Link>
      </View>
    </ImageBackground>
  );
}

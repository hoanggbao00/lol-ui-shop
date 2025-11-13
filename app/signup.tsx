import Background from '@/components/Background';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View
} from "react-native";

export default function SignIn() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(); 

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function handleAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = onAuthStateChanged(getAuth(), handleAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  const signUp = async () => {
		setLoading(true);
		try {
			await createUserWithEmailAndPassword(getAuth(), username, password);
		} catch (error) {
			console.error(error);
      ToastAndroid.show('Error', ToastAndroid.SHORT);
		} finally {
			setLoading(false);
		}
	}

  const onPress = () => {
    signUp();
  };

  if (initializing) return null;

  return (
    <View style={{
      flex: 1,
    }}>
			<Background />

      <View style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        gap: 16,
      }}>
        {/* Username/Email field */}
        <View style={{
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderRadius: 8,
          padding: 8,
          borderColor: "#C8AA6E",
          borderWidth: 1,
        }}>
          <Text style={{
            color: "#A0ADB5",
          }}>
            Tên người dùng, email/số di động
          </Text>
          <TextInput
            style={{
              width: "100%",
              height: 40,
            }}
            value={username}
            onChangeText={setUsername}
            placeholder="Tên người dùng, email/số di động"
          />
        </View>

        <View style={{
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderRadius: 8,
          padding: 8,
          borderColor: "#C8AA6E",
          borderWidth: 1,
        }}>
          <Text style={{
            color: "#A0ADB5",
          }}>
            Mật khẩu
          </Text>
          <TextInput
            style={{
              width: "100%",
              height: 40,
            }}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Mật khẩu"
          />
        </View>

        <View style={{
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderRadius: 8,
          padding: 8,
          borderColor: "#C8AA6E",
          borderWidth: 1,
        }}>
          <Text style={{
            color: "#A0ADB5",
          }}>
            Nhập lại mật khẩu
          </Text>
          <TextInput
            style={{
              width: "100%",
              height: 40,
            }}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Nhập lại mật khẩu"
          />
        </View>

        {/* Login button */}

        <TouchableOpacity
          onPress={onPress}
          style={{
            height: 56,
            width: "100%",
            backgroundColor: "rgba(196, 170, 110, 0.5)",
            borderRadius: 8,
            borderColor: "#C8AA6E",
            borderWidth: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{
            color: "#000000",
            fontSize: 16,
            fontWeight: "bold",
            textAlign: "center",
          }}>
            Đăng ký
          </Text>
        </TouchableOpacity>

        {/* Social login options */}
        <View style={{
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: 32,
          gap: 16,
        }}>
          <TouchableOpacity
            style={{
              width: 56,
              height: 56,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={onPress}
          >
            <Text style={{
              color: "#C8AA6E",
              fontSize: 48,
              fontWeight: "bold",
            }}>f</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: 56,
              height: 56,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={onPress}
          >
            <Text style={{
              color: "#C8AA6E",
              fontSize: 48,
              fontWeight: "bold",
            }}>G</Text>
          </TouchableOpacity>
        </View>

        {/* Create new account link */}
        <Link href="/" asChild>
          <TouchableOpacity style={{
            height: 56,
            width: "100%",
            backgroundColor: "transparent",
            borderColor: "#C8AA6E",
            borderWidth: 2,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
          }}>
            <Text style={{
              color: "#C8AA6E",
              fontSize: 16,
              fontWeight: "bold",
              textAlign: "center",
            }}>
              Đã có tài khoản
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

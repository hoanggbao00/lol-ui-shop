import Background from '@/components/Background';
import ListView from '@/components/home/ListView';
import { colors } from '@/libs/colors';
import { mockData } from '@/libs/mock-data';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Cart() {
const data= mockData

  return (
    <View style={styles.container}>
			<Background />
      <ScrollView style={styles.scrollView}>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => router.back()}>
						<Ionicons name="arrow-back" size={24} color="white" />
					</TouchableOpacity>
					<Text style={styles.title}>Giỏ hàng</Text>
				</View>
          <ListView data={data} showBuyNowButton={false} />
        </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors["lol-black"],
	},
	scrollView: {
		paddingTop: 64,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		gap: 16,
	},
	backButton: {
		fontSize: 20,
		fontWeight: "bold",
		color: "white",
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		color: "white",
	},
});

const contentStyles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
});
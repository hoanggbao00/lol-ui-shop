import { colors } from '@/libs/colors'
import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { Text, View } from 'react-native'

interface AccountItemProps {
  label: string
  value: string
  icon: keyof typeof Ionicons.glyphMap
}

export default function AccountItem(props: AccountItemProps) {
  return (
    <View style={{
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      flex: 1,
      borderWidth: 1,
      borderColor: colors["lol-gold"],
      borderRadius: 16,
      padding: 8,
      paddingHorizontal: 16,
      backgroundColor: colors["card"],
    }}>
      <Ionicons name={props.icon} size={24} color={colors["lol-gold"]} />
      <View>
        <Text style={{ color: "white", fontSize: 12 }}>{props.label}</Text>
        <Text style={{ color: colors["lol-gold"], fontSize: 16, fontWeight: "bold" }}>{props.value}</Text>
      </View>
    </View>
  )
}
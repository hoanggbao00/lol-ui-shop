import Background from '@/components/Background'
import { ADMIN_BANK } from '@/libs/admin-bank'
import { colors } from '@/libs/colors'
import type { User as UserType } from '@/types/user'
import type { FirebaseAuthTypes } from '@react-native-firebase/auth'
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { ArrowLeft, Building2, CreditCard, Mail, Minus, Phone, Plus, Save, User as UserIcon, Wallet } from 'lucide-react-native'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Modal, ScrollView, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native'

// Mock user data - replace with actual data from Firebase/API
const mockUser: UserType = {
  user_id: 12,
  username: "Nam Nguyen",
  email: "nam@example.com",
  avatar_url: "default_avatar.png",
  phone: "0123456789",
  role: "user",
  balance: 500000,
  bank_name: "Techcombank",
  bank_account_number: "1234567890",
  bank_account_holder: "NGUYEN VAN NAM",
  created_at: "2024-01-15T10:30:00Z",
  is_active: true,
}

interface InfoFieldProps {
  icon: React.ComponentType<{ size?: number; color?: string }>
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  editable?: boolean
}

const InfoField = ({ icon: Icon, label, value, onChangeText, placeholder, editable = true }: InfoFieldProps) => {
  return (
    <View 
      className="flex-row items-center gap-4 p-4 rounded-lg border"
      style={{ 
        backgroundColor: `${colors.card}80`, 
        borderColor: `${colors.border}4D` 
      }}
    >
      <View 
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${colors.primary}33` }}
      >
        <Icon size={20} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-xs mb-1" style={{ color: colors.mutedForeground }}>
          {label}
        </Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || label}
          placeholderTextColor={colors.mutedForeground}
          editable={editable}
          className="font-medium p-0"
          style={{ 
            color: colors.foreground,
            opacity: editable ? 1 : 0.6
          }}
        />
      </View>
    </View>
  )
}

export default function ProfileScreen() {
  const [initializing, setInitializing] = useState(true)
  const [authUser, setAuthUser] = useState<FirebaseAuthTypes.User | null>(null)
  
  // Editable user data
  const [username, setUsername] = useState(mockUser.username)
  const [email, setEmail] = useState(mockUser.email)
  const [phone, setPhone] = useState(mockUser.phone || "")
  const [bankName, setBankName] = useState(mockUser.bank_name || "")
  const [bankAccountNumber, setBankAccountNumber] = useState(mockUser.bank_account_number || "")
  const [bankAccountHolder, setBankAccountHolder] = useState(mockUser.bank_account_holder || "")
  
  // Dialog states
  const [depositDialogOpen, setDepositDialogOpen] = useState(false)
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [qrUrl, setQrUrl] = useState("")
  const [qrGenerated, setQrGenerated] = useState(false)

  const handleAuthStateChanged = useCallback((_user: FirebaseAuthTypes.User | null) => {
    setAuthUser(_user)
    if (initializing) setInitializing(false)
  }, [initializing])

  useEffect(() => {
    const subscriber = onAuthStateChanged(getAuth(), handleAuthStateChanged)
    return subscriber
  }, [handleAuthStateChanged])

  // Check if any field has been changed
  const hasChanges = 
    username !== mockUser.username ||
    email !== mockUser.email ||
    phone !== (mockUser.phone || "") ||
    bankName !== (mockUser.bank_name || "") ||
    bankAccountNumber !== (mockUser.bank_account_number || "") ||
    bankAccountHolder !== (mockUser.bank_account_holder || "")

  const handleSave = () => {
    if (!hasChanges) return
    
    // TODO: Implement save functionality with Firebase/API
    ToastAndroid.show("Đã lưu thông tin thành công", ToastAndroid.SHORT)
    console.log({
      username,
      email,
      phone,
      bankName,
      bankAccountNumber,
      bankAccountHolder
    })
  }

  // Debounce QR code generation (only after first generation)
  useEffect(() => {
    if (!qrGenerated) return // Don't auto-generate on first load
    
    if (!depositAmount || Number.isNaN(Number(depositAmount))) {
      setQrUrl("")
      return
    }

    const timer = setTimeout(() => {
      const amount = Number(depositAmount)
      if (amount > 0) {
        const description = `NAPTIEN ${mockUser.user_id}`
        const url = `https://qr.sepay.vn/img?acc=${ADMIN_BANK.account_number}&bank=${ADMIN_BANK.bank_code}&amount=${amount}&des=${description}&template=compact`
        setQrUrl(url)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [depositAmount, qrGenerated])

  const handleDeposit = () => {
    setDepositDialogOpen(true)
  }

  const handleGenerateQR = () => {
    const amount = Number(depositAmount)
    if (Number.isNaN(amount) || amount <= 0) {
      ToastAndroid.show("Vui lòng nhập số tiền hợp lệ", ToastAndroid.SHORT)
      return
    }
    
    const description = `NAPTIEN ${mockUser.user_id}`
    const url = `https://qr.sepay.vn/img?acc=${ADMIN_BANK.account_number}&bank=${ADMIN_BANK.bank_code}&amount=${amount}&des=${description}&template=compact`
    setQrUrl(url)
    setQrGenerated(true)
  }

  const handleWithdraw = () => {
    setWithdrawDialogOpen(true)
  }

  const handleWithdrawSubmit = () => {
    const amount = Number(withdrawAmount)
    if (Number.isNaN(amount) || amount <= 0) {
      ToastAndroid.show("Vui lòng nhập số tiền hợp lệ", ToastAndroid.SHORT)
      return
    }
    if (amount > mockUser.balance) {
      ToastAndroid.show("Số dư không đủ", ToastAndroid.SHORT)
      return
    }
    
    // TODO: Implement withdraw functionality with Firebase/API
    ToastAndroid.show("Đã tạo lệnh rút tiền thành công", ToastAndroid.SHORT)
    setWithdrawDialogOpen(false)
    setWithdrawAmount("")
  }

  const closeDepositDialog = () => {
    setDepositDialogOpen(false)
    setDepositAmount("")
    setQrUrl("")
    setQrGenerated(false)
  }

  const closeWithdrawDialog = () => {
    setWithdrawDialogOpen(false)
    setWithdrawAmount("")
  }

  if (initializing) return null

  return (
    <View className="flex-1 relative" style={{ backgroundColor: colors.background }}>
      <Background />
      
      {/* Content */}
      <ScrollView className="relative z-10 pb-24">
        {/* Header */}
        <View className="flex-row items-center gap-4 p-4 pt-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full border flex items-center justify-center"
            style={{ 
              backgroundColor: `${colors.card}CC`,
              borderColor: `${colors.border}80`
            }}
          >
            <ArrowLeft size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-xl font-semibold" style={{ color: colors.foreground }}>
            Thông tin cá nhân
          </Text>
        </View>

        {/* Avatar Section - Horizontal */}
        <View className="flex-row items-center gap-4 px-4 py-6">
          <View 
            className="w-20 h-20 rounded-full p-1" 
            style={{ backgroundColor: `${colors.primary}4D` }}
          >
            <View 
              className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: colors.card }}
            >
              <UserIcon size={40} color={colors.mutedForeground} />
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
              {username}
            </Text>
            <Text className="text-sm" style={{ color: colors.mutedForeground }}>
              ID: {mockUser.user_id}
            </Text>
            <View className="flex-row items-center gap-2 mt-1">
              <View 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colors.primary }}
              />
              <Text className="text-xs" style={{ color: colors.primary }}>
                {mockUser.is_active ? "Đang hoạt động" : "Không hoạt động"}
              </Text>
            </View>
          </View>
        </View>

        {/* Balance Card */}
        <View className="px-4 mb-4">
          <View 
            className="flex-row items-center gap-4 p-4 rounded-lg border"
            style={{ 
              backgroundColor: `${colors.primary}1A`,
              borderColor: `${colors.primary}4D`
            }}
          >
            <View 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${colors.primary}33` }}
            >
              <Wallet size={24} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-xs mb-1" style={{ color: colors.mutedForeground }}>
                Số dư tài khoản
              </Text>
              <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
                {mockUser.balance.toLocaleString('vi-VN')} ₫
              </Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleDeposit}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${colors.primary}33` }}
              >
                <Plus size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleWithdraw}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${colors.destructive}33` }}
              >
                <Minus size={20} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Info Fields */}
        <View className="px-4 gap-3">
          <InfoField
            icon={UserIcon}
            label="Tên đăng nhập"
            value={username}
            onChangeText={setUsername}
            placeholder="Nhập tên đăng nhập"
          />
          <InfoField
            icon={Mail}
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Nhập email"
            editable={false}
          />
          <InfoField
            icon={Phone}
            label="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            placeholder="Nhập số điện thoại"
          />
          <InfoField
            icon={Building2}
            label="Ngân hàng"
            value={bankName}
            onChangeText={setBankName}
            placeholder="Nhập tên ngân hàng"
          />
          <InfoField
            icon={CreditCard}
            label="Số tài khoản"
            value={bankAccountNumber}
            onChangeText={setBankAccountNumber}
            placeholder="Nhập số tài khoản"
          />
          <InfoField
            icon={UserIcon}
            label="Tên chủ tài khoản"
            value={bankAccountHolder}
            onChangeText={setBankAccountHolder}
            placeholder="Nhập tên chủ tài khoản"
          />
        </View>

        {/* Save Button */}
        <View className="px-4 mt-6 mb-6">
          <TouchableOpacity
            onPress={handleSave}
            disabled={!hasChanges}
            className="flex-row items-center justify-center gap-2 p-4 rounded-lg"
            style={{ 
              backgroundColor: hasChanges ? colors.primary : colors.muted,
              opacity: hasChanges ? 1 : 0.5
            }}
          >
            <Save size={20} color={hasChanges ? colors.primaryForeground : colors.mutedForeground} />
            <Text 
              className="text-base font-semibold"
              style={{ color: hasChanges ? colors.primaryForeground : colors.mutedForeground }}
            >
              Lưu thay đổi
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Deposit Modal */}
      <Modal
        visible={depositDialogOpen}
        transparent
        animationType="fade"
        onRequestClose={closeDepositDialog}
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <View 
            className="w-11/12 max-w-md rounded-lg p-6 gap-4"
            style={{ backgroundColor: colors.card }}
          >
            <Text className="text-xl font-bold mb-2" style={{ color: colors.foreground }}>
              Nạp tiền
            </Text>
            
            <View>
              <Text className="text-sm mb-2" style={{ color: colors.mutedForeground }}>
                Số tiền muốn nạp
              </Text>
              <TextInput
                value={depositAmount}
                onChangeText={setDepositAmount}
                placeholder="Nhập số tiền"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
                className="p-3 rounded-lg border"
                style={{ 
                  backgroundColor: `${colors.card}80`,
                  borderColor: colors.border,
                  color: colors.foreground
                }}
              />
            </View>

            {!qrGenerated && (
              <TouchableOpacity
                onPress={handleGenerateQR}
                disabled={!depositAmount || Number(depositAmount) <= 0}
                className="p-3 rounded-lg"
                style={{ 
                  backgroundColor: depositAmount && Number(depositAmount) > 0 ? colors.primary : colors.muted,
                  opacity: depositAmount && Number(depositAmount) > 0 ? 1 : 0.5
                }}
              >
                <Text className="text-center font-semibold" style={{ color: colors.primaryForeground }}>
                  Tạo QR
                </Text>
              </TouchableOpacity>
            )}

            {qrUrl && qrGenerated && (
              <ScrollView className="max-h-96">
                <View className="items-center gap-3">
                  <Text className="text-sm text-center" style={{ color: colors.mutedForeground }}>
                    Quét mã QR để nạp tiền
                  </Text>
                  <View 
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: colors.background }}
                  >
                    <Image
                      source={{ uri: qrUrl }}
                      style={{ width: 250, height: 250 }}
                      contentFit="contain"
                    />
                  </View>
                  <View className="gap-2 w-full">
                    <View className="flex-row justify-between">
                      <Text style={{ color: colors.mutedForeground }}>Ngân hàng:</Text>
                      <Text style={{ color: colors.foreground }}>{ADMIN_BANK.name}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text style={{ color: colors.mutedForeground }}>Số TK:</Text>
                      <Text style={{ color: colors.foreground }}>{ADMIN_BANK.account_number}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text style={{ color: colors.mutedForeground }}>Chủ TK:</Text>
                      <Text style={{ color: colors.foreground }}>{ADMIN_BANK.account_name}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text style={{ color: colors.mutedForeground }}>Nội dung:</Text>
                      <Text style={{ color: colors.primary }}>NAPTIEN {mockUser.user_id}</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}

            <TouchableOpacity
              onPress={closeDepositDialog}
              className="p-3 rounded-lg mt-2"
              style={{ backgroundColor: colors.muted }}
            >
              <Text className="text-center font-semibold" style={{ color: colors.foreground }}>
                Đóng
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        visible={withdrawDialogOpen}
        transparent
        animationType="fade"
        onRequestClose={closeWithdrawDialog}
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <View 
            className="w-11/12 max-w-md rounded-lg p-6 gap-4"
            style={{ backgroundColor: colors.card }}
          >
            <Text className="text-xl font-bold mb-2" style={{ color: colors.foreground }}>
              Rút tiền
            </Text>
            
            <View>
              <Text className="text-sm mb-2" style={{ color: colors.mutedForeground }}>
                Số tiền muốn rút
              </Text>
              <TextInput
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                placeholder="Nhập số tiền"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
                className="p-3 rounded-lg border"
                style={{ 
                  backgroundColor: `${colors.card}80`,
                  borderColor: colors.border,
                  color: colors.foreground
                }}
              />
              <Text className="text-xs mt-2" style={{ color: colors.mutedForeground }}>
                Số dư khả dụng: {mockUser.balance.toLocaleString('vi-VN')} ₫
              </Text>
            </View>

            {withdrawAmount && Number(withdrawAmount) > mockUser.balance && (
              <View 
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${colors.destructive}1A` }}
              >
                <Text className="text-sm" style={{ color: colors.destructive }}>
                  Số dư không đủ để thực hiện giao dịch
                </Text>
              </View>
            )}

            <View className="flex-row gap-3 mt-2">
              <TouchableOpacity
                onPress={closeWithdrawDialog}
                className="flex-1 p-3 rounded-lg"
                style={{ backgroundColor: colors.muted }}
              >
                <Text className="text-center font-semibold" style={{ color: colors.foreground }}>
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleWithdrawSubmit}
                disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > mockUser.balance}
                className="flex-1 p-3 rounded-lg"
                style={{ 
                  backgroundColor: withdrawAmount && Number(withdrawAmount) > 0 && Number(withdrawAmount) <= mockUser.balance 
                    ? colors.primary 
                    : colors.muted,
                  opacity: withdrawAmount && Number(withdrawAmount) > 0 && Number(withdrawAmount) <= mockUser.balance ? 1 : 0.5
                }}
              >
                <Text className="text-center font-semibold" style={{ color: colors.primaryForeground }}>
                  Tạo lệnh rút
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}
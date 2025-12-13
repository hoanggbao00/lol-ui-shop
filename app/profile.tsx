import { createTransaction } from '@/actions/transaction.action'
import { getUserById, updateUser } from '@/actions/user.action'
import Background from '@/components/Background'
import { ADMIN_BANK } from '@/libs/admin-bank'
import { colors } from '@/libs/colors'
import type { User } from '@/types'
import { getApp } from '@react-native-firebase/app'
import type { FirebaseAuthTypes } from '@react-native-firebase/auth'
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { ArrowLeft, Building2, CreditCard, Mail, Minus, Phone, Plus, Save, User as UserIcon, Wallet } from 'lucide-react-native'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native'

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
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Editable user data
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [bankName, setBankName] = useState("")
  const [bankAccountNumber, setBankAccountNumber] = useState("")
  const [bankAccountHolder, setBankAccountHolder] = useState("")
  
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
    const app = getApp()
    const auth = getAuth(app)
    const subscriber = onAuthStateChanged(auth, handleAuthStateChanged)
    return subscriber
  }, [handleAuthStateChanged])

  // Fetch user data from Firestore when auth user is available
  useEffect(() => {
    const fetchUserData = async () => {
      if (authUser?.uid) {
        try {
          setLoading(true)
          const user = await getUserById(authUser.uid)
          if (user) {
            setUserData(user)
            // Initialize form fields with user data
            setUsername(user.username)
            setEmail(user.email)
            setPhone(user.phone || "")
            setBankName(user.bankName || "")
            setBankAccountNumber(user.bankAccountNumber || "")
            setBankAccountHolder(user.bankAccountHolder || "")
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          ToastAndroid.show("Không thể tải thông tin người dùng", ToastAndroid.SHORT)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    if (!initializing) {
      fetchUserData()
    }
  }, [authUser, initializing])

  // Check if any field has been changed
  const hasChanges = userData && (
    username !== userData.username ||
    email !== userData.email ||
    phone !== (userData.phone || "") ||
    bankName !== (userData.bankName || "") ||
    bankAccountNumber !== (userData.bankAccountNumber || "") ||
    bankAccountHolder !== (userData.bankAccountHolder || "")
  )

  const handleSave = async () => {
    if (!hasChanges || !userData || !authUser) return
    
    try {
      setSaving(true)
      
      // Build update object with only defined values
      const updateData: Partial<User> = {
        username,
      }
      
      if (phone) updateData.phone = phone
      if (bankName) updateData.bankName = bankName
      if (bankAccountNumber) updateData.bankAccountNumber = bankAccountNumber
      if (bankAccountHolder) updateData.bankAccountHolder = bankAccountHolder
      
      await updateUser(authUser.uid, updateData)
      
      // Update local state
      setUserData({
        ...userData,
        ...updateData,
      })
      
      ToastAndroid.show("Đã lưu thông tin thành công", ToastAndroid.SHORT)
    } catch (error) {
      console.error("Error saving user data:", error)
      ToastAndroid.show("Lỗi khi lưu thông tin", ToastAndroid.SHORT)
    } finally {
      setSaving(false)
    }
  }

  // Debounce QR code generation (only after first generation)
  useEffect(() => {
    if (!qrGenerated || !userData) return // Don't auto-generate on first load
    
    if (!depositAmount || Number.isNaN(Number(depositAmount))) {
      setQrUrl("")
      return
    }

    const timer = setTimeout(() => {
      const amount = Number(depositAmount)
      if (amount > 0) {
        const description = `NAPTIEN ${userData.uid}`
        const url = `https://qr.sepay.vn/img?acc=${ADMIN_BANK.account_number}&bank=${ADMIN_BANK.bank_code}&amount=${amount}&des=${description}&template=compact`
        setQrUrl(url)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [depositAmount, qrGenerated, userData])

  const handleDeposit = () => {
    setDepositDialogOpen(true)
  }

  const handleGenerateQR = () => {
    if (!userData) return
    
    const amount = Number(depositAmount)
    if (Number.isNaN(amount) || amount <= 0) {
      ToastAndroid.show("Vui lòng nhập số tiền hợp lệ", ToastAndroid.SHORT)
      return
    }
    
    const description = `NAPTIEN ${userData.uid}`
    const url = `https://qr.sepay.vn/img?acc=${ADMIN_BANK.account_number}&bank=${ADMIN_BANK.bank_code}&amount=${amount}&des=${description}&template=compact`
    setQrUrl(url)
    setQrGenerated(true)
  }

  const handleWithdraw = () => {
    setWithdrawDialogOpen(true)
  }

  const handleWithdrawSubmit = async () => {
    if (!userData || !authUser) return
    
    const amount = Number(withdrawAmount)
    if (Number.isNaN(amount) || amount <= 0) {
      ToastAndroid.show("Vui lòng nhập số tiền hợp lệ", ToastAndroid.SHORT)
      return
    }
    if (amount > userData.balance) {
      ToastAndroid.show("Số dư không đủ", ToastAndroid.SHORT)
      return
    }
    
    // Validate bank info
    if (!userData.bankName || !userData.bankAccountNumber || !userData.bankAccountHolder) {
      ToastAndroid.show("Vui lòng cập nhật thông tin ngân hàng trước khi rút tiền", ToastAndroid.SHORT)
      setWithdrawDialogOpen(false)
      return
    }
    
    try {
      // Create withdraw transaction with pending status
      await createTransaction({
        userId: authUser.uid,
        amount: amount,
        type: "withdraw",
        method: "banking",
        transactionCode: `WITHDRAW_${authUser.uid}_${Date.now()}`,
      })
      
      ToastAndroid.show("Đã tạo lệnh rút tiền thành công. Vui lòng chờ admin xác nhận", ToastAndroid.SHORT)
      setWithdrawDialogOpen(false)
      setWithdrawAmount("")
      
      // Refresh user data to update balance if needed
      const updatedUser = await getUserById(authUser.uid)
      if (updatedUser) {
        setUserData(updatedUser)
      }
    } catch (error: any) {
      console.error("Error creating withdraw transaction:", error)
      ToastAndroid.show(
        error.message || "Không thể tạo lệnh rút tiền",
        ToastAndroid.SHORT
      )
    }
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

  if (initializing || loading) {
    return (
      <View className="flex-1 relative justify-center items-center" style={{ backgroundColor: colors.background }}>
        <Background />
        <ActivityIndicator size="large" color={colors["lol-gold"]} />
      </View>
    )
  }

  if (!authUser || !userData) {
    return (
      <View className="flex-1 relative justify-center items-center" style={{ backgroundColor: colors.background }}>
        <Background />
        <Text style={{ color: colors["lol-gold"], fontSize: 16, fontFamily: "Inter_700Bold" }}>
          Vui lòng đăng nhập để xem thông tin
        </Text>
      </View>
    )
  }

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
          <Text className="text-xl" style={{ color: colors.foreground, fontFamily: "Inter_700Bold" }}>
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
              ID: {userData.uid}
            </Text>
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
                {userData.balance.toLocaleString('vi-VN')} ₫
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
            label="Tên"
            value={username}
            onChangeText={setUsername}
            placeholder="Nhập tên"
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
            disabled={!hasChanges || saving}
            className="flex-row items-center justify-center gap-2 p-4 rounded-lg"
            style={{ 
              backgroundColor: hasChanges && !saving ? colors.primary : colors.muted,
              opacity: hasChanges && !saving ? 1 : 0.5
            }}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.primaryForeground} />
            ) : (
              <Save size={20} color={hasChanges ? colors.primaryForeground : colors.mutedForeground} />
            )}
            <Text 
              className="text-base font-semibold"
              style={{ color: hasChanges && !saving ? colors.primaryForeground : colors.mutedForeground }}
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
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
            <Text className="text-xl mb-2" style={{ color: colors.foreground, fontFamily: "Inter_700Bold" }}>
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
                <Text className="text-center" style={{ color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }}>
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
                      <Text style={{ color: colors.primary }}>NAPTIEN {userData.uid}</Text>
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
              <Text className="text-center" style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
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
            <Text className="text-xl mb-2" style={{ color: colors.foreground, fontFamily: "Inter_700Bold" }}>
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
                Số dư khả dụng: {userData.balance.toLocaleString('vi-VN')} ₫
              </Text>
            </View>

            {withdrawAmount && Number(withdrawAmount) > userData.balance && (
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
                <Text className="text-center" style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleWithdrawSubmit}
                disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > userData.balance}
                className="flex-1 p-3 rounded-lg"
                style={{ 
                  backgroundColor: withdrawAmount && Number(withdrawAmount) > 0 && Number(withdrawAmount) <= userData.balance 
                    ? colors.primary 
                    : colors.muted,
                  opacity: withdrawAmount && Number(withdrawAmount) > 0 && Number(withdrawAmount) <= userData.balance ? 1 : 0.5
                }}
              >
                <Text className="text-center" style={{ color: colors.primaryForeground, fontFamily: "Inter_600SemiBold" }}>
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
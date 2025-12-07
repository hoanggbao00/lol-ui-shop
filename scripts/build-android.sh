#!/bin/bash

# ==============================================================================
# 🤖 ANDROID LOCAL BUILD SCRIPT (Smart Cache & Anti-Lag)
# NOTE: Must `chmod +x scripts/build-android.sh` this script to make it executable
# ==============================================================================
# FEATURES: Smart Caching, Anti-Lag (CPU Limit), Clean Logs, Auto-Signing.
#
# EXAMPLES:
#   1. ./scripts/build_android.sh           (Fastest - uses cache)
#   2. ./scripts/build_android.sh --clean   (Force Prebuild)
#   3. ./scripts/build_android.sh --[apk|aab]     (Build for Store)
# ==============================================================================

# =========================================================
# 0. COLORS & SETUP
# =========================================================
GREEN='\033[1;32m'   
YELLOW='\033[1;33m'  
RED='\033[1;31m'     
CYAN='\033[1;36m'    
NC='\033[0m'         
BUILD_LOG_FILE="android_build.log"

# =========================================================
# 1. CONFIGURATION
# =========================================================
# Set production environment for Expo
export EXPO_PUBLIC_ENVIRONMENT="production"

KEYSTORE_NAME=${KEYSTORE_NAME:-"release.keystore"}
KEYSTORE_ALIAS=${KEYSTORE_ALIAS:-"my-key-alias"}
KEYSTORE_PASS=${KEYSTORE_PASS:-"password123"}

KEY_ALG=${KEY_ALG:-"RSA"}
KEY_SIZE=${KEY_SIZE:-2048}
KEY_VALIDITY=${KEY_VALIDITY:-10000}
KEY_DNAME=${KEY_DNAME:-"CN=Hoang Bao, OU=Hoang Bao, O=HoangBao, L=Bac Ninh, S=Bac Ninh, C=VN"}

# Directories
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
ANDROID_DIR="$ROOT_DIR/android"
APP_DIR="$ANDROID_DIR/app"
SOURCE_KEYSTORE="$ROOT_DIR/$KEYSTORE_NAME"
DEST_KEYSTORE="$APP_DIR/$KEYSTORE_NAME"
CACHE_FILE="$ROOT_DIR/.build_hash_cache"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# =========================================================
# 2. ARGUMENT PARSING
# =========================================================
FORCE_PREBUILD=false     
PREBUILD_OPTS=""
BUILD_FORMAT="apk"

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --clean) PREBUILD_OPTS="$PREBUILD_OPTS --clean"; FORCE_PREBUILD=true ;;
        --platform) 
            if [[ -n "$2" && "$2" != --* ]]; then
                PREBUILD_OPTS="$PREBUILD_OPTS --platform $2"
                shift 
            else
                echo -e "${RED}❌ Error: --platform requires a value${NC}"; exit 1
            fi ;;
        --aab) BUILD_FORMAT="aab" ;;
        --apk) BUILD_FORMAT="apk" ;;
        *) echo -e "${RED}❌ Error: Unknown argument: $1${NC}" ;;
    esac
    shift 
done

if [ "$BUILD_FORMAT" == "aab" ]; then
    GRADLE_TASK="bundleRelease"
    OUTPUT_EXT="aab"
    INTERNAL_OUTPUT_PATH="$APP_DIR/build/outputs/bundle/release"
else
    GRADLE_TASK="assembleRelease"
    OUTPUT_EXT="apk"
    INTERNAL_OUTPUT_PATH="$APP_DIR/build/outputs/apk/release"
fi

# Fix Uppercase for macOS/Bash 3.2
OUTPUT_EXT_DISPLAY=$(echo "$OUTPUT_EXT" | tr '[:lower:]' '[:upper:]')

FINAL_FILENAME="build-${TIMESTAMP}.${OUTPUT_EXT}"
DEST_FILE="$ROOT_DIR/$FINAL_FILENAME"

# =========================================================
# 3. SMART CACHE CHECK
# =========================================================
calculate_config_hash() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        cat package.json app.json pnpm-lock.yaml 2>/dev/null | md5
    else
        cat package.json app.json pnpm-lock.yaml 2>/dev/null | md5sum | awk '{print $1}'
    fi
}

CURRENT_HASH=$(calculate_config_hash)
NEED_PREBUILD=true
CACHE_STATUS="${YELLOW}MISSING (First Run)${NC}"

if [ "$FORCE_PREBUILD" = true ]; then
    CACHE_STATUS="${RED}DISABLED (Forced Clean)${NC}"
else
    if [ -f "$CACHE_FILE" ] && [ -d "$ANDROID_DIR" ]; then
        SAVED_HASH=$(cat "$CACHE_FILE")
        if [ "$CURRENT_HASH" == "$SAVED_HASH" ]; then
            CACHE_STATUS="${GREEN}HIT (Config Unchanged)${NC}"
            NEED_PREBUILD=false
        else
            CACHE_STATUS="${YELLOW}MISS (Config Changed)${NC}"
        fi
    else
        CACHE_STATUS="${YELLOW}MISS (No Cache Found)${NC}"
    fi
fi

# =========================================================
# 4. SUMMARY & INPUT
# =========================================================
echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}📋 BUILD SUMMARY${NC}"
echo -e "${GREEN}==========================================${NC}"
echo -e "📅 Timestamp   : ${CYAN}$TIMESTAMP${NC}"
echo -e "📦 Build Type  : ${CYAN}$OUTPUT_EXT_DISPLAY ($BUILD_FORMAT)${NC}"
echo -e "📄 Output File : $FINAL_FILENAME"
echo -e "⚡ Cache Status: $CACHE_STATUS"
if [ "$NEED_PREBUILD" = true ]; then
    echo -e "🛠  Action      : ${YELLOW}FULL PREBUILD & COMPILE${NC}"
else
    echo -e "🛠  Action      : ${GREEN}FAST BUILD (Skip Prebuild)${NC}"
fi
echo -e "${GREEN}==========================================${NC}"
echo ""

read -p "👉 Press [Enter] to start..."
echo ""

# =========================================================
# 5. EXECUTION STEPS
# =========================================================

# --- STEP 1 ---
echo -n -e "${CYAN}1️⃣  Step 1/4: Expo Prebuild... ${NC}"
if [ "$NEED_PREBUILD" = true ]; then
    if [ -d "$ANDROID_DIR" ]; then rm -rf "$ANDROID_DIR"; fi
    
    if npx expo prebuild $PREBUILD_OPTS > /dev/null 2>&1; then
        echo "$CURRENT_HASH" > "$CACHE_FILE"
        
        # Patch Gradle
        GRADLE_PROP_FILE="$ANDROID_DIR/gradle.properties"
        if [ -f "$GRADLE_PROP_FILE" ]; then
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' 's/-Xmx2048m/-Xmx4096m/g' "$GRADLE_PROP_FILE"
            else
                sed -i 's/-Xmx2048m/-Xmx4096m/g' "$GRADLE_PROP_FILE"
            fi
            echo "" >> "$GRADLE_PROP_FILE"
            echo "org.gradle.caching=true" >> "$GRADLE_PROP_FILE"
            echo "org.gradle.configureondemand=true" >> "$GRADLE_PROP_FILE"
        fi
        echo -e "${GREEN}DONE${NC}"
    else
        echo -e "${RED}FAILED${NC}"
        echo "❌ Run 'npx expo prebuild' manually to see errors."
        exit 1
    fi
else
    echo -e "${GREEN}SKIPPED (Cached)${NC}"
fi

# --- STEP 2 ---
echo -n -e "${CYAN}2️⃣  Step 2/4: Checking Keystore... ${NC}"
if [ ! -f "$SOURCE_KEYSTORE" ]; then
    keytool -genkey -v \
        -keystore "$SOURCE_KEYSTORE" \
        -alias "$KEYSTORE_ALIAS" \
        -keyalg "$KEY_ALG" \
        -keysize "$KEY_SIZE" \
        -validity "$KEY_VALIDITY" \
        -storepass "$KEYSTORE_PASS" \
        -keypass "$KEYSTORE_PASS" \
        -dname "$KEY_DNAME" > /dev/null 2>&1
    echo -n "(Created) "
fi
cp -f "$SOURCE_KEYSTORE" "$DEST_KEYSTORE"
echo -e "${GREEN}DONE${NC}"

# --- STEP 3 ---
echo -e "${CYAN}3️⃣  Step 3/4: Compiling Native Code (Gradle)... ${NC}"
echo -e "    ${YELLOW}Running tasks... (Logs: ./android/$BUILD_LOG_FILE)${NC}"
echo "---------------------------------------------------------"

cd "$ANDROID_DIR"
if [[ "$OSTYPE" == "darwin"* ]]; then TOTAL_CORES=$(sysctl -n hw.ncpu); else TOTAL_CORES=$(nproc); fi
MAX_WORKERS=$((TOTAL_CORES - 2))
if [ "$MAX_WORKERS" -lt 1 ]; then MAX_WORKERS=1; fi

set -o pipefail 

# ⚡ LIVE LOGGING: Tee directly to current folder (android/)
nice -n 10 ./gradlew $GRADLE_TASK \
    --max-workers=$MAX_WORKERS \
    --build-cache \
    --configure-on-demand \
    --console=plain \
    -Pandroid.injected.signing.store.file=$DEST_KEYSTORE \
    -Pandroid.injected.signing.store.password=$KEYSTORE_PASS \
    -Pandroid.injected.signing.key.alias=$KEYSTORE_ALIAS \
    -Pandroid.injected.signing.key.password=$KEYSTORE_PASS 2>&1 \
    | tee "$BUILD_LOG_FILE" \
    | grep --line-buffered -E "^> Task|BUILD|FAILURE" 

BUILD_STATUS=$?

echo "---------------------------------------------------------"

if [ $BUILD_STATUS -eq 0 ]; then
    echo -e "    ${GREEN}✅ Gradle Build Finished.${NC}"
    rm "$BUILD_LOG_FILE" # Remove log inside android/
else
    echo -e "    ${RED}❌ Gradle Build Failed!${NC}"
    echo "    Check full logs at: $ANDROID_DIR/$BUILD_LOG_FILE"
    exit 1
fi

# --- STEP 4 ---
echo -n -e "${CYAN}4️⃣  Step 4/4: Moving Artifact... ${NC}"
SOURCE_FILE="$INTERNAL_OUTPUT_PATH/app-release.$OUTPUT_EXT"
if [ -f "$SOURCE_FILE" ]; then
    mv "$SOURCE_FILE" "$DEST_FILE"
    echo -e "${GREEN}DONE${NC}"
    
    echo ""
    echo -e "${GREEN}==========================================${NC}"
    echo -e "${GREEN}🎉 BUILD SUCCESSFUL!${NC}"
    echo -e "📂 Output: ${CYAN}$FINAL_FILENAME${NC}"
    echo -e "📍 Path  : ${CYAN}$DEST_FILE${NC}"
    echo -e "${GREEN}==========================================${NC}"
else
    echo -e "${RED}FAILED (File not found)${NC}"
    exit 1
fi
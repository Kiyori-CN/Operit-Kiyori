# 项目设置

本页面提供了设置 Operit AI 开发环境的说明，包括前置条件、项目结构、构建配置和依赖管理。适用于希望从源代码构建项目、参与开发或创建自定义构建的开发者。

有关通过自定义工具和包扩展功能的信息，请参阅[创建自定义工具](/AAswordman/Operit/9.2-creating-custom-tools)和[创建工具包](/AAswordman/Operit/9.3-creating-tool-packages)。

---

## 前置条件

在设置项目之前，请确保您的开发环境满足以下要求：
要求规格说明**操作系统**Windows、macOS 或 Linux任何支持 Android Studio 的操作系统**Android Studio**Flamingo (2022.2.1) 或更高版本推荐：最新稳定版本**JDK**Java 17 (OpenJDK)Kotlin 编译所需**Android SDK**API 34 (Android 14)编译 SDK 版本**NDK**r25 或更高版本用于原生 C++ 组件**CMake**3.18 或更高版本用于原生库编译**Gradle**8.0+由 Gradle wrapper 管理**Git**2.x用于版本控制**存储空间**5GB+ 可用空间用于项目、依赖和构建
**重要提示**：该项目需要额外的原生库文件，必须从 [Google Drive](https://drive.google.com/drive/folders/1g-Q_i7cf6Ua4KX9ZM6V282EEZvTVVfF7?usp=sharing) 单独下载。由于大小限制，这些文件未包含在代码仓库中。

---

## 项目结构

Operit 代码库采用多模块 Gradle 项目结构，包含一个主应用模块和多个原生库模块。

### 模块架构

```
app
(Main Application Module)

dragonbones
(DragonBones Animation)

terminal
(Terminal/Termux Integration)

mnn
(MNN Inference Engine)

llama
(llama.cpp Inference)

mmd
(MMD Model Support)

showerclient
(Virtual Display Client)

Native Libraries
(from Google Drive)

Assets
(Termux, Packages, Models)
```

### 目录结构

主应用模块遵循标准的 Android 项目组织结构：

```
app/
â”śâ”€â”€ src/main/
â”‚   â”śâ”€â”€ java/com/ai/assistance/operit/
â”‚   â”‚   â”śâ”€â”€ api/              # AI service providers and APIs
â”‚   â”‚   â”śâ”€â”€ core/             # Core business logic (tools, chat)
â”‚   â”‚   â”śâ”€â”€ data/             # Data models and persistence
â”‚   â”‚   â”śâ”€â”€ services/         # Android services (floating window, etc.)
â”‚   â”‚   â”śâ”€â”€ ui/               # UI components and screens
â”‚   â”‚   â””â”€â”€ util/             # Utility classes
â”‚   â”śâ”€â”€ cpp/                  # Native C++ code
â”‚   â”śâ”€â”€ res/                  # Android resources
â”‚   â”śâ”€â”€ assets/               # Bundled assets (Termux, toolkits)
â”‚   â””â”€â”€ AndroidManifest.xml   # App manifest
â”śâ”€â”€ build.gradle.kts          # Build configuration
â””â”€â”€ proguard-rules.pro        # ProGuard rules

```

**关键目录**：

- **`api/`**：包含 `EnhancedAIService`、提供商实现(`OpenAI`、`Anthropic`、`Gemini`)以及语音服务
- **`core/`**：包含 `AIToolHandler`、`Terminal` 和工具实现
- **`data/`**：定义数据模型(`ChatMessage`、`ChatHistory`)、DAO 和 `Room` 数据库架构
- **`services/`**：实现 `FloatingChatService`、`UIDebuggerService` 和服务委托
- **`ui/`**：Jetpack Compose UI 层，包含 `ChatViewModel`、屏幕和组件
- **`cpp/`**：用于性能关键操作的原生代码

---

## 初始设置

### 1. 克隆仓库

```
git clone https://github.com/AAswordman/Operit.git
cd Operit
```

### 2. 下载原生库

从 [Google Drive 文件夹]下载所需的原生库和资源文件。将它们解压到相应的目录：

- **原生库(`.so` 文件)**：放置在 `app/src/main/jniLibs/arm64-v8a/`
- **MNN 模型**：放置在 `app/src/main/assets/mnn/`
- **Termux bootstrap**：放置在 `app/src/main/assets/termux/`

### 3. 配置签名(可选)

对于发布构建，在项目根目录创建 `local.properties` 文件并配置签名信息：

```
# Signing configuration (optional for debug builds)
RELEASE_STORE_FILE=/path/to/your/keystore.jks
RELEASE_STORE_PASSWORD=your_store_password
RELEASE_KEY_ALIAS=your_key_alias
RELEASE_KEY_PASSWORD=your_key_password
Â 
# GitHub OAuth (optional, for GitHub integration features)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

构建系统会检查这些属性，仅当所有值都存在且密钥库文件存在时才应用签名。

### 4. 同步 Gradle

在 Android Studio 中打开项目并等待 Gradle 同步完成。这将下载构建文件中指定的所有依赖项。

---

## 构建配置

构建配置在 `app/build.gradle.kts` 中使用 Gradle Kotlin DSL 定义。

### 构建配置流程

```
local.properties

build.gradle.kts

Plugins
(Android, Kotlin, ObjectBox)

android { }
Configuration Block

signingConfigs { }

buildTypes { }

compileOptions { }

ndk { }

externalNativeBuild { }

dependencies { }
```

### 关键构建设置

```
android {
    namespace = "com.ai.assistance.operit"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.ai.assistance.operit"
        minSdk = 26          // Android 8.0+
        targetSdk = 34       // Android 14
        versionCode = 39
        versionName = "1.9.1+2"

        ndk {
            abiFilters.addAll(listOf("arm64-v8a"))  // 64-bit ARM only
        }
    }
}
```

**ABI 过滤**：项目明确仅针对 `arm64-v8a` 架构，以减小 APK 大小并避免 32 位和 64 位原生库之间的冲突。

### 构建类型

构建类型说明代码混淆签名**debug**开发构建已禁用调试或发布密钥**release**生产构建已禁用(当前)发布密钥(如已配置)**nightly**自动化每夜构建已禁用调试密钥
`nightly` 构建类型为持续集成配置，生成名为 `app-nightly.apk` 的 APK。

---

## 依赖项

项目使用通过 Gradle 版本目录和直接声明管理的全面依赖项集。

### 依赖管理架构

```
Dependency Categories

build.gradle.kts

gradle/libs.versions.toml
(Version Catalog)

Jetpack Compose
(UI Framework)

Room
(Database)

ObjectBox
(Object Database)

Network
(OkHttp, Retrofit)

AI/ML
(TensorFlow Lite, ONNX)

Native Modules
(MNN, llama.cpp)

Other
(Shizuku, Coil, etc.)
```

### 主要依赖类别

#### 1. UI 框架(Jetpack Compose)

```
implementation(platform(libs.compose.bom))
implementation(libs.compose.ui)
implementation(libs.compose.material3)
implementation(libs.activity.compose)
implementation(libs.navigation.compose)
```

使用 Compose BOM(物料清单)确保 Compose 库之间的版本一致性。

#### 2. 数据库持久化

- **Room**：用于聊天历史、消息和配置的主数据库

```
implementation(libs.room.runtime)
implementation(libs.room.ktx)
kapt(libs.room.compiler)
```

- **ObjectBox**：用于记忆库和工具包的高性能对象数据库

```
implementation(libs.objectbox.kotlin)
kapt(libs.objectbox.processor)
```

#### 3. AI/ML 库

库用途版本约束`tensorflow-lite`设备端 ML 推理最新稳定版`mediapipe-tasks-text`文本嵌入模型最新稳定版`onnxruntime-android`ONNX 模型推理1.17.1`mlkit-text-recognition`多语言 OCR最新稳定版

#### 4. 原生模块

作为独立 Gradle 项目编译的自定义模块：

- **`project(":mnn")`**：用于本地模型的 MNN 推理引擎
- **`project(":llama")`**：用于 GGUF 模型支持的 llama.cpp
- **`project(":dragonbones")`**：桌面宠物的动画系统
- **`project(":mmd")`**：MMD 模型渲染
- **`project(":terminal")`**：Termux 集成
- **`project(":showerclient")`**：虚拟显示客户端

#### 5. 系统集成

- **Shizuku**：ADB 级别权限

```
implementation(libs.shizuku.api)
implementation(libs.shizuku.provider)
```

- **libsu**：Root 访问管理

```
implementation("com.github.topjohnwu.libsu:core:6.0.0")
implementation("com.github.topjohnwu.libsu:service:6.0.0")
```

#### 6. 网络和通信

- **OkHttp**：支持 SSE 的 HTTP 客户端

```
implementation(libs.okhttp)
implementation(libs.okhttp.sse)
```

- **Retrofit**：REST API 客户端(用于 GitHub OAuth 等)
- **NanoHTTPD**：用于工作区功能的本地 Web 服务器

### 版本冲突解决

构建脚本包含显式的版本冲突解决：

```
configurations.all {
    resolutionStrategy {
        force("org.jetbrains.kotlinx:kotlinx-serialization-json:1.5.1")
        force("io.ktor:ktor-client-core:2.3.5")
        force("org.jetbrains.kotlin:kotlin-stdlib:1.9.22")
        force("org.bouncycastle:bcprov-jdk18on:1.78")
    }
}
```

这确保了 MCP SDK、Kotlin 序列化和其他可能存在冲突传递依赖的依赖项之间的兼容性。

---

## 原生代码编译

该项目包含通过 CMake 编译的 C++ 组件。

### CMake 配置

```
externalNativeBuild {
    cmake {
        path = file("src/main/cpp/CMakeLists.txt")
    }
}
Â 
// In defaultConfig:
externalNativeBuild {
    cmake {
        cppFlags("-std=c++17")
    }
}
```

原生代码使用 **C++17** 标准，并配置为针对 `arm64-v8a` ABI 构建。CMake 构建脚本位于 `app/src/main/cpp/CMakeLists.txt`。

---

## 打包和资源

### 资源排除

为避免冲突并减小 APK 大小，构建配置排除了某些元文件：

```
packaging {
    resources {
        excludes += "/META-INF/{AL2.0,LGPL2.1}"
        excludes += "/META-INF/LICENSE*"
        excludes += "/META-INF/NOTICE*"
        excludes += "/META-INF/*.kotlin_module"
        // ... and more

        pickFirsts += "**/*.so"  // Use first found .so file
    }
}
```

这可以防止传递依赖中重复文件导致的构建失败。

### JNI 库

原生库使用传统打包模式以确保兼容性：

```
jniLibs {
    useLegacyPackaging = true
}
```

---

## 构建和运行

### 构建命令

#### 从 Android Studio

1. **Build → Make Project** 或 **Ctrl+F9** (Windows/Linux) / **Cmd+F9** (macOS)
2. **Run → Run 'app'** 或 **Shift+F10** 以构建并安装到已连接的设备

#### 从命令行

```
# Debug build
./gradlew assembleDebug
Â 
# Release build (requires signing configuration)
./gradlew assembleRelease
Â 
# Nightly build
./gradlew assembleNightly
Â 
# Install on connected device
./gradlew installDebug
```

### 输出位置

构建的 APK 文件位于：

- Debug: `app/build/outputs/apk/debug/app-debug.apk`
- Release: `app/build/outputs/apk/release/app-release.apk`
- Nightly: `app/build/outputs/apk/nightly/app-nightly.apk`

nightly 构建类型明确将输出重命名为 `app-nightly.apk` 以供 CI/CD 流水线使用。

---

## 故障排除

### 常见问题及解决方案

#### 1. 缺少原生库

**症状**：构建成功但应用启动时崩溃，提示 `UnsatisfiedLinkError`

**解决方案**：确保已从 Google Drive 下载原生库并放置到 `app/src/main/jniLibs/arm64-v8a/`

#### 2. ObjectBox 构建错误

**症状**：与 ObjectBox 注解处理相关的错误

**解决方案**：

- 确保已应用 ObjectBox Gradle 插件：`id("io.objectbox")`
- 清理并重新构建：`./gradlew clean build`

#### 3. 重复类错误

**症状**：构建失败，提示"发现重复类"错误

**解决方案**：构建脚本已处理大多数冲突，但如果出现新冲突：

- 检查 `build.gradle.kts` 中的 `configurations.all` 块
- 为冲突的依赖项添加排除规则

#### 4. 未找到 CMake

**症状**：原生编译期间提示缺少 CMake 错误

**解决方案**：

- 通过 Android Studio SDK Manager 安装 CMake
- 或在 `local.properties` 中指定 CMake 路径：`cmake.dir=/path/to/cmake`

#### 5. 签名配置问题

**症状**：Release 构建因签名错误而失败

**解决方案**：

- 验证 `local.properties` 中是否有正确的 keystore 路径和密码
- 对于开发环境，使用 debug 构建，无需 release 签名

#### 6. 构建时内存不足

**症状**：Gradle daemon 因 `OutOfMemoryError` 崩溃

**解决方案**：在 `gradle.properties` 中增加堆大小：

```
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
```

---

## 关键文件参考

文件用途`app/build.gradle.kts`主构建配置`gradle/libs.versions.toml`依赖版本目录`local.properties`本地环境配置(签名、路径)`app/src/main/AndroidManifest.xml`应用清单和权限`app/proguard-rules.pro`代码混淆规则`app/src/main/cpp/CMakeLists.txt`原生代码构建配置
有关特定子系统的更详细信息，请参阅：

- 架构模式和设计原则：
- 使用自定义工具扩展功能：
- MCP 插件开发：

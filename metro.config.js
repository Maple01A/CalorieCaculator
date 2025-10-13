const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// WASMサポート
config.resolver.assetExts.push('wasm');
config.resolver.sourceExts.push('wasm');

// NativeBase用の設定
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

// モジュール解決の設定
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;

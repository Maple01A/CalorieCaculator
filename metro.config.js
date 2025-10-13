const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqliteのWebサポート用の設定
config.resolver.assetExts.push('wasm');
config.resolver.sourceExts.push('wasm');

// WASMファイルの解決を改善
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;

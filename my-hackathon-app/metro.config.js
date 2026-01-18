const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

// 1. Support for .bin files (weights)
config.resolver.assetExts.push('bin');

// 2. REQUIRED for TensorFlow.js to find the right files
config.resolver.sourceExts.push('cjs');

module.exports = config;
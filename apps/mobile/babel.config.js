module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Ensure no other plugins are interfering with global names
    ],
  };
};

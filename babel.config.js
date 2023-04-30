module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@src": "./src",
          },
        },
      ],
      "@realm/babel-plugin",
      ["@babel/plugin-proposal-decorators", { legacy: true }],
    ],
  };
};

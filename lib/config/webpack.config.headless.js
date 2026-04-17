const path = require("path")
const config = require("./webpack.config")
const env = require("./env")

module.exports = {
  ...config,
  mode: "development",
  devServer: {
    hot: false,
    port: env.PORT_PROJECT + 1,
    static: {
      directory: path.join(__dirname, "..", "..", "project", "public"),
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
  plugins: [...config.plugins],
}

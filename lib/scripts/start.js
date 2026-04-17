/**
 * Starts webpack-dev-server for local development with live reload.
 */

const chalk = require("chalk")
const Webpack = require("webpack")
const WebpackDevServer = require("webpack-dev-server")
const open = require("open")

const env = require("../config/env")
const webpackConfig =
  env.RUN_PROJECT == true
    ? require("../config/webpack.config.dev")
    : require("../config/webpack.config.headless")

const logger = {
  error: chalk.red.bold,
  success: chalk.green.bold,
  command: (txt) => chalk.bgWhite.bold(` ${txt} `),
  infos: chalk.gray,
  url: chalk.bold.blue,
}

function padn(n, len = 2, char = "0") {
  return n.toString().padStart(len, char)
}

;(async () => {
  const URL_PROJECT = `http://localhost:${env.PORT_PROJECT}`

  const compiler = Webpack({
    ...webpackConfig,
    infrastructureLogging: {
      level: "error",
    },
    stats: "errors-only",
  })
  const server = new WebpackDevServer(webpackConfig.devServer, compiler)

  if (env.RUN_PROJECT === true) {
    compiler.hooks.done.tap("project", (stats) => {
      const hasErrors = stats.hasErrors()
      if (hasErrors) {
        console.log(logger.error("[project] compilation has failed"))
      } else {
        const date = new Date()
        const time = `${padn(date.getHours())}:${padn(date.getMinutes())}:${padn(
          date.getSeconds()
        )}`
        console.log(
          `${logger.success("[project] compiled successfully")} @ ${time}`
        )
      }
    })
  }

  server.startCallback(() => {
    const l =
      env.RUN_PROJECT === true
        ? `${logger.success("[project] your project is running on")} ${logger.url(URL_PROJECT)}`
        : `${logger.success("[project] your project might be running on")} ${logger.url(URL_PROJECT)} ${logger.success(
            "but this is user specified so we don't really know"
          )}`
    console.log(l)
    console.log()
    if (env.RUN_PROJECT === true) {
      open(URL_PROJECT).catch(() => {})
    }
  })
})()

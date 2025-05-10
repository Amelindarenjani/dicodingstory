const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    app: path.resolve(__dirname, "src/scripts/index.js"),
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src/index.html"),
      inject: true,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/public/"),
          to: path.resolve(__dirname, "dist/"),
        },
      ],
    }),
  ],
  // // Tambahkan devServer configuration di sini
  // devServer: {
  //   static: {
  //     directory: path.join(__dirname, 'dist'), // Ganti dari contentBase ke static.directory
  //   },
  //   compress: true,
  //   port: 9000,
  //   hot: true,
  //   headers: {
  //     "Service-Worker-Allowed": "/"
  //   },
  //   // Tambahkan ini untuk handle routing SPA
  //   historyApiFallback: true,
  // }
};

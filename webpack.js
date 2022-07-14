const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

const config = {
  entry: './src/main.ts',
  output: {
    filename: `[name].[hash].min.js`,
    chunkFilename: `[name].[chunkhash].min.js`
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    // Need to add the .tsx, .ts extensions for ts-loader
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'src/images', to: 'images', noErrorOnMissing: true },
        { from: 'src/sounds', to: 'sounds', noErrorOnMissing: true },
        { from: 'src/fonts', to: 'fonts', noErrorOnMissing: true }
      ]
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      minify: false
    })
  ]
}

module.exports = config

module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  mode: "development"
};

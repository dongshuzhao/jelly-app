export default {
  plugins: {
    'postcss-custom-properties': {
      preserve: false // 确保CSS变量被转换为静态值
    },
    autoprefixer: {
      overrideBrowserslist: [
        'iOS >= 10',
        'Safari >= 10',
        'last 2 versions'
      ]
    },
  },
}

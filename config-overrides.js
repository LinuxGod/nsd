const path = require('path');

module.exports = function override(config, env){
  // // 使用你自己的 ESLint
  //   let eslintLoader = config.module.rules[1]
  //   eslintLoader.use[0].options.useEslintrc = true

  // Add the LESS loader second-to-last
  // let loaderList = config.module.rules[2].oneOf;
  // loaderList.splice(loaderList.length - 1, 0, {
  //   test: /\.less$/,
  //   use: ["style-loader", "css-loader", "less-loader"]
  // })
  
  // 自定义目录符号
  config.resolve.alias['@'] = path.resolve(__dirname,'./src')
  
  return config;
}
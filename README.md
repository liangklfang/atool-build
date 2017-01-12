(1)atool-build
 该脚手架只是对webpack进行了简单的封装。首先,webpack那些基本配置信息都有了默认信息，并内置了很多默认的`loader`来处理文件;然后,他是自己调用`compiler.run`方法开始编译的，并通过compiler.watch来监听文件的变化；里面通过一个hack来解决extract-webpack-text-plugin打印log的问题;Babel的缓存目录会使用操作系统默认的缓存目录来完成，使用os模块的tmpdir方法；其中devtool采用的是如下的方式加载:

 ```js
 webpack --devtool source-map
 ```

`.`如果在 package.json 中 browser 没有设置，则设置 child_process, cluster, dgram, dns, fs, module, net, readline, repl, tls 为 'empty'!

`.`对于自定义添加的 loader，plugin等依赖，需要在项目文件夹中npm install 这些依赖。但不需要再安装 webpack 依赖，因为可以通过 require('atool-build/lib/webpack') 得到；

`.`可以通过 atool-build --config file 来指定需要用到的配置文件，默认是 webpack.config.js，要是找不到则使用内置的 webpack 配置。

(2)ProgressPlugin学习
```javascript
 config.plugins.push(
  new ProgressPlugin((percentage, msg) => {
    const stream = process.stderr;
    if (stream.isTTY && percentage < 0.71) {
      stream.cursorTo(0);
      stream.write(`📦  ${chalk.magenta(msg)}`);
      stream.clearLine(1);
    } else if (percentage === 1) {
      console.log(chalk.green('webpack: bundle build is now finished.'));
    }
  })
```
(3)插件详见官方网站https://webpack.github.io/docs/list-of-plugins.html
ProgressPlugin
  表示compiler的钩子函数去获取进度信息

NoErrorsPlugin
  表示如果编译的时候有错误，那么我们跳过emit阶段，因此包含错误信息的资源都不会经过emit阶段也就是没有文件产生。这时候所有资源的emitted都是false。如果你使用CLI，那么当你使用这个插件的时候不会退出并产生一个error code，如果你想要CLI退出，那么使用bail选项。

DefinePlugin
  表示允许你定义全局变量，可以用于在编译阶段和开发阶段进行不同的处理。用法如下:
```javascript
 new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        }),
```

DedupePlugin
   查找相等或者相似的文件并从输出去剔除。在watch模式下不要使用，要在production下使用

(4)允许shell配置项目
 可以通过<shell>命令传入的outputPath，publicPath，compress，hash，config, watch， verbose,json进行配置。
 config:如果是函数，那么会传入webpackConfig调用,不过是在outputPath，publicPath，compress，hash都进行更新以后；如果是字符串，那么会和这个config路径指定的文件合并，然后输出：
```js
if (typeof args.config === 'function') {
    webpackConfig = args.config(webpackConfig) || webpackConfig;
  } else {
    webpackConfig = mergeCustomConfig(webpackConfig, resolve(args.cwd, args.config || 'webpack.config.js'));
  }
  ```
  进行处理的方式也是很简单的:
  ```js
    export default function mergeCustomConfig(webpackConfig, customConfigPath) {
  if (!existsSync(customConfigPath)) {
    return webpackConfig;
  }
  const customConfig = require(customConfigPath);
  //必须返回函数,也就是我们通过shell配置的args.config必须是返回一个函数！
  if (typeof customConfig === 'function') {
    return customConfig(webpackConfig, ...[...arguments].slice(2));
  }
  throw new Error(`Return of ${customConfigPath} must be a function.`);
}
  ```
 也就是说，我们会找到这个自己配置的文件导出的[函数]，调用函数的时候传入我们的webpackConfig，同时调用mergeCustomConfig两个以后的参数会直接传给这个函数！注意下面这种写法：
 ```js
   ...[...arguments].slice(2)
   //其中[...arguments]直接将arguments转化为数组，最后一个运算符是直接取出数组中元素
```
watch:是否在shell中传入watch参数（这里的watch是一个时间参数）
```js
 if (args.watch) {
    compiler.watch(args.watch || 200, doneHandler);
  } else {
    compiler.run(doneHandler);
  }
  ```
这里已经调用了compiler的核心方法watch和run~

json:是否在shell中配置了json参数，在doneHandle，也就是说每次修改都会调用这个方法，然后写一个默认为build-bundle.json文件：

```js
 if (args.json) {
      const filename = typeof args.json === 'boolean' ? 'build-bundle.json' : args.json;
      const jsonPath = join(fileOutputPath, filename);
      writeFileSync(jsonPath, JSON.stringify(stats.toJson()), 'utf-8');
      console.log(`Generate Json File: ${jsonPath}`);
    }
    ```
在这里每次输出的json文件的内容是直接对states对象转化为json格式的内容

verbose:是否在shell中传入verbose参数(是否输入过程日志)
``` if (!args.verbose) {
    compiler.plugin('done', (stats) => {
      stats.stats.forEach((stat) => {
        stat.compilation.children = stat.compilation.children.filter((child) => {
          return child.name !== 'extract-text-webpack-plugin';
        });
      });
    });
  }
```
至于为什么不输出过程日志是通过移除extract-text-webpack-plugin目前还没有弄明白，弄明白后会及时更新！同时注意，这里是在compiler的done回调中执行的！
(4)学习那些插件的写法，深入理解compiler和compliation不同的生命周期

  https://github.com/liangklfangl/webpack-compiler-and-compilation

(5)学习为什么说getWebpackCommonConfig返回的是一个webpack的common配置信息，这些信息都是什么意思？为何说getBabelCommonConfig.js得到的是babel的基本配置，配置是什么意思？getTSCommonConfig得到的又是什么配置？

(6)我们在package.json中配置的theme会被传入到以下的插件中:
ExtractTextPlugin
```js
   {
          test(filePath) {
            return /\.less$/.test(filePath) && !/\.module\.less$/.test(filePath);
          },
          loader: ExtractTextPlugin.extract(
            `${require.resolve('css-loader')}?sourceMap&-autoprefixer!` +
            `${require.resolve('postcss-loader')}!` +
            `${require.resolve('less-loader')}?{"sourceMap":true,"modifyVars":${JSON.stringify(theme)}}`
          ),
        }
```
首先：一种文件可以使用多个loader来完成；然后：我们可以使用?为不同的loader添加参数并且注意哪些参数是变量哪些参数是字符串！比如对于less-loader来说，我们使用了modifyVars来覆盖原来的样式,因为在loader里面会通过query读取查询字符串，然后做相应的覆盖（因为less里面使用了变量）。
```less
less.modifyVars({
  '@buttonFace': '#5B83AD',
  '@buttonText': '#D9EEF2'
});
```
详见链接:[modifyVars](http://lesscss.org/usage/#using-less-in-the-browser-modify-variables)














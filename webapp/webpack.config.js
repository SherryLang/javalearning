var webpack = require("webpack");
var path=require('path');
var fs = require('fs');
var pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
//各种插件依赖
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var SpritesmithPlugin = require('webpack-spritesmith');
const DEBUG = process.env.NODE_ENV == 'production';
//雪碧图
var cssImageRefPath=path.resolve(__dirname, './src/icons/icon.png').replace(/\\/g,"/");
var webpackconfig = {
    devtool: DEBUG?'source-map':'',
	//资源输出路径
    output: {
        publicPath: DEBUG?"/resources/":"resources/",
        path: DEBUG?path.resolve(__dirname, './bin/public/resources')
            :path.resolve(__dirname, 'dist/public/resources/'),
        filename: 'scripts/[name].js',
        sourceMapFilename: 'maps/[name].map',
        chunkFilename: 'scripts/[name].js?[chunkhash]'
    },
    resolve: {
        extensions: ['.js','.ejs','.css','.scss'],
        alias: {
            start:path.resolve(__dirname, "./src/pages/entry/start.js"),
            manage:path.resolve(__dirname, "./src/pages/entry/manage.js"),
            components:path.resolve(__dirname, "./src/pages/entry/components.js"),
            app:path.resolve(__dirname, "./src/components/core/app"),
            component:path.resolve(__dirname, "./src/components/core/component"),
            module:path.resolve(__dirname, "./src/components/core/module"),
            jquery: path.join(__dirname, './src/vendor/jquery/jquery-1.8.3'),
            jqueryform: path.join(__dirname, './src/vendor/jquery/jquery.form.js'),
            jqueryui: path.join(__dirname, './src/vendor/jquery/jquery-ui-1.12.1.custom/jquery-ui')
        }
    },
    entry: {
        //启动页
        "start": "start",
        "manage": "manage",
        "components": "components",
        "vendor": [
            "console-browserify",
            "es5-shim",
            "es5-sham-ie8",
            "babel-polyfill",
            "jquery",
            "jqueryform",
            "jqueryui",
            "axios"
        ]
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(vendor|node_modules|test)/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            "presets": ["es2015"],
                            "plugins": [
                                "transform-es3-property-literals",
                                "transform-es3-member-expression-literals"
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.ejs$/,
                loader: 'ejs-loader'
            },
            {
                test:/\.json$/,
                loader:'json-loader'
            },
            {
                test: /\.scss$/,
                loaders: ["style-loader", "css-loader?sourceMap", "sass-loader?sourceMap&includePaths[]=" + path.resolve(__dirname, './node_modules/compass-mixins/lib')]

            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader', publicPath: ""})
            },
            {
                test:/\.(jpg|jpeg|gif|png|woff|woff2|svg|ttf|eot|htc)$/,
                loader:'url-loader?limit=1&name=images/[hash].[ext]'
            }
        ]
    },
    plugins:[
        new CleanWebpackPlugin([
            DEBUG?"bin/public":"dist"
        ]),
        DEBUG?new CopyWebpackPlugin([
            { from: 'src/conf', to: '../conf' },
            { from: 'src/demoData', to: '../demoData' }
        ]):new CopyWebpackPlugin([
                { from: 'src/conf', to: '../conf' },
                { from: 'src/demoData', to: '../demoData' },
                { from: 'bin/controllers', to: '../../controllers' },
                { from: 'bin/models', to: '../../models' },
                { from: 'bin/services', to: '../../services' },
                { from: 'bin/conf', to: '../../conf' },
                { from: 'bin/lib', to: '../../lib' },
                { from: 'bin/views', to: '../../views' },
                { from: 'bin/app.js', to: '../../app.js' },
                { from: 'bin/www.js', to: '../../www.js' },
                { from: 'bin/routes.js', to: '../../routes.js' },
                { from: 'package.json', to: '../../package.json' }
            ]),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: Infinity
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new SpritesmithPlugin({
            src: {
                cwd: path.resolve(__dirname, 'src/icons/png'),
                glob: '*.png'
            },
            target: {
                image: path.resolve(__dirname, 'src/icons/icon.png'),
                css: path.resolve(__dirname, 'src/theme/sprites.scss')
            },
            apiOptions: {
                cssImageRef: cssImageRefPath
            }
        }),
        new ExtractTextPlugin("[name].css"),
        new webpack.ProvidePlugin({
            $$: "app",
            $$Component:"component",
            $$Module:"module",
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
            "window.$": "jquery",
            console: "console-browserify",
            axios:"axios"
        }),
        DEBUG?()=>{}:new webpack.optimize.UglifyJsPlugin({ //压缩代码
                compress: {
                    warnings: false
                },
                except: ['$super', '$', 'jQuery','exports', 'require'] //排除关键字
            }),
        function() {
            this.plugin("done", function(stats) {
                var chunkMap={}
                for(var chunk of stats.toJson().chunks){
                    var filename=chunk.files[0]
                    var module=chunk.origins[0]["moduleName"];
                    var pos=filename.indexOf("?");
                    var name=filename;
                    if(pos>-1){
                        name=name.substr(0,pos);
                    }
                    if(module&&module.indexOf("./src/pages/modules")>-1) {
                        module = module.substr(module.indexOf("./src/pages/modules") + 18)
                        chunkMap["/resources/" + name] = module
                    }
                }
                require("fs").writeFileSync(
                    path.join(__dirname, "./bin/conf", "modules.json"),
                    JSON.stringify(chunkMap))
            });
        }
    ]
};
 var createApplication = function (obj) {
     var plugin = new HtmlWebpackPlugin({
         title: obj.label ? (obj.label + "--" + pkg.title) : pkg.title,
         module: obj.module ? obj.module : "",
         filename: "../" + obj.filename + '.html',
         template: './src/pages/entry/' + (obj.start ? obj.start : 'start') + '.ejs',
         inject: 'body',
         chunks: ['vendor', obj.start ? obj.start : 'start'],
         hash: true
     });
     webpackconfig.plugins.push(plugin);
 }
 //主页
 createApplication({filename: "index"});
 //后台管理页
 createApplication({module: "sysManage", filename: "manageIndex",start: "manage"});
//组件页
createApplication({filename: "components",start:"components"});
module.exports=webpackconfig;
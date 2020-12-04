const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
    watch: true,
    stats: {
        assets: true,
        modules: false
    },
    optimization: {
        minimize: false
    },
    entry: {
        inject: './src/inject/inject.ts',
        background: './src/background.ts',
        options: './src/options.tsx'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: [".ts", ".tsx", '.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.(png|jpg)/,
                use: 'file-loader?name=img/[name].[hash:6].[ext]'
            },
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: "ts-loader"
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader'
            },
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: './src/options.html', to: './' },
                { from: './src/manifest.json', to: './' },
                { from: './src/icon/*', to: './icon', flatten: true }
            ],
        }),
    ]
}
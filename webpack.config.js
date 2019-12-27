const path = require( 'path' );
const webpack = require( 'webpack' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const ExtractTextPlugin = require( 'extract-text-webpack-plugin' );
const BrowserSyncPlugin = require( 'browser-sync-webpack-plugin' );
const ImageminPlugin = require( 'imagemin-webpack-plugin' ).default;
const CleanWebpackPlugin = require( 'clean-webpack-plugin' );
const WebpackRTLPlugin = require( 'webpack-rtl-plugin' );
const wpPot = require( 'wp-pot' );

const inProduction = ( 'production' === process.env.NODE_ENV );

const config = {

	devtool: 'source-map',
	module: {
		rules: [

			// Use Babel to compile JS.
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loaders: [
					'babel-loader',
				],
			},

			// Create RTL styles.
			{
				test: /\.css$/,
				loader: ExtractTextPlugin.extract( 'style-loader' ),
			},

			// SASS to CSS.
			{
				test: /\.scss$/,
				use: ExtractTextPlugin.extract( {
					use: [ {
						loader: 'css-loader',
						options: {
							sourceMap: true,
						},
					}, {
						loader: 'postcss-loader',
						options: {
							sourceMap: true,
						},
					}, {
						loader: 'sass-loader',
						options: {
							sourceMap: true,
							outputStyle: ( inProduction ? 'compressed' : 'nested' ),
						},
					} ],
				} ),
			},

			// Image files.
			{
				test: /\.(png|jpe?g|gif|svg)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'images/[name].[ext]',
							publicPath: '../',
						},
					},
				],
			},
		],
	},

	// Plugins. Gotta have em'.
	plugins: [

		// Removes the "dist" folder before building.
		new CleanWebpackPlugin( [ 'assets/dist' ] ),

		new ExtractTextPlugin( 'css/[name].css' ),

		// Create RTL css.
		new WebpackRTLPlugin(),

		// Copy images and SVGs
		new CopyWebpackPlugin( [ { from: 'assets/src/images', to: 'images' } ] ),

		// Minify images.
		// Must go after CopyWebpackPlugin above: https://github.com/Klathmon/imagemin-webpack-plugin#example-usage
		new ImageminPlugin( { test: /\.(jpe?g|png|gif|svg)$/i } ),
	],
};

module.exports = [
	Object.assign( {
		entry: {
			perform: [ './assets/src/scss/frontend/main.scss', './assets/src/js/frontend/main.js' ],
			admin: [ './assets/src/scss/admin/admin.scss' ],
		},
		output: {
			path: path.join( __dirname, './assets/dist/' ),
			filename: 'js/[name].js',
			library: 'Perform',
			libraryTarget: 'umd',
		},
	}, config ),
];

// inProd?
if ( inProduction ) {
	// POT file.
	wpPot( {
		package: 'Perform for WordPress',
		domain: 'perform',
		destFile: 'languages/perform-for-wordpress.pot',
		relativeTo: './',
		bugReport: 'https://github.com/mehul0810/perform-for-wordpress/issues/new',
		team: 'Mehul Gohil <hello@mehulgohil.in>',
	} );

	// Uglify JS.
	config.plugins.push( new webpack.optimize.UglifyJsPlugin( { sourceMap: true } ) );

	// Minify CSS.
	config.plugins.push( new webpack.LoaderOptionsPlugin( { minimize: true } ) );
}

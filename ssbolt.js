"use strict";

/*;
	@module-license:
		The MIT License (MIT)
		@mit-license

		Copyright (@c) 2017 Richeve Siodina Bebedor
		@email: richeve.bebedor@gmail.com

		Permission is hereby granted, free of charge, to any person obtaining a copy
		of this software and associated documentation files (the "Software"), to deal
		in the Software without restriction, including without limitation the rights
		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the Software is
		furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in all
		copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
		SOFTWARE.
	@end-module-license

	@module-configuration:
		{
			"package": "ssbolt",
			"path": "ssbolt/ssbolt.js",
			"file": "ssbolt.js",
			"module": "ssbolt",
			"author": "Richeve S. Bebedor",
			"contributors": [
				"John Lenon Maghanoy <johnlenonmaghanoy@gmail.com>"
			],
			"eMail": "richeve.bebedor@gmail.com",
			"repository": "https://github.com/volkovasystems/ssbolt.git",
			"test": "ssbolt-test.js",
			"global": true
		}
	@end-module-configuration

	@module-documentation:
		Catches error on middleware, request, and response.
	@end-module-documentation

	@include:
		{
			"called": "called",
			"express": "express",
			"exorcise": "exorcise",
			"Olivant": "olivant",
			"optfor": "optfor",
			"protype": "protype",
			"raze": "raze",
			"snapd": "snapd"
		}
	@end-include
*/

const called = require( "called" );
const express = require( "express" );
const exorcise = require( "exorcise" );
const Olivant = require( "olivant" );
const optfor = require( "optfor" );
const protype = require( "protype" );
const raze = require( "raze" );
const snapd = require( "snapd" );

const ssbolt = function ssbolt( middleware, name ){
	/*;
		@meta-configuration:
			{
				"middlware:required": [
					"object",
					global.APP,
					express( )
				],
				"name": "string"
			}
		@end-meta-configuration
	*/

	middleware = optfor( arguments, function check( parameter ){
		return ( !protype( parameter, STRING ) &&
			protype( parameter, FUNCTION ) &&
			protype( parameter.use, FUNCTION ) &&
			protype( parameter.on, FUNCTION ) &&
			protype( parameter.removeAllListeners, FUNCTION ) );
	} );

	middleware = middleware || global.APP || express( );

	if( !protype( middleware, FUNCTION ) ||
		!protype( middleware.use, FUNCTION ) ||
		!protype( middleware.on, FUNCTION ) ||
		!protype( middleware.removeAllListeners, FUNCTION ) )
	{
		Fatal( "invalid middleware" );

		return;
	}

	name = optfor( arguments, STRING );

	name = name || "main";

	if( !protype( name, STRING ) ){
		Fatal( "invalid name" );

		return;
	}

	middleware.use( function onRequest( request, response, next ){
		let cleanUp = called( function cleanUp( ){
			snapd( function cleanThen( ){
				request.removeAllListeners( );

				response.removeAllListeners( );
			}, 1000 );
		} );

		request.once( "error",
			function onError( ){
				Issue( name, "request", arguments, request )
					.silence( )
					.report( )
					.prompt( );

				cleanUp( );
			} );

		response.once( "error",
			function onError( ){
				Issue( name, "response", arguments, response )
					.silence( )
					.report( )
					.prompt( );

				cleanUp( );
			} );

		response.once( "close", cleanUp );

		response.once( "finish", cleanUp );

		next( );
	} );

	middleware.on( "error",
		function onError( ){
			Issue( name, "middleware", arguments )
				.silence( )
				.report( )
				.prompt( );
		} );

	exorcise( function cleanUp( ){
		middleware.removeAllListeners( "error" );
	} );

	return middleware;
};

module.exports = ssbolt;

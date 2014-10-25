/*
	Copyright (C) 2013 Guilherme Vieira

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
'use strict';
function is_integer(number) {
	return (number % 1 === 0);
}
function default_if_undefined(value, default_value) {
	if(value === undefined) {
		return default_value;
	}
	else {
		return value;
	}
}
window.analyze_tilemap = function(image, canvas, options, callback) {
	if(!callback) {
		callback = options;
		options = {};
	}
	var tile_size = default_if_undefined(options.tile_size, 32);
	var log_progress = default_if_undefined(options.log_progress, true);
	var log_errors = default_if_undefined(options.log_errors, true);
	var hashes_per_event_loop = default_if_undefined(options.hashes_per_event_loop, 4);
	var context;
	var analysis;
	try {
		canvas.width = image.width;
		canvas.height = image.height;
		context = canvas.getContext('2d');
		context.drawImage(image, 0, 0);
		analysis = {
			tile_size: tile_size
			, tileset: {}
			, tilemap: {
				width: canvas.width / tile_size
				, height: canvas.height / tile_size
				, tiles: {}
			}
		};
		if (
			!is_integer(analysis.tilemap.width)
			|| !is_integer(analysis.tilemap.height)
		) {
			throw new Error("Map width and height must be multiples of tile size.");
		}
		(function analyze_hashes() {
			var i = 0;
			var map_area_in_tiles = analysis.map_width_in_tiles * analysis.map_height_in_tiles;
			var interval = setInterval (
				function() {
					var x;
					var y;
					var tile_hash;
					if(log_progress && i % 32 === 0) {
						console.log("Hashing tile ", i, "out of", map_area_in_tiles, "...");
					}
					do {
						x = i % analysis.map_width_in_tiles;
						y = Math.floor(i / analysis.map_width_in_tiles);
						tile_hash = SparkMD5.ArrayBuffer.hash (
							context.getImageData (
								x * tile_size
								, y * tile_size
								, tile_size
								, tile_size
							)
							.data
						);
						analysis.tileset[tile_hash] = { x: x, y: y };
						analysis.tilemap[x + '/' + y] = { hash: tile_hash };
						if(++i === map_area_in_tiles) {
							clearInterval(interval);
							callback(null, analysis);
							break;
						}
					} while (
						i % hashes_per_event_loop !== 0
					);
				},
				1
			);
		})();
	}
	catch(error) {
		if(log_errors) {
			console.error(error);
		}
		callback(error);
	}
};

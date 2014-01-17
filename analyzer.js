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
window.tilesetting = window.tilesetting || {};
function is_integer(number)
{
	return (number % 1 === 0);
}
tilesetting.analyze_image = function(image, canvas, options, callback)
{
	if(!callback)
	{
		callback = options;
		options = {};
	}
	var tile_size = options.tile_size || 32;
	var log_progress = options.log_progress || true;
	var log_errors = options.log_errors || true;
	var hashes_per_event_loop = options.hashes_per_event_loop || 4;
	try
	{
		canvas.width = image.width;
		canvas.height = image.height;
		var context = canvas.getContext('2d');
		context.drawImage(image, 0, 0);
		var analysis =
		{
			tiles_by_coordinates: {},
			tiles_by_hash: {},
			tile_size: tile_size
		};
		analysis.map_width_in_tiles = canvas.width / tile_size;
		analysis.map_height_in_tiles = canvas.height / tile_size;
		if(!is_integer(analysis.map_width_in_tiles) || !is_integer(analysis.map_height_in_tiles))
		{
			throw new Error("Map width / height must be multiples of tile size.");
		}
		var map_area_in_tiles = analysis.map_width_in_tiles * analysis.map_height_in_tiles;
		var i = 0;
		var interval = setInterval
		(
			function()
			{
				if(log_progress && i % 32 === 0)
				{
					console.log("Hashing tile ", i, "out of", map_area_in_tiles, "...");
				}
				do
				{
					var x = i % analysis.map_width_in_tiles;
					var y = Math.floor(i / analysis.map_width_in_tiles);
					var tile_image_data = context.getImageData
					(
						x * tile_size,
						y * tile_size,
						tile_size,
						tile_size
					);
					var tile_data = tile_image_data.data;
					var tile_hash = SparkMD5.ArrayBuffer.hash(tile_data);
					analysis.tiles_by_coordinates[[x, y].join('/')] = { hash: tile_hash };
					analysis.tiles_by_hash[tile_hash] = { x: x, y: y };
					if(++i === map_area_in_tiles)
					{
						clearInterval(interval);
						callback(null, analysis);
						break;
					}
				} while(i % hashes_per_event_loop !== 0);
			},
			1
		);
	}
	catch(error)
	{
		if(log_errors)
		{
			console.error(error);
		}
		callback(error);
	}
};

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
window.editor = window.editor || {};
(
	function()
	{
		var start_time = performance.now();
		var image = document.images[0];
		var canvas = document.getElementsByTagName('canvas')[0];
		var tile_size = parseInt(canvas.getAttribute('tile-size'));
		if(!tile_size)
		{
			console.error("Invalid tile size: ", tile_size);
			return;
		}
		var tileset_div = document.getElementsByClassName('tileset')[0];
		var tilemap_div = document.getElementsByClassName('tilemap')[0];
		tilesetting.analyze_image
		(
			image,
			canvas,
			{
				tile_size: tile_size
			},
			function(error, analysis)
			{
				if(error)
				{
					return;
				}
				editor.make_tileset(tileset_div, analysis);
				editor.make_tilemap(tilemap_div, analysis);
				console.log
				(
					"Generating tile set & map took",
					(performance.now() - start_time) / 1000,
					"seconds."
				);
			}
		);
	}
)();
function get_tilesetting_data(element)
{
	var $element = jQuery(element);
	var data = $element.data('tilesetting');
	if(!data)
	{
		data = {};
		$element.data('tilesetting', data);
	}
	return data;
}
function make_tileset_setup(tileset_div)
{
	var data = get_tilesetting_data(tileset_div).tileset = {};
	tileset_div.addEventListener
	(
		'click', function(event)
		{
			var target = event.explicitOriginalTarget;
			if(!data.first_tile)
			{
				target.classList.add('selected');
				data.first_tile = target;
			}
			else
			{
				data.first_tile.classList.remove('selected');
				var target_html = target.outerHTML;
				var first_tile_html = data.first_tile.outerHTML;
				target.outerHTML = first_tile_html;
				data.first_tile.outerHTML = target_html;
				data.first_tile = null;
			}
		}
	);
}
editor.make_tileset = function(tileset_div, analysis)
{
	var tileset_div_data = get_tilesetting_data(tileset_div);
	if(!tileset_div_data.tileset)
	{
		make_tileset_setup(tileset_div);
	}
	for(var hash in analysis.tiles_by_hash)
	{
		var tile = analysis.tiles_by_hash[hash];
		var x = (-tile.x * 16) + 'px';
		var y = (-tile.y * 16) + 'px';
		var tile_div = document.createElement('div');
		tile_div.classList.add('tile');
		tile_div.style = 'background-position: ' + [x, y].join(' ') + ';';
		tile_div.id = 'tile-' + hash;
		tileset_div.appendChild(tile_div);
	}
};
editor.make_tilemap = function(tilemap_div, analysis)
{
	for(var coords in analysis.tiles_by_coordinates)
	{
		var hash = analysis.tiles_by_coordinates[coords].hash;
		var tile = analysis.tiles_by_hash[hash];
		var coords_array = coords.split('/');
		var x = (coords_array[0] * analysis.tile_size) + 'px';
		var y = (coords_array[1] * analysis.tile_size) + 'px';
		var tile_div = document.createElement('div');
		tile_div.classList.add('tile');
		tile_div.setAttribute('hash', hash);
		tile_div.style = 
		[
			'left: ' + x,
			'top: ' + y
		].join(';');
		tilemap_div.appendChild(tile_div);
	}
};
dom_control
(
	'.tilemap .tile', function tilemap_tile_handler(event, element, attribute, old_value)
	{
		switch(event)
		{
			case 'exists':
			case 'added':
				var hash = element.getAttribute('hash');
				tilemap_tile_handler('set-attribute', element, 'hash', hash);
				break;
			case 'mutated':
			case 'set-attribute':
				if(attribute !== 'hash')
				{
					break;
				}
				var value = element.getAttribute('hash');
				var tileset_tile = document.getElementById('tile-' + value);
				if(!tileset_tile)
				{
					element.classList.add('bad-hash');
					break;
				}
				element.classList.remove('bad-hash');
				element.style.backgroundPosition = tileset_tile.style.backgroundPosition;
				break;
		}
	}
);
dom_control
(
	'.tileset .tile', function(event, element)
	{
		if(event !== 'removed')
		{
			return;
		}
		var hash = element.id.split('-')[1];
		$('.tilemap .tile[hash="' + hash + '"]').addClass('bad-hash');
	}
);

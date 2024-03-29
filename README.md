# Overview

Map Component for Qodly studio using [leaftletJs](https://leafletjs.com) and [OpenStreetMAp](https://www.openstreetmap.org/#map=6/31.885/-7.080) 

## Map 

The Map Component is designed to provide an interactive and customizable map experience for Qodly studio. Leveraging the power of LeafletJS and OpenStreetMap, it allows you to integrate dynamic maps with ease.

![map](https://github.com/rihab-ze/qodly_map/blob/develop/public/Maps.png)

| Name       | Type             | Description                                       |
| ---------- | ---------------- | ------------------------------------------------- |
| Zoom       | Number           | Initial map zoom level      |
| Map dragging| Boolean       | Whether the map is draggable with mouse/touch or not. |
| Animation  | Boolean          | If true, the map will attempt animating zoom disregarding where zoom origin is. Setting false will make it always reset the view completely without animation |
| Marker     | Boolean          |  If true, it displays an icon on the map |
| Multiple marker     | Boolean          |  If true, it displays all the markers on the map(the properties marker daragging, popup and popup massage are no longer working in this case) |
| Marker dragging| Boolean        | Whether the marker is draggable with mouse/touch or not. |
| Popup      | Boolean          | If true, opens a popup with a given message in the given point on a map. |
| Popup message| string       |  the message that the popup will display. |

### DataSource

| Name       | Type             | Required              | Description                                      |
| ---------- | ---------------- | --------------------- | ------------------------------------------------ |
| Address    | Object           | Yes                   | Will contain the value of Longitude and latitude |
| Address(for multiple markers)    | Array           | Yes                   | Will contain an array comprising longitude and latitude values |

Some example of data that can be used : 
```
{latitude : "31.792305849269",longitude : "-7.080168000000015"}

```
Some example of data if multiple markers is true  : 
```
[{latitude : "31.792305849269",longitude : "-7.080168000000015"},{"latitude":51.505,"longitude":-0.09}]

```

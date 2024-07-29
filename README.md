# Overview

Map Component for Qodly studio using [leaftletJs](https://leafletjs.com) and [OpenStreetMAp](https://www.openstreetmap.org/#map=6/31.885/-7.080)

## Uni marker Map

The Uni-Marker Map Component is a mapping feature designed to display a single marker on a map, typically representing a specific location or point of interest.

![map](https://github.com/rihab-ze/qodly_map/blob/develop/public/Maps.png)

| Name            | Type    | Description                                                                                                                                                   |
| --------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zoom            | Number  | Initial map zoom level                                                                                                                                        |
| Map dragging    | Boolean | Whether the map is draggable with mouse touch or not.                                                                                                         |
| Animation       | Boolean | If true, the map will attempt animating zoom disregarding where zoom origin is. Setting false will make it always reset the view completely without animation |
| Popup           | Boolean | If true, opens a popup with a given message in the given point on the map.                                                                                    |
| Marker dragging | Boolean | Whether the marker is draggable with mouse touch or not.                                                                                                      |
| Longitude       | Text    | The longitude path in the datasource                                                                                                                          |
| Latitde         | Text    | The latitude path in the datasource                                                                                                                           |
| Tooltip         | Text    | The tooltip path in the datasource                                                                                                                            |

### DataSource

| Name       | Type             | Required | Description                                                                                                      |
| ---------- | ---------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| DataSource | Object or Entity | Yes      | Will contain the value of longitude, latitude and the popup message(the popup message has te be an HTML Element) |

Some example of data that can be used in the case of none or one marker :

```
{"latitude" : 31.792305849269,"longitude" : -7.080168000000015}
{"latitude" : 31.792305849269,"longitude" : -7.080168000000015, "popupMessage": '<div><p>This is your location</p></div>' }

```

Some example of data in the case of multiple markers :

```
[{latitude : "31.792305849269",longitude : "-7.080168000000015"},{"latitude":51.505,"longitude":-0.09, "popupMessage": '<div><p>This is your location</p></div>'},...]

```

### Custom Css

When customizing the appearance of the map, you have access to the popup message classe :
![map](https://github.com/rihab-ze/qodly_map/blob/develop/public/customCssPopup.png)

## Uni marker Map

The Multi-Marker Map Component is a feature commonly used in mapping applications to display multiple markers on a single map. It provides a way to visualize various points of interest, locations, or data points on a geographic map.

| Name                  | Type    | Description                                                                                                                                                   |
| --------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zoom                  | Number  | Initial map zoom level                                                                                                                                        |
| Map dragging          | Boolean | Whether the map is draggable with mouse touch or not.                                                                                                         |
| Animation             | Boolean | If true, the map will attempt animating zoom disregarding where zoom origin is. Setting false will make it always reset the view completely without animation |
| Popup                 | Boolean | If true, opens a popup with a given message in the given point on the map.                                                                                    |
| Marker group distance | number  | the distance between the markers of the created group (in Km)                                                                                                 |
| Longitude             | Text    | The longitude path in the datasource                                                                                                                          |
| Latitde               | Text    | The latitude path in the datasource                                                                                                                           |
| Tooltip               | Text    | The tooltip path in the datasource                                                                                                                            |

### DataSource

| Name       | Type                     | Required | Description                                                                                                      |
| ---------- | ------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------- |
| DataSource | Array or EntitySelection | Yes      | Will contain the value of longitude, latitude and the popup message(the popup message has te be an HTML Element) |

Some example of data in the case of Array satasource:

```
[{"latitude" : 31.792305849269,"longitude" : -7.080168000000015},{"latitude":51.505,"longitude":-0.09, "popupMessage": '<div><p>This is your location</p></div>'},...]

```

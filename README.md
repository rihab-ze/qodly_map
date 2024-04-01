# Overview

Map Component for Qodly studio using [leaftletJs](https://leafletjs.com) and [OpenStreetMAp](https://www.openstreetmap.org/#map=6/31.885/-7.080) 

## Map 

The Map Component is designed to provide an interactive and customizable map experience for Qodly studio. Leveraging the power of LeafletJS and OpenStreetMap, it allows you to integrate dynamic maps with ease.

![map](https://github.com/rihab-ze/qodly_map/blob/develop/public/Maps.png)

| Name       | Type             | Description                                       |
| ---------- | ---------------- | ------------------------------------------------- |
| Zoom       | Number           | Initial map zoom level      |
| Map dragging| Boolean       | Whether the map is draggable with mouse touch or not. |
| Animation  | Boolean          | If true, the map will attempt animating zoom disregarding where zoom origin is. Setting false will make it always reset the view completely without animation |
| Marker types| String        | Defines the marker type and can be one of the following values: none, single and multiple. The default value is "none", indicating that the marker will be invisible. |
| Popup      | Boolean          | If true, opens a popup with a given message in the given point on the map. |
| Single marker dragging | Boolean        | Whether the marker is draggable with mouse touch or not. |
| Marker group distance | number          | the distance between the markers of the created group (in Km)  |

### DataSource

| Name       | Type             | Required              | Description                                      |
| ---------- | ---------------- | --------------------- | ------------------------------------------------ |
| Address(Marker types : none or one)      | Object           | Yes                   | Will contain the value of longitude, latitude and the popup message(the popup message has te be an HTML Element) |
| Address(Marker types : multiple)    | Array           | Yes                   | Will contain an array comprising longitude, latitude and popup message values |

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

Copy inputs from the `preset` folder into here<br />
Or create your own for a different game<br />
Name the file after the game for which you want the inputs<br />
For example "M&M's_Kart_Racing.json"<br />
Do not edit the files inside of the `preset` folder!<br />

Example:

```json
{
  "config": {
    "WINDOW": ["Window", "title"],
    "TIMED_MODE": true,
    "TIMED_ON_INPUT": true,
    "INTERVAL": 2,
    "TIMEOUT": 2,
    "OBS": "left"
  },
  "inputs": [
    {
      "name": "walk forward",
      "inputs": ["walk", "go", "w", "forward"],
      "outputs": ["W"],
      "time": [1]
    },
    {
      "name": "look up",
      "inputs": ["look up", "mouse up"],
      "outputs": ["up(100)"],
      "time": [0]
    },
    {
      "name": "look left",
      "inputs": ["look left", "mouse left"],
      "outputs": ["left(100)", "W"],
      "time": [0, 1]
    },
    {
      "name": "say hello",
      "inputs": ["hello"],
      "outputs": ["type(hello)"],
      "time": [0]
    }
  ]
}
```

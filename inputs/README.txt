Copy inputs from the "preset" folder into here
Or create your own for a different game
Name the file after the game for which you want the inputs
For example "M&M's_Kart_Racing.json"

Do not edit the files inside of the "preset" folder!!
Or any other file outside of the ones you created like above.

Structure:

{
  "config": {
    "WINDOW": ["Window", "title],
    "TIMED_MODE": true,
    "TIMED_ON_INPUT": true,
    "INTERVAL": 2,
    "TIMEOUT": 2,
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
      "inputs": ["look up", "up", "mouse up"],
      "outputs": ["up(10)"],
      "time": [0]
    },
    {
      "name": "look left",
      "inputs": ["look up", "up", "mouse up"],
      "outputs": ["left(10)"],
      "time": [0]
    },
  ]
}

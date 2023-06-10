Copy inputs from the "preset" folder into here
Or create your own for a different game
Name the file after the game for which you want the inputs
For example "M&M's_Kart_Racing.json"

Do not edit the files inside of the "preset" folder!!
Or any other file outside of the ones you created like above.

Structure:

{
  "config": {
    "WINDOW": ["Window", "title", "must", "have", "these", "words", "in order", "to", "be", "outputted"],
    "TIMED_MODE": true,
    "INTERVAL": 2,
    "TIMEOUT": 2,
  },
  "inputs": [
    {
      "name": "drive",
      "inputs": ["drive", "forward", "w", "go", "d"],
      "outputs": "Num2",
      "time": 0.7
    },
    {
      "name": "brake",
      "inputs": ["brake", "b", "stop"],
      "outputs": "A",
      "time": 1
    },
    {
      "name": "reverse",
      "inputs": ["back", "backward", "s", "reverse"],
      "outputs": "B",
      "time": 2
    },
    {
      "name": "small left",
      "inputs": ["sl", "slight left", "small left"],
      "outputs": "LeftBracket",
      "time": 0.3
    },
    {
      "name": "small right",
      "inputs": ["sr", "slight right", "small right"],
      "outputs": "RightBracket",
      "time": 0.3
    },
    {
      "name": "left",
      "inputs": ["l", "left"],
      "outputs": "LeftBracket",
      "time": 0.7
    },
    {
      "name": "right",
      "inputs": ["r", "right"],
      "outputs": "RightBracket",
      "time": 0.7
    },
    {
      "name": "big left",
      "inputs": ["bl", "big left", "big l"],
      "outputs": "LeftBracket",
      "time": 1.2
    },
    {
      "name": "big right",
      "inputs": ["br", "big right", "big r"],
      "outputs": "RightBracket",
      "time": 1.2
    }
  ]
}

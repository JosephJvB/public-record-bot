# live discord updates from google form & google sheet

## current:
- WEBPAGE:
  - preview gif.
    - iframes are hard, janky string matching: https://{}
    - youtu.be/{id} -> www.youtube.com/embed/{id}
    - www.youtube.com/watch?v={id} -> www.youtube.com/embed/{id}
    - gfycat.com/{id} -> gfycat.com/ifr/{id}
    - streamable.com/{id} - streamable/s/{id}
    - clips.twitch.tv/{id} -> clips.twitch.tv/embed?clip={id}


### todo:
- refactor `./handle-input/discord-message.js`
	- maybe I need a 'respondInXChannel' function...
- Users link their twitch account: When they go live, post in promo channel

### warning:
- If a user deletes their message, bot will error trying to access that message.
  - msg: "DiscordAPIError: Unknown Message"
  - cant think of a nice way to do "access message if exists"
  - if statements before every message['property']?? gross
  - good to think about anyway
- Im using google api v3 - legacy. Current is v4.
- Why? based my api off npm google-spreadsheet
- google-spreadsheet was built with v3
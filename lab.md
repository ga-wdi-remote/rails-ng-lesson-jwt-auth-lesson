# Lab Finish the Giphy's!

You've worked with this code a lot over the last month.

You've replaced the backend which was originally, Node/Express and Mongo with Rails and PG.

You've also switched the authentication strategy from sessions to Json Web Tokens.

Pretty Slick!

But it's not done yet.

You still need to Build the Gif saving functionality and managing current_user on the front end

## You'll need to:

1. Analyze how the front-end currently expects to work. It's built to work with a MEAN app which isn't quite right anymore.

  - What are the pieces you need to add?

  - What are the pieces you need to change?

2. What data is the front end passing?

3. Build the Rails API (aka controller/router) and model for Gifs

4. Connect that API to the front end based on the specifications you documented in Step 1.

## BONUS:

Can you refactor the `$http` request to the Giphy API so the request happens on the backend using `httparty`

- https://github.com/jnunemaker/httparty
- http://blog.teamtreehouse.com/its-time-to-httparty

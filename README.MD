# Chibisafe Discord Bot

## What is Chibisafe?

Chibisafe is a file uploader service written in node that aims to to be easy to use and easy to set up. It's easy to use, easy to deploy, free and open source. It accepts files, photos, documents, anything you imagine and gives you back a shareable link for you to send to others.

Check out the official repo https://github.com/chibisafe/chibisafe

## What is this bot?

This bot is a discord bot that allows you to connect to your or anyone elses chibisafe instance (That you have access too) and will send you a message when a new file is uploaded to your instance. From there you can add it to albums, delete it, or just view it. You can also view your files and page through them.

### Current Features
- Message on new file uploaded
- View files
- Delete files
- Add files to albums

### Planned Features
- View albums
- Create albums
- Delete albums
- Create album links
- Upload files
- Multi-user support*
- Multi-instance support*

And generally most of the features that chibisafe has in someway or another.

\* = This is a maybe, I'm not sure if I want to do this yet.

## How do I use it?

There are 2 ways to use this, you can either deploy it using the prebuilt docker image, or you can build it yourself.

### Docker

The docker image is available on ghcr at `lostanddead/chibisafe-bot`. You can run it with the following command:

```yml
version: "3.9"

services:
  chibisafe-bot:
    image: ghcr.io/lostanddead/chibisafe-bot:main
    container_name: chibisafe-bot
    restart: unless-stopped
    environment:
      - TOKEN=(YOUR BOT TOKEN)
      - API_KEY=(YOUR API KEY)
      - API_URL=(YOUR URL, can be docker hosts IP or domain)
      - FRIENDLY_URL=(YOUR FRIENDLY URL, can be domain or IP)
      - CLIENT_ID=(YOUR BOT USER ID)
      - USER_ID=(YOUR USER ID, This is who the bot will send the messages too)
```

or you can build it yourself locally using the included docker-compose file as a example.

It can also just be ran using node, to do this you need to have node v18 + npm installed and run `npm install` and then `npm start` in the root directory.
You will also need a .env file with the same variables as the docker-compose file.

## Contributing

If you want to contribute to this project, feel free to open a issue or a pull request. I'm always open to suggestions and improvements.
Honestly go nuts, I just made this for myself and I'm not sure if anyone else will use it, but if you do, I'm happy to help.

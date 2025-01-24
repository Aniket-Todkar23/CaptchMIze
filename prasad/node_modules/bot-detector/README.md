# bot-detector

Bot Detector is a simple npm plugin that fetches the list of bot user-agents from http://www.user-agents.org/allagents.xml .  It will return true if the string is a bot or false if it is not.

On require, it loads the XML from a local file.  On require, it will also spit out a debug message listing the number of bots loaded.  If there are no bots loaded from the botlist, it will throw a warning message.

## Usage

    var botDetect = require('botDetect');
    botDetect.isBot('user agent string');

## Updating bot list

To update the list of bots from www.user-agents.org, just run the following command:

    grunt updateBotList

## License ##

bot-detector is licensed under ISC.

## About ##

bot-detector was developed by the team at [Wedgies](http://www.wedgies.com).

Wedgies is a digital survey platform that gives media, journalists and brands in-line survey capabilities inside social media, their website, and their apps — where they can collect millions of opinions from their readers and users. Wedgies is the leading social survey platform that enables publishers to collect survey respondents directly within social media streams.

Wedgies, a darling of Tony Hsieh’s Las Vegas’ Vegas Tech Fund, is backed by an all-star list of investors including Greycroft, Advancit Capital, MESA Ventures, Knight Foundation, kbs+ Ventures, Battle Born Ventures, Twilio, 500 Startups and SV Angel.

Wedgies founding team consists of top talent in developer tools and community management with experience that includes Zappos.com, Overstock.com, and Backcountry.com.

[![Built with Wedgies](https://d3v9r9uda02hel.cloudfront.net/production/1.55.17/img/built-with-wedgies.png)](http://wedgies.com)

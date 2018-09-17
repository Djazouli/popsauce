// ==UserScript==
// @name        PopSauce
// @namespace   Iterer
// @description A PopSauce simple cheat.
// @author      Geoffrey Migliacci
// @version     0.1
// @encoding    utf-8
// @license     https://raw.githubusercontent.com/yerffeog/PopSauce/master/LICENSE
// @icon        https://github.com/yerffeog/PopSauce/raw/master/PopSauce.png
// @homepage    https://github.com/yerffeog/PopSauce
// @twitterURL  https://twitter.com/yerffeog
// @supportURL  https://github.com/yerffeog/PopSauce/issues
// @updateURL   https://raw.githubusercontent.com/yerffeog/PopSauce/master/PopSauce.js
// @downloadURL https://raw.githubusercontent.com/yerffeog/PopSauce/master/PopSauce.js
// @match       http://popsauce.sparklinlabs.com/play/*
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/jshashes/1.0.7/hashes.min.js
// @grant       none
// @run-at      document-idle
// ==/UserScript==

$(document).on('keypress', function (e) {
    if (channel.hasOwnProperty('data')) {
        if (e.which === 178) {
            var CHALLENGES = localStorage.getItem('PopSauce') === null ? {} : JSON.parse(localStorage.getItem('PopSauce'));
            var GUESS = undefined;

            $('.Scoreboard:first').append('<a href="#" id="Source"></a>');
            $('#Source').on('click', function (e) {
                e.preventDefault();

                if (GUESS) {
                    channel.socket.emit('guess', GUESS.source);
                }
            });

            $(window).bind('storage', function (e) {
                if (e.originalEvent.key === 'PopSauce') {
                    CHALLENGES = localStorage.getItem('PopSauce') === null ? {} : JSON.parse(localStorage.getItem('PopSauce'));
                }
            });

            channel.socket.on('challenge', function (a) {
                if (CHALLENGES.hasOwnProperty(channel.data.challenge.category)) {
                    var QUOTE = channel.data.challenge.hasOwnProperty('quote') && channel.data.challenge.quote.length ? new Hashes.SHA512().hex(channel.data.challenge.quote) : '';
                    var IMAGE = channel.data.challenge.hasOwnProperty('image') && channel.data.challenge.image.length ? new Hashes.SHA512().hex(channel.data.challenge.image) : '';

                    GUESS = CHALLENGES[channel.data.challenge.category].find(function (a) {
                        return (channel.data.challenge.quote && channel.data.challenge.quote.length && QUOTE.length && QUOTE === a.quote) ||
                            (channel.data.challenge.image && channel.data.challenge.image.length && IMAGE.length && IMAGE === a.image);
                    });

                    if (GUESS) {
                        $('#Source').text(GUESS.source.toUpperCase());
                    }
                    else {
                        $('#Source').text('UNDEFINED');
                    }
                }
            });

            channel.socket.on('roundEnded', function (a) {
                if (CHALLENGES.hasOwnProperty(channel.data.challenge.category)) {
                    var QUOTE = channel.data.challenge.hasOwnProperty('quote') && channel.data.challenge.quote.length ? new Hashes.SHA512().hex(channel.data.challenge.quote) : '';
                    var IMAGE = channel.data.challenge.hasOwnProperty('image') && channel.data.challenge.image.length ? new Hashes.SHA512().hex(channel.data.challenge.image) : '';

                    GUESS = CHALLENGES[channel.data.challenge.category].find(function (a) {
                        return (channel.data.challenge.quote && channel.data.challenge.quote.length && QUOTE.length && QUOTE === a.quote) ||
                            (channel.data.challenge.image && channel.data.challenge.image.length && IMAGE.length && IMAGE === a.image);
                    });

                    if (!GUESS) {
                        CHALLENGES[channel.data.challenge.category].push({ quote: channel.data.challenge.hasOwnProperty('quote') && channel.data.challenge.quote.length ? new Hashes.SHA512().hex(channel.data.challenge.quote) : '', image: channel.data.challenge.hasOwnProperty('image') && channel.data.challenge.image.length ? new Hashes.SHA512().hex(channel.data.challenge.image) : '', source: a.source });
                    }
                }
                else {
                    CHALLENGES[channel.data.challenge.category] = [];
                    CHALLENGES[channel.data.challenge.category].push({ quote: channel.data.challenge.hasOwnProperty('quote') && channel.data.challenge.quote.length ? new Hashes.SHA512().hex(channel.data.challenge.quote) : '', image: channel.data.challenge.hasOwnProperty('image') && channel.data.challenge.image.length ? new Hashes.SHA512().hex(channel.data.challenge.image) : '', source: a.source });
                }

                localStorage.setItem('PopSauce', JSON.stringify(CHALLENGES));
            });

            $(document).unbind('keypress');
        }
    }
});
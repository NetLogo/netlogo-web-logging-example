Just run `npm install`, then `npm exec http-server`, and then browse to `http://localhost:8080/views/sample.html` to test it out.

The code is really what's of interest.  It's not at all fancy, it doesn't even use ES6 modules, it just reads in the scripts as HTML elements.  But it should show how you can split up your logging code from the page presentation HTML.  There are only a few points of interest:

- [The `sample.html` page](https://github.com/LaCuneta/netlogo-web-logging-example/blob/main/views/sample.html) is the entry point.  It's where we load our model in an iframe, wire up our message passing, and use the `relayIframeEvents` query string.
- [The `logging.js` script](https://github.com/LaCuneta/netlogo-web-logging-example/blob/main/src/logging.js) is where we put most of our actual model logging logic.
- [The `query-maker.js` script](https://github.com/LaCuneta/netlogo-web-logging-example/blob/main/src/query-maker.js) is adapted from a similar one in Galapagos, and is used to simplify the process of making queries against the model in the iframe.

## Logging Events

To enable logging, we have to add `relayIframeEvents` to our `iframe` query string.  This makes sure all logged events are passed back to the parent frame that we control so we can actually do something with them in JavaScript.  By default everything is relayed, but that will probably generate events that aren't wanted.  You can restrict them to certain events with a comma-seperated string, like `relayIframeEvents=model-load,session-loop-started,button-widget-clicked`.

The full list of events and the extra data (`eventArgs` in the actual message) they'll bring along is [in the `listener-events.coffee` file](https://github.com/NetLogo/Galapagos/blob/master/app/assets/javascripts/notifications/listener-events.coffee).  Documentation for the events is poor, but firing up the browser's web developer console and interacting with a model is a good way to see what they look like.  This example logs all events by default.

## Queries

If you want to get data from a running model, use queries.  If you run a model page in an `iframe`, if will automatically activate an iframe query listener that will answer back.  All you need to do is add a query maker.  You can copy [the `debug-query-maker.coffee` from Galapagos](https://github.com/NetLogo/Galapagos/blob/master/app/assets/javascripts/queries/debug-query-maker.coffee) as we did in this example.

Queries let you get data only at certain times, say when a user clicks a button widget in the model, and also let you get at in-model data that events don't yet cover (like turtles, patches, globals, etc).  The best listing of things that can be queried is in [the `iframe-query-handler.coffee` from Galapagos](https://github.com/NetLogo/Galapagos/blob/master/app/assets/javascripts/queries/iframe-query-handler.coffee).

Query responses are asynchronous with the model, meaning if you send a query after receiving an event, other things can have occured in the model in the meantime.  Practially it's unlikely this will be too big of a deal unless you need millisecond precision in the query results.

To make sure the query response you receive is the one you expected, add a `sourceInfo` property to your query data and it will be returned with the response.

You can actually make multiple queries with a single message to the model to ensure that all query results are generated simultaneously.  The basic query maker in this example just sends a single query for simplicity.  It shouldn't be too hard to extend it.

I should point out that this kind of query making is only 100% needed if you are running your models through an iframe that is loading a source file on a different domain.  If both the host page of the iframe and the model are on the same host, you can actually directly query the model state.  But the query setup might still might be more convenient, since it was created for this purpose. 

## What to Do With It?

This example just collects some info from events and queries and prints it back to an element on the screen.  For true logging that information would need to be passed to a web service, database, or similar end point in order to be recorded permanently.  This is left as an exercise for the reader, as it will heavily depend on the end point being used.

One thing to point out, though, is that NLW doesn't generate any kind of unique ID for the user.  If you want to collect logs and know who they are from you'll need some way to identify the user generating them, and possibly also some kind of "session" ID so you can differentiate when they start and stop their interaction with a model.
